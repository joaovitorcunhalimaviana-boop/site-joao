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

## Problema: Conflito Docker mount cache persistente
- **Erro**: `npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'`
- **Causa raiz**: Railway usa `--mount=type=cache` que conflita com npm cache
- **Solução**: Dockerfile customizado com controle total do processo de build

## Configurações Aplicadas:

### 1. Node.js 20+ (via .nvmrc e Dockerfile)
- Criado `.nvmrc` com versão `20.11.0`
- Dockerfile usa `node:20-alpine` diretamente
- Resolve incompatibilidades de dependências que requerem Node.js 20+

### 2. Railway.json com Dockerfile
- `builder`: `DOCKERFILE` (em vez de NIXPACKS)
- `dockerfilePath`: `Dockerfile`
- `restartPolicyType`: `ON_FAILURE`
- `restartPolicyMaxRetries`: 10

### 3. Dockerfile customizado
- Controle total do processo de build
- `npm ci --legacy-peer-deps --no-cache` evita conflitos
- Sequência otimizada: deps → prisma → build
- Sem cache mounts problemáticos

### 4. .dockerignore otimizado
- Exclui `node_modules`, `.next`, logs
- Reduz tamanho do contexto Docker
- Melhora performance do build

## Última Correção Aplicada (Dockerfile Customizado)

**Data:** Última atualização
**Problema:** Erro EBUSY persistente no Docker cache com Nixpacks
**Solução:** Usar Dockerfile customizado com controle total do build

### Mudanças Aplicadas:
1. **Dockerfile criado:** Build customizado com Node.js 20-alpine
2. **railway.json atualizado:** Usar DOCKERFILE builder em vez de NIXPACKS
3. **.dockerignore criado:** Otimizar build e evitar conflitos
4. **Cache limpo:** `npm ci --no-cache` para evitar problemas de cache

### Arquivos Criados/Modificados:
- `Dockerfile` - Build customizado
- `.dockerignore` - Otimização do build
- `railway.json` - Builder DOCKERFILE
- `FORCE_DEPLOY.md` - Documentação da correção

### Status:
- ✅ Arquivos criados
- 🔄 Preparando commit e push
