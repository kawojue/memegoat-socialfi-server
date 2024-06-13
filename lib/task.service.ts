import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { HttpException, Injectable } from '@nestjs/common'
import { TwitterApi, TwitterApiReadOnly, ReferencedTweetV2 } from 'twitter-api-v2'

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

    // @Cron(CronExpression.EVERY_MINUTE)
    async metrics() {
        try {
            const settings = await this.prisma.settings.findFirst()
            if (settings.hasTurnedOffCampaign) return

            const users = await this.prisma.user.findMany()
            if (users.length === 0) return

            const campaignStartDate = settings.campaignedAt
            const campaignExpiryDate = new Date(campaignStartDate)
            campaignExpiryDate.setDate(campaignStartDate.getDate() + settings.days)

            await Promise.all(users.map(async (user) => {
                const { data: { data: tweets } } = await this.x.v2.userTimeline(user.profileId, {
                    max_results: 50,
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
                    const tweetCreatedAt = new Date(created_at)
                    if (tweetCreatedAt < campaignStartDate || tweetCreatedAt > campaignExpiryDate) {
                        return
                    }

                    const tags = settings.tags.map((tag) => tag.toLowerCase().trim())
                    const containsTag = tags.some(tag => text.toLowerCase().trim().includes(tag))

                    if (containsTag) {
                        let referenced = false
                        if (author_id !== settings.profileId && referenced_tweets) {
                            referenced = await this.checkReferencedTweets(referenced_tweets, settings.profileId)
                        }

                        const tweetData = {
                            referenced,
                            postedAt: tweetCreatedAt,
                            like: public_metrics.like_count,
                            reply: public_metrics.reply_count,
                            quote: public_metrics.quote_count,
                            retweet: public_metrics.retweet_count,
                            impression: public_metrics.impression_count,
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
        } catch (err) {
            console.error(err)
            throw new HttpException('Task is down', StatusCodes.InternalServerError)
        }
    }

    private async checkReferencedTweets(referenced_tweets: ReferencedTweetV2[], settingsProfileId: string): Promise<boolean> {
        const tweetIds = referenced_tweets.map(tweet => tweet.id)
        const tweetChunks = this.chunkArray(tweetIds, 100)

        for (const chunk of tweetChunks) {
            const { data: tweets } = await this.x.v2.tweets(chunk, {
                expansions: 'referenced_tweets.id',
                'tweet.fields': 'author_id',
            })

            for (const tweet of tweets) {
                if (tweet.author_id === settingsProfileId) {
                    return true
                }
                if (tweet.referenced_tweets) {
                    const nestedReferenced = await this.checkReferencedTweets(tweet.referenced_tweets, settingsProfileId)
                    if (nestedReferenced) {
                        return true
                    }
                }
            }
        }
        return false
    }

    // @Cron(CronExpression.EVERY_MINUTE)
    async processExistingTweets() {
        try {
            const settings = await this.prisma.settings.findFirst()
            if (settings.hasTurnedOffCampaign) return

            const campaignStartDate = settings.campaignedAt
            const campaignExpiryDate = new Date(campaignStartDate)
            campaignExpiryDate.setDate(campaignStartDate.getDate() + settings.days)

            const existingTweets = await this.prisma.tweet.findMany({
                where: {
                    referenced: false,
                    postedAt: {
                        gte: campaignStartDate,
                        lte: campaignExpiryDate,
                    }
                },
                select: { postId: true, postedAt: true }
            })

            if (existingTweets.length === 0) return

            const tweetIds = existingTweets.map(tweet => tweet.postId)
            const tweetChunks = this.chunkArray(tweetIds, 100)

            for (const chunk of tweetChunks) {
                const { data: tweets } = await this.x.v2.tweets(chunk, {
                    expansions: 'referenced_tweets.id',
                    'tweet.fields': 'author_id,public_metrics,created_at',
                })

                const updatePromises = tweets.map(async (tweet) => {
                    if (tweet.referenced_tweets) {
                        const referenced = await this.checkReferencedTweets(tweet.referenced_tweets, settings.profileId)
                        if (referenced) {
                            await this.prisma.tweet.update({
                                where: { postId: tweet.id },
                                data: { referenced },
                            })
                        }
                    }
                })

                await Promise.all(updatePromises)
            }
        } catch (err) {
            console.error(err)
            throw new HttpException('Process existing tweets task failed', StatusCodes.InternalServerError)
        }
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunkedArr: T[][] = []
        for (let i = 0; i < array.length; i += size) {
            chunkedArr.push(array.slice(i, i + size))
        }
        return chunkedArr
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async updateReferral() {
        try {
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
            throw new HttpException('Update referral task failed', StatusCodes.InternalServerError)
        }
    }
}

