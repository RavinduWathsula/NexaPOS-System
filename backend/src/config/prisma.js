import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

export default prisma

export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to MySQL Database (nexapos_db) successfully.')
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message)
    throw error
  }
}

