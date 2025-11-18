// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'playwright-scheduler',
      script: 'scripts/pm2-scheduler.js',
      args: '',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      log_file: 'logs/pm2-scheduler.log',
      out_file: 'logs/pm2-scheduler-out.log',
      error_file: 'logs/pm2-scheduler-error.log'
    }
  ]
};
