# 🚀 PoC: Self-Healing Pipeline & Observability Engine

Uma Prova de Conceito (PoC) completa demonstrando a implementação de uma arquitetura resiliente, auto-recuperável (Self-Healing) e observável para aplicações **Node.js / Express com TypeScript**. 

O projeto simula um ambiente de produção onde falhas na aplicação geram alertas em tempo real no **Prometheus + Grafana** e ativam um pipeline de recuperação automatizado via **Runbook de SRE** (`runbook.sh`), operando totalmente em **User-Space** (sem interrupções por solicitações de `sudo`).

---

## 📌 Índice
1. [Visão Geral e Arquitetura](#-visão-geral-e-arquitetura)
2. [Pré-requisitos do Sistema](#-pré-requisitos-do-sistema)
3. [Estrutura do Repositório](#-estrutura-do-repositório)
4. [Documentação das Rotas da API](#-documentação-das-rotas-da-api)
5. [Passo a Passo: Executando o Projeto](#-passo-a-passo-executando-o-projeto)
6. [Arquitetura de Observabilidade (Prometheus & Grafana)](#-arquitetura-de-observabilidade-prometheus--grafana)
7. [Ciclo de Teste e Auto-Recuperação (Self-Healing)](#-ciclo-de-teste-e-auto-recuperação-self-healing)
8. [Estrutura do Runbook de Restauração](#-estrutura-do-runbook-de-restauração)
9. [Resolução de Problemas (Troubleshooting)](#-resolução-de-problemas-troubleshooting)

---

## 🏗️ Visão Geral e Arquitetura

O ecossistema é composto por três serviços orquestrados via Docker Compose:

```text
               +-------------------------------------------------+
               |                Docker Container                 |
               |                                                 |
[ Client ] --->|  Node.js + Express + TypeScript App (:8080)     |
               |  - Expõe /health, /crash, /metrics              |
               |  - Gera /tmp/my-app.lock & .pid no crash       |
               +-----------------------+-------------------------+
                                       |
                       Scrape Métrica  | (Intervalo: 15s)
                                       v
                       +-------------------------------+
                       |  Prometheus Server (:9090)     |
                       |  - Metric: app_health_status  |
                       +---------------+---------------+
                                       |
                         ConsultaQL    | (Instant Query)
                                       v
                       +-------------------------------+
                       |  Grafana Dashboard (:3000)    |
                       |  - Visualização em tempo real |
                       |  - Red (0) / Green (1)        |
                       +-------------------------------+