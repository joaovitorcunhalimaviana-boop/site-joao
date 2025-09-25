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
