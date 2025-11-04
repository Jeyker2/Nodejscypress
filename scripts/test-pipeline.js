const { exec } = require('child_process');
const cron = require('node-cron');

class TestPipeline {
  constructor() {
    this.isRunning = false;
    this.schedule = process.env.CRON_SCHEDULE || '0 */2 * * *'; // Cada 2 horas por defecto
    this.timeout = process.env.TEST_TIMEOUT || 30 * 60 * 1000; // 30 minutos
  }

  async runTests() {
    if (this.isRunning) {
      console.log('⚠️ Tests ya están ejecutándose, saltando...');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Iniciando pipeline de tests - ${new Date().toISOString()}`);

    try {
      const result = await this.executeTests();
      console.log('✅ Tests completados exitosamente');
      console.log(result);
    } catch (error) {
      console.error('❌ Error en tests:', error);
    } finally {
      this.isRunning = false;
      console.log(`🏁 Pipeline finalizado - ${new Date().toISOString()}`);
    }
  }

  executeTests() {
    return new Promise((resolve, reject) => {
      const testProcess = exec('npm start', { 
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
          reject(new Error(`Tests fallaron con código: ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        reject(error);
      });

      // Auto-kill después del timeout
      setTimeout(() => {
        if (!testProcess.killed) {
          console.log('⏰ Timeout alcanzado, terminando tests...');
          testProcess.kill('SIGTERM');
        }
      }, this.timeout);
    });
  }

  start() {
    console.log(`📅 Pipeline programado: ${this.schedule}`);
    console.log(`⏱️ Timeout por ejecución: ${this.timeout / 1000}s`);

    // Programar ejecución
    cron.schedule(this.schedule, () => {
      this.runTests();
    });

    // Ejecutar inmediatamente si se especifica
    if (process.env.RUN_IMMEDIATELY === 'true') {
      this.runTests();
    }

    console.log('🎯 Pipeline iniciado y programado');
  }

  stop() {
    console.log('🛑 Deteniendo pipeline...');
    process.exit(0);
  }
}

// Iniciar pipeline
const pipeline = new TestPipeline();
pipeline.start();

// Manejar señales de cierre
process.on('SIGINT', () => pipeline.stop());
process.on('SIGTERM', () => pipeline.stop());
