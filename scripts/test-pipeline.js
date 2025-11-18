const { exec } = require('child_process');
const cron = require('node-cron');

class PlaywrightScheduler {
  constructor() {
    this.isRunning = false;
    this.schedule = process.env.CRON_SCHEDULE || '0 */2 * * *';
    this.timeout = parseInt(process.env.TEST_TIMEOUT) || 1800000;
    this.autoShutdown = process.env.AUTO_SHUTDOWN === 'true';
  }

  async runTests() {
    if (this.isRunning) {
      console.log('⚠️ Tests ya están ejecutándose, saltando...');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    console.log(`🚀 Iniciando ValidateUserInterface - ${startTime.toISOString()}`);

    try {
      const result = await this.executeTests();
      const duration = ((new Date() - startTime) / 1000).toFixed(2);
      console.log(`✅ Tests completados en ${duration}s`);
      
      if (this.autoShutdown) {
        setTimeout(() => process.exit(0), 5000);
      }
      
    } catch (error) {
      const duration = ((new Date() - startTime) / 1000).toFixed(2);
      console.error(`❌ Error después de ${duration}s:`, error.message);
      
      if (this.autoShutdown) {
        setTimeout(() => process.exit(1), 5000);
      }
    } finally {
      this.isRunning = false;
    }
  }

  executeTests() {
    return new Promise((resolve, reject) => {
      const testCommand = 'npx playwright test tests/ValidateUserInterface/index.spec.ts --reporter=line --headed=false';
      
      const testProcess = exec(testCommand, { 
        timeout: this.timeout,
        killSignal: 'SIGTERM'
      });

      let output = '';

      testProcess.stdout.on('data', (data) => {
        output += data;
        console.log(data.toString());
      });

      testProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Playwright test falló con código: ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  start() {
    console.log(`📅 Programado: ${this.schedule}`);
    console.log(`🎭 Test TypeScript: ValidateUserInterface/index.spec.ts`);

    cron.schedule(this.schedule, () => {
      this.runTests();
    });

    if (process.env.RUN_IMMEDIATELY === 'true') {
      setTimeout(() => this.runTests(), 2000);
    }

    console.log('🎯 PM2 Scheduler iniciado para tests TypeScript');
  }
}

const scheduler = new PlaywrightScheduler();
scheduler.start();

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
