import client from 'prom-client';

// Registo padrão do Prometheus
export const register = new client.Registry();

// Coleta métricas padrão do Node.js (CPU, Memória, etc.)
client.collectDefaultMetrics({ register });

// Métrica customizada Gauge para o status da aplicação
export const healthGauge = new client.Gauge({
  name: 'app_health_status',
  help: 'Status de saúde da aplicação: 1 = UP / OK, 0 = DOWN / CRASHED',
});

register.registerMetric(healthGauge);

// Inicializa a métrica em estado saudável (1)
healthGauge.set(1);