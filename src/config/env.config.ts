import path from 'path';

export const CONFIG = {
  PORT: process.env.PORT || 8080,
  LOCKFILE_PATH: path.join('/tmp', 'my-app.lock'),
  PIDFILE_PATH: path.join('/tmp', 'my-app.pid'),
};