const fs = require('fs')
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// const seeder = async () => {
//     try {
//         const tvl = await prisma.tVL.findMany()
//         const lockerData = await prisma.lockerData.findMany()
//         const usdRecords = await prisma.uSDRecords.findMany()

//         const replacer = (key, value) =>
//             typeof value === 'bigint' ? Number(value) : value

//         fs.writeFileSync('tvl.json', JSON.stringify(tvl, replacer, 2), 'utf-8')
//         fs.writeFileSync('lockData.json', JSON.stringify(lockerData, replacer, 2), 'utf-8')
//         fs.writeFileSync('usdRecords.json', JSON.stringify(usdRecords, replacer, 2), 'utf-8')
//         console.log('Saved')
//     } catch (error) {
//         console.error('Error fetching users or writing to file:', error)
//     } finally {
//         await prisma.$disconnect()
//     }
// }

// seeder()


// const saveDataFromJson = async () => {
//     try {
//         const tvl = JSON.parse(fs.readFileSync('tvl.json', 'utf-8'))
//         const lockerData = JSON.parse(fs.readFileSync('lockData.json', 'utf-8'))
//         const usdRecords = JSON.parse(fs.readFileSync('usdRecords.json', 'utf-8'))

//         for (const _tvl of tvl) {
//             const { id, ...rest } = _tvl
//             await prisma.tVL.create({
//                 data: { ...rest }
//             })
//         }

//         for (const locker_data of lockerData) {
//             const { id, ...rest } = locker_data
//             await prisma.lockerData.create({
//                 data: { ...rest }
//             })
//         }

//         for (const usdRecord of usdRecords) {
//             const { id, ...rest } = usdRecord
//             await prisma.uSDRecords.create({
//                 data: { ...rest }
//             })
//         }

//         console.log('Data saved')
//     } catch (error) {
//         console.error('Error reading or saving data:', error)
//     } finally {
//         await prisma.$disconnect()
//     }
// }

// saveDataFromJson()