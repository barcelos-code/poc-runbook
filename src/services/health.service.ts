import fs from 'fs';
import { CONFIG } from '../config/env.config';
import { healthGauge } from '../metrics/health.metrics';

export class HealthService {
  /**
   * Verifica se existem ficheiros de bloqueio ativos no sistema.
   */
  public isSystemHealthy(): boolean {
    const lockExists = fs.existsSync(CONFIG.LOCKFILE_PATH);
    const pidExists = fs.existsSync(CONFIG.PIDFILE_PATH);

    const isHealthy = !lockExists && !pidExists;

    // Atualiza o estado da métrica no Prometheus
    healthGauge.set(isHealthy ? 1 : 0);

    return isHealthy;
  }

  /**
   * Injeta uma falha no sistema criando os ficheiros de bloqueio.
   */
  public injectFault(): void {
    fs.writeFileSync(CONFIG.LOCKFILE_PATH, 'CRASH_SIMULATED', { flag: 'w' });
    fs.writeFileSync(CONFIG.PIDFILE_PATH, process.pid.toString(), { flag: 'w' });

    // Atualiza a métrica para estado crítico (0)
    healthGauge.set(0);
  }
}

export const healthService = new HealthService();