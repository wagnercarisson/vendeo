# Motor 3 Prompt V2 - Log Parser

Parseia logs do servidor para extrair métricas do Motor 3 automaticamente.

## Uso

### 1. Terminal 1: Rodar servidor com log redirecionado
```powershell
npm run dev 2>&1 | Tee-Object -FilePath motor3-v2-benchmark.log
```

### 2. Terminal 2: Criar campanhas normalmente
- Abrir navegador
- Criar 20 campanhas conforme BENCHMARK-MANUAL-GUIDE.md

### 3. Terminal 3: Parsear logs
```powershell
node scripts/parse-motor3-logs.js motor3-v2-benchmark.log
```

O parser vai gerar automaticamente `docs/analysis/motor-3-prompt-v2-benchmarks.md` com:
- Tempo médio Motor 3
- Taxa de timeout
- Taxa de sucesso
- Decisão GO/NO-GO automática
