import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { HttpException, Injectable } from '@nestjs/common'
import { TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2'

@Injectable()
export class TaskService {
    private prisma: PrismaService
    private readonly twit: TwitterApi
    private readonly x: TwitterApiReadOnly

    constructor() {
        this.prisma = new PrismaService()
        this.twit = new TwitterApi(`${process.env.X_BEARER_TOKEN}`)
        this.x = this.twit.readOnly
    }

    @Cron(CronExpression.EVERY_HOUR)
    async metrics() {
        try {
            const settings = await this.prisma.settings.findFirst()
            if (settings.hasTurnedOffCampaign) return

            const users = await this.prisma.user.findMany()
            if (users.length === 0) return

            await Promise.all(users.map(async (user) => {
                const { data: { data: tweets } } = await this.x.v2.userTimeline(user.profileId, {
                    max_results: 20,
                    expansions: 'referenced_tweets.id',
                    'tweet.fields': 'author_id,public_metrics,created_at',
                })

                const tweetIds = tweets.map(tweet => tweet.id)
                const existingTweets = await this.prisma.tweet.findMany({
                    where: { postId: { in: tweetIds } },
                })
                const existingTweetMap = new Map(existingTweets.map(tweet => [tweet.postId, tweet]))

                const tweetPromises = tweets.map(async ({
                    id, author_id, text, created_at,
                    referenced_tweets, public_metrics,
                }) => {
                    const tags = settings.tags.map((tag) => tag.toLowerCase().trim())
                    const containsTag = tags.some(tag => text.toLowerCase().trim().includes(tag))

                    if (containsTag) {
                        let referenced = false
                        if (author_id !== settings.profileId && referenced_tweets) {
                            referenced = await this.checkReferencedTweets(referenced_tweets, user.profileId, settings.profileId)
                        }

                        const tweetData = {
                            referenced,
                            like: public_metrics.like_count,
                            reply: public_metrics.reply_count,
                            quote: public_metrics.quote_count,
                            retweet: public_metrics.retweet_count,
                            impression: public_metrics.impression_count,
                            postedAt: created_at ? new Date(created_at) : undefined,
                        }

                        const existingTweet = existingTweetMap.get(id)
                        if (existingTweet) {
                            await this.prisma.tweet.update({
                                where: { postId: id },
                                data: tweetData,
                            })
                        } else {
                            await this.prisma.tweet.create({
                                data: {
                                    ...tweetData,
                                    postId: id,
                                    user: { connect: { id: user.id } },
                                },
                            })
                        }
                    }
                })

                await Promise.all(tweetPromises)
            }))

            const now = new Date()
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

            await this.prisma.user.updateMany({
                where: {
                    useRef: false,
                    createdAt: {
                        lte: twentyFourHoursAgo,
                    },
                },
                data: { useRef: true }
            })
        } catch (err) {
            console.error(err)
            throw new HttpException('Task is down', StatusCodes.InternalServerError)
        }
    }

    private async checkReferencedTweets(referenced_tweets: any[], userProfileId: string, settingsProfileId: string): Promise<boolean> {
        for (const { id } of referenced_tweets) {
            const { data } = await this.x.v2.singleTweet(id, {
                'tweet.fields': 'author_id',
                expansions: 'referenced_tweets.id',
            })
            if (data.author_id === settingsProfileId) {
                return true
            }
            if (data.referenced_tweets) {
                const nestedReferenced = await this.checkReferencedTweets(data.referenced_tweets, userProfileId, settingsProfileId)
                if (nestedReferenced) {
                    return true
                }
            }
        }
        return false
    }
}
