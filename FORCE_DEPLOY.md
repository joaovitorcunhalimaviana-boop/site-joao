# Force Deploy

Este arquivo é usado para forçar um novo deploy no Railway.

Deploy timestamp: 01/26/2025 17:31:25

## Correções aplicadas para Node.js

- Configurado Node.js 20+ no railway.json
- ~~Criado nixpacks.toml para especificar versões~~ (REMOVIDO - causava erro de build)
- Otimizado cache do npm
- Adicionado política de restart
- ~~Configuração Nixpacks para compatibilidade~~ (REMOVIDO)

Deploy timestamp: 01/26/2025 17:33:17

## Correção do build Docker

- Removido nixpacks.toml que estava causando erro no build
- Mantido apenas railway.json com configuração básica
- Railway usará detecção automática do Node.js

Deploy timestamp: 01/26/2025 17:36:42

## Correção versão Node.js e dependências

- Criado .nvmrc com Node.js 20.11.0
- Alterado buildCommand para usar --legacy-peer-deps
- Resolvendo problemas de compatibilidade de versão

Deploy timestamp: 01/26/2025 17:39:15

## Correção erro EBUSY cache

- Adicionado rm -rf node_modules/.cache antes do npm ci
- Resolvendo problema de cache bloqueado no Docker

Deploy timestamp: 01/26/2025 17:42:30

# Correções Aplicadas para Deploy Railway

## Problema: Erro EBUSY no cache Docker
- **Erro**: `rm: cannot remove 'node_modules/.cache': Device or resource busy`
- **Solução**: Adicionado `|| true` ao comando de remoção do cache para ignorar erros de EBUSY
- **Comando atualizado**: `rm -rf node_modules/.cache || true && npm ci --legacy-peer-deps && npx prisma generate && npm run build`

## Configurações Aplicadas:

### 1. Node.js 20+ (via .nvmrc)
- Criado `.nvmrc` com versão `20.11.0`
- Resolve incompatibilidades de dependências que requerem Node.js 20+

### 2. Railway.json otimizado
- `buildCommand`: Limpeza robusta do cache + `--legacy-peer-deps`
- `restartPolicyType`: `ON_FAILURE`
- `restartPolicyMaxRetries`: 10

### 3. Nixpacks removido
- Removido `nixpacks.toml` que causava erros no build Docker
- Railway agora usa detecção automática do Node.js

### 4. Cache Docker robusto
- Comando `rm -rf node_modules/.cache || true` ignora erros EBUSY
- Permite que o build continue mesmo se o cache estiver ocupado

## Status: Aguardando deploy com correção EBUSY
