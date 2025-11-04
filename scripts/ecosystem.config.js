module.exports = {
  apps: [{
    name: 'playwright-tests',
    script: 'scripts/test-pipeline.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      CRON_SCHEDULE: '0 */2 * * *', // Cada 2 horas
      TEST_TIMEOUT: '1800000', // 30 minutos
      RUN_IMMEDIATELY: 'false'
    },
    env_development: {
      NODE_ENV: 'development',
      CRON_SCHEDULE: '*/5 * * * *', // Cada 5 minutos para desarrollo
      TEST_TIMEOUT: '600000', // 10 minutos
      RUN_IMMEDIATELY: 'true'
    }
  }]
};
