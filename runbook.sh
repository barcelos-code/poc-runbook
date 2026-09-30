#!/bin/bash

APP_DIR="$(pwd)"
HEALTH_URL="http://localhost:8080/health"
PID_FILE="/tmp/my-app.pid"
LOCK_FILE="/tmp/my-app.lock"
LOG_FILE="/tmp/my-app-incident-$(date +%Y%m%d_%H%M%S).log"

echo "=== [RUNBOOK RB-001] Iniciando Diagnóstico e Restauração (TypeScript) ==="

# 1. Coleta de Logs / Diagnóstico
echo "[1/4] Coletando logs do sistema..."
if [ -f "app.log" ]; then
    tail -n 30 app.log > "$LOG_FILE"
    echo "  - Logs salvos em $LOG_FILE"
else
    echo "  - Nenhum histórico de log encontrado."
fi

# 2. Limpeza de Lockfiles e Processos Inoperantes
echo "[2/4] Executando limpeza de recursos e lockfiles..."
if [ -f "$LOCK_FILE" ]; then
    docker run --rm -v /tmp:/tmp alpine rm -f /tmp/my-app.lock /tmp/my-app.pid
    echo "  - Lockfile ($LOCK_FILE) removido."
fi

if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "  - Encerrando processo antigo pendente (PID: $OLD_PID)..."
        kill -9 "$OLD_PID" 2>/dev/null
    fi
    rm -f "$PID_FILE"
fi

# 3. Restauração do Serviço
echo "[3/4] Reiniciando a aplicação via Docker Compose..."
docker compose restart app

# Aguarda 3 segundos para inicialização do servidor
sleep 3

# 4. Validação
echo "[4/4] Testando conectividade com o endpoint /health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "=========================================================="
    echo "=== [SUCESSO] Serviço restaurado com êxito! (HTTP 200) ==="
    echo "=========================================================="
    exit 0
else
    echo "=========================================================="
    echo "=== [FALHA] Falha na restauração. Código HTTP: $HTTP_STATUS ==="
    echo "=========================================================="
    exit 1
fi