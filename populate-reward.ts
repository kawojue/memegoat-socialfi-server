import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const populateReward = async () => {
    const TOTAL_ALLOCATION = 20_000_000

    const now = new Date()
    const settings = await prisma.settings.findFirst()
    const { days, hasTurnedOffCampaign, campaignedAt } = settings

    if (!campaignedAt || hasTurnedOffCampaign) return

    const campaignEndDate = new Date(campaignedAt)
    campaignEndDate.setDate(campaignEndDate.getDate() + days)

    if (now > campaignEndDate) return

    const daysAgo = new Date(now)
    daysAgo.setDate(now.getDate() - days)

    const users = await prisma.user.findMany({
        where: {
            NOT: [
                { username: { equals: 'devcoinstx', mode: 'insensitive' } },
                { username: { equals: 'goatcoinstx', mode: 'insensitive' } },
            ]
        },
        select: {
            id: true,
            refPoint: true,
            tweets: {
                where: {
                    postedAt: {
                        gte: daysAgo,
                        lte: now,
                    },
                },
            },
            avatar: true,
            username: true,
            displayName: true,
        },
    })

    let leaderboardData = []

    for (const user of users) {
        let impressions = user.refPoint

        for (const tweet of user.tweets) {
            impressions +=
                tweet.like +
                tweet.retweet +
                tweet.reply +
                tweet.impression +
                tweet.quote
        }

        if (impressions > 0) {
            leaderboardData.push({
                impressions,
                id: user.id,
                avatar: user.avatar,
                username: user.username,
                tweets: user.tweets.length,
                displayName: user.displayName,
            })
        }
    }

    const totalPoints = leaderboardData.reduce((acc, user) => {
        return acc + user.impressions
    }, 0)

    for (const ldb of leaderboardData) {
        await prisma.reward.create({
            data: {
                earn: Math.floor((ldb.impressions / totalPoints) * TOTAL_ALLOCATION),
                user: { connect: { id: ldb.id } }
            }
        })
    }

    console.log("Gracias!")
}

populateReward()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    }).finally(async () => {
        await prisma.$disconnect()
    })