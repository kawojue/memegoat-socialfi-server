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
        this.prisma = new PrismaService

        this.twit = new TwitterApi(`${process.env.X_BEARER_TOKEN}`)
        this.x = this.twit.readOnly
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async metrics() {
        try {
            const users = await this.prisma.user.findMany()

            if (users.length === 0) return

            for (const user of users) {
                const { data: { data: tweets } } = await this.x.v2.userTimeline(user.profileId, {
                    max_results: 100,
                    expansions: 'referenced_tweets.id',
                    'tweet.fields': 'public_metrics',
                })

                for (const { id, public_metrics, text, referenced_tweets } of tweets) {
                    if (text.includes('@GoatCoinSTX') || text.toLowerCase().includes('$goat')) {
                        let referenced = false

                        if (referenced_tweets) {
                            for (const { id } of referenced_tweets) {
                                const { data } = await this.x.v2.singleTweet(id, {
                                    'tweet.fields': 'author_id'
                                })

                                if (data.author_id === "1163109596610928641") {
                                    referenced = true
                                }
                            }
                        }

                        const existingTweet = await this.prisma.tweet.findUnique({
                            where: { postId: id },
                        })

                        if (existingTweet) {
                            if (public_metrics.impression_count > existingTweet.impression) {
                                await this.prisma.tweet.update({
                                    where: { postId: id },
                                    data: {
                                        referenced,
                                        like: public_metrics.like_count,
                                        reply: public_metrics.reply_count,
                                        quote: public_metrics.quote_count,
                                        retweet: public_metrics.retweet_count,
                                        impression: public_metrics.impression_count,
                                    },
                                })
                            }
                        } else {
                            await this.prisma.tweet.create({
                                data: {
                                    postId: id,
                                    referenced,
                                    like: public_metrics.like_count,
                                    reply: public_metrics.reply_count,
                                    quote: public_metrics.quote_count,
                                    retweet: public_metrics.retweet_count,
                                    impression: public_metrics.impression_count,
                                    user: { connect: { id: user.id } }
                                },
                            })
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err)
            throw new HttpException('Task is down', StatusCodes.InternalServerError)
        }
    }
}