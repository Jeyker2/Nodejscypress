#!/usr/bin/env node

const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class PlaywrightScheduler {
  constructor() {
    this.tasks = new Map;
    this.controlFile = path.join(__dirname, '../.scheduler-control');
    this.logFile = path.join(__dirname, '../logs/scheduler.log');
    
    // Crear directorio de logs si no existe
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(this.logFile, logMessage);
  }

  parseInterval(interval) {
    const patterns = {
      '1m': '* * * * *',           // Cada minuto
      '5m': '*/5 * * * *',         // Cada 5 minutos
      '15m': '*/15 * * * *',       // Cada 15 minutos
      '30m': '*/30 * * * *',       // Cada 30 minutos
      '1h': '0 * * * *',           // Cada hora
      '2h': '0 */2 * * *',         // Cada 2 horas
      '3h': '0 */3 * * *',         // Cada 3 horas
      '6h': '0 */6 * * *',         // Cada 6 horas
      '12h': '0 */12 * * *',       // Cada 12 horas
      '1d': '0 8 * * *',           // Diario a las 8 AM
      'workdays': '0 8 * * 1-5',   // Días laborales 8 AM
      'weekends': '0 10 * * 0,6'   // Fines de semana 10 AM
    };
    
    return patterns[interval] || interval;
  }

  startScheduler(testPattern, interval, options = {}) {
    const cronPattern = this.parseInterval(interval);
    const taskId = `${testPattern}-${interval}`;
    
    if (!cron.validate(cronPattern)) {
      throw new Error(`Patrón de cron inválido: ${cronPattern}`);
    }

    // Parar tarea existente si existe
    this.stopTask(taskId);

    const task = cron.schedule(cronPattern, () => {
      if (this.shouldStop()) {
        this.log(`🛑 Deteniendo scheduler por archivo de control`);
        this.stopAll();
        return;
      }

      this.runTest(testPattern, options);
    }, {
      scheduled: false
    });

    this.tasks.set(taskId, { task, testPattern, interval, options });
    task.start();
    
    this.log(`🚀 Scheduler iniciado: ${testPattern} cada ${interval} (${cronPattern})`);
    
    // Crear archivo de control
    this.createControlFile(taskId);
    
    return taskId;
  }

runTest(testPattern, options = {}) {
  const { browser = 'chromium', mode = 'headless' } = options;
  
  this.log(`▶️ Ejecutando test: ${testPattern} en ${browser}`);
  
  let command = `npx playwright test`;
  
  // Mapear patrones a archivos específicos
  const testFiles = {
    'user.interface.validation': 'tests/ValidateUserInterface/index.spec.ts',
    'login': 'tests/Login/index.spec.ts',
    'auraview.weather': 'tests/weather/index.spec.ts',
    'auraview.histogram': 'tests/Histogram/index.spec.ts',
    'cropstatus': 'tests/CropStatus/index.spec.ts',
    'all': 'tests/*/index.spec.ts'
  };
  
  if (testFiles[testPattern]) {
    command += ` ${testFiles[testPattern]}`;
  } else {
    command += ` -g "${testPattern}"`;
  }
  
  command += ` --project=${browser}`;
  command += ` --reporter=line`; // ← Agregar reporter detallado
  if (mode === 'headed') {
    command += ` --headed`;
  }

  // Usar spawn para capturar salida en tiempo real
  const { spawn } = require('child_process');
  const child = spawn('npx', command.split(' ').slice(1), {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Capturar stdout línea por línea

  // Capturar stdout línea por línea
child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      // Mostrar TODOS los mensajes importantes incluyendo errores de archivos
      if (line.includes('✅') || line.includes('❌') || line.includes('⚠️') || 
          line.includes('ejecutado en:') || line.includes('visible') || 
          line.includes('cargado correctamente') ||
          line.includes('.spec.ts:') ||           // ← Agregar esta línea
          line.includes('Error:') ||              // ← Agregar esta línea
          line.includes('Failed:') ||             // ← Agregar esta línea
          line.includes('FAIL') ||                // ← Agregar esta línea
          line.includes('PASS')) {                // ← Agregar esta línea
        this.log(line.trim());
      }
    }
  });
});

// Capturar stderr - Mostrar TODOS los errores
child.stderr.on('data', (data) => {
  const errorLines = data.toString().split('\n');
  errorLines.forEach(line => {
    if (line.trim()) {
      this.log(`⚠️ ${line.trim()}`); // Mostrar todos los errores
    }
  });
});

  // child.stdout.on('data', (data) => {
  //   const lines = data.toString().split('\n');
  //   lines.forEach(line => {
  //     if (line.trim()) {
  //       // Filtrar y mostrar solo los mensajes importantes
  //       if (line.includes('✅') || line.includes('❌') || line.includes('⚠️') || 
  //           line.includes('ejecutado en:') || line.includes('visible') || 
  //           line.includes('cargado correctamente')) {
  //         this.log(line.trim());
  //       }
  //     }
  //   });
  // });

  // // Capturar stderr
  // child.stderr.on('data', (data) => {
  //   const errorLines = data.toString().split('\n');
  //   errorLines.forEach(line => {
  //     if (line.trim()) {
  //       this.log(`⚠️ ${line.trim()}`);
  //     }
  //   });
  // });

  // Manejar finalización del proceso
  child.on('close', (code) => {
    if (code === 0) {
      this.log(`✅ Test ${testPattern} completado exitosamente en ${browser}`);
    } else {
      this.log(`❌ Test ${testPattern} falló con código: ${code}`);
    }
  });

  child.on('error', (error) => {
    this.log(`❌ Error ejecutando test ${testPattern}: ${error.message}`);
  });
}

  stopTask(taskId) {
    if (this.tasks.has(taskId)) {
      const { task } = this.tasks.get(taskId);
      task.stop();
      this.tasks.delete(taskId);
      this.log(`🛑 Tarea detenida: ${taskId}`);
      return true;
    }
    return false;
  }

  stopAll() {
    this.tasks.forEach((_, taskId) => {
      this.stopTask(taskId);
    });
    this.removeControlFile();
    this.log(`🛑 Todos los schedulers detenidos`);
  }

  createControlFile(taskId) {
    const controlData = {
      taskId,
      startTime: new Date().toISOString(),
      pid: process.pid,
      status: 'running'
    };
    fs.writeFileSync(this.controlFile, JSON.stringify(controlData, null, 2));
  }

  removeControlFile() {
    if (fs.existsSync(this.controlFile)) {
      fs.unlinkSync(this.controlFile);
    }
  }

  shouldStop() {
    return !fs.existsSync(this.controlFile);
  }

  getStatus() {
    const activeTasks = Array.from(this.tasks.entries()).map(([id, data]) => ({
      id,
      testPattern: data.testPattern,
      interval: data.interval,
      options: data.options
    }));
    
    return {
      activeTasks,
      totalTasks: this.tasks.size,
      controlFile: fs.existsSync(this.controlFile)
    };
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];
const scheduler = new PlaywrightScheduler();

switch (command) {
  case 'start':
    const testPattern = args[1] || 'user.interface.validation';
    const interval = args[2] || '1h';
    const browser = args[3] || 'chromium';
    const mode = args[4] || 'headless';
    
    try {
      const taskId = scheduler.startScheduler(testPattern, interval, { browser, mode });
      console.log(`✅ Scheduler iniciado con ID: ${taskId}`);
      
      // Mantener el proceso vivo
      process.on('SIGINT', () => {
        scheduler.stopAll();
        process.exit(0);
      });
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
    break;

  case 'stop':
    scheduler.stopAll();
    break;

  case 'status':
    console.log(JSON.stringify(scheduler.getStatus(), null, 2));
    break;

  default:
    console.log(`
Uso: node playwright-scheduler.js <comando> [opciones]

Comandos:
  start <pattern> <interval> [browser] [mode]  - Iniciar scheduler
  stop                                         - Detener todos los schedulers
  status                                       - Ver estado actual

Patrones de test:
  - user.interface.validation
  - login
  - auraview.weather
  - auraview.histogram
  - cropstatus
  - all

Intervalos:
  - 1m, 5m, 15m, 30m (minutos)
  - 1h, 2h, 3h, 6h, 12h (horas)
  - 1d (diario)
  - workdays (días laborales)
  - weekends (fines de semana)
  - O patrón cron personalizado

Ejemplos:

  node scripts/pm2-scheduler.js start user.interface.validation 30m
  node scripts/pm2-scheduler.js start auraview.weather 2h firefox
  node scripts/pm2-scheduler.js start login workdays chromium headed

# Ahora funcionará correctamente
node scripts/pm2-scheduler.js start "user.interface.validation" 2h webkit

# O con PM2
pm2 restart ui-scheduler --update-env -- start "user.interface.validation" 2h webkit

# Ejecutar directamente con PM2
pm2 start scripts/pm2-scheduler.js --name playwright-scheduler -- start user.interface.validation 1m webkit headless

# Otros ejemplos
pm2 start scripts/pm2-scheduler.js --name ui-webkit -- start user.interface.validation 30m webkit headed
pm2 start scripts/pm2-scheduler.js --name weather-firefox -- start auraview.weather 2h firefox headless


# Con navegadores específicos:
# Chromium (por defecto)
node scripts/pm2-scheduler.js start user.interface.validation 1m chromium headless
node scripts/pm2-scheduler.js start user.interface.validation 1m chromium headed

# Firefox
node scripts/pm2-scheduler.js start auraview.weather 30m firefox headless
node scripts/pm2-scheduler.js start auraview.weather 30m firefox headed

# WebKit
node scripts/pm2-scheduler.js start login 15m webkit headless
node scripts/pm2-scheduler.js start login 15m webkit headed


Copy

Insert at cursor

    `);
}
    