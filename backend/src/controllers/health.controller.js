import { prisma } from '../config/prisma.js'

export async function checkHealth(req, res) {
  const startTime = Date.now()
  let dbStatus = 'healthy'
  let dbLatency = 0

  try {
    await prisma.$queryRaw`SELECT 1;`
    dbLatency = Date.now() - startTime
  } catch (err) {
    dbStatus = `unhealthy: ${err.message}`
  }

  const isHealthy = dbStatus === 'healthy'

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'NexaPOS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      engine: 'MySQL',
      name: 'nexapos_db',
      status: dbStatus,
      latencyMs: dbLatency,
    },
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
  })
}

