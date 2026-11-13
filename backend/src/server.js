import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { connectDatabase, prisma } from './config/prisma.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { errorResponse } from './utils/apiResponse.js'

const app = express()

// Security & Utility Middlewares
app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || env.CORS_ORIGIN.includes(origin)) {
        return callback(null, true)
      }
      return callback(null, true) // Permissive for local dev testing
    },
    credentials: true,
  })
)

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Mount Central REST API Router
app.use('/api', routes)

// Fallback for Unknown API Endpoints
app.use('/api/*', (req, res) => {
  return errorResponse(res, `API route not found: ${req.method} ${req.originalUrl}`, 404)
})

// Centralized Error Handling Middleware
app.use(errorHandler)

// Initialize Database & Start Server
async function startServer() {
  try {
    await connectDatabase()

    const server = app.listen(env.PORT, () => {
      console.log(`
🚀 NexaPOS Backend Server Running!
📡 Environment : ${env.NODE_ENV}
🌐 Port        : ${env.PORT}
🔗 Health Check: http://localhost:${env.PORT}/api/health
🏪 Store       : ${env.STORE_NAME} (${env.DEFAULT_CURRENCY})
      `)
    })

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`)
      server.close(async () => {
        await prisma.$disconnect()
        console.log('🔌 Database disconnected. Process terminated.')
        process.exit(0)
      })
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (error) {
    console.error('❌ Server startup error:', error)
    process.exit(1)
  }
}

startServer()

export default app

