/**
 * NexaPOS PM2 Production Process Configuration
 * Usage:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 restart ecosystem.config.cjs
 *   pm2 status
 */
module.exports = {
  apps: [
    {
      name: 'nexapos-api',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
}

