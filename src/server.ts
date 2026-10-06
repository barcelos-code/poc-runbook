import app from './app';
import { CONFIG } from './config/env.config';

app.listen(CONFIG.PORT, () => {
  console.log(`🚀 Application server running on port ${CONFIG.PORT}`);
  console.log(`📊 Prometheus metrics available at http://localhost:${CONFIG.PORT}/metrics`);
});