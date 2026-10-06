import { Request, Response } from 'express';
import { healthService } from '../services/health.service';
import { register } from '../metrics/health.metrics';

export class HealthController {
  // GET /health
  public checkHealth = (_req: Request, res: Response): Response => {
    const isHealthy = healthService.isSystemHealthy();

    if (!isHealthy) {
      return res.status(500).json({
        status: 'DOWN',
        reason: 'Lockfile or PID file detected in /tmp',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  };

  // GET /crash
  public simulateCrash = (_req: Request, res: Response): Response => {
    healthService.injectFault();

    return res.status(500).json({
      status: 'CRASH_INJECTED',
      message: 'Lockfiles generated successfully in /tmp',
      timestamp: new Date().toISOString(),
    });
  };

  // GET /metrics
  public getMetrics = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    } catch (error) {
      res.status(500).end(error);
    }
  };
}

export const healthController = new HealthController();