# Configuração do Gmail para Envio de Emails

## Passo a Passo para Configurar o Gmail

### 1. Ativar Verificação em 2 Etapas
1. Acesse sua conta Google: https://myaccount.google.com/
2. Vá em "Segurança" no menu lateral
3. Em "Como fazer login no Google", clique em "Verificação em duas etapas"
4. Siga as instruções para ativar (se ainda não estiver ativo)

### 2. Gerar Senha de Aplicativo
1. Ainda na seção "Segurança", procure por "Senhas de app"
2. Clique em "Senhas de app"
3. Selecione "Aplicativo" → "Outro (nome personalizado)"
4. Digite: "Sistema Médico - Email Marketing"
5. Clique em "Gerar"
6. **COPIE A SENHA GERADA** (16 caracteres, sem espaços)

### 3. Configurar no Sistema
1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua `sua_senha_de_aplicativo_aqui` pela senha gerada no passo anterior
3. Exemplo:
   ```
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```
   (Cole exatamente como foi gerada, com ou sem espaços)

### 4. Reiniciar o Servidor
Após configurar a senha, reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Testando o Sistema

1. Acesse: http://localhost:3000/area-medica/email-marketing
2. Vá na aba "Newsletter"
3. Teste enviando uma newsletter

Ou use a API diretamente:
```bash
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"seu-email@gmail.com"}'
```

## Solução de Problemas

### Erro: "Invalid login"
- Verifique se a verificação em 2 etapas está ativa
- Confirme se a senha de aplicativo está correta
- Tente gerar uma nova senha de aplicativo

### Erro: "Less secure app access"
- Use senha de aplicativo (não a senha normal da conta)
- Certifique-se de que a verificação em 2 etapas está ativa

### Emails não chegam
- Verifique a pasta de spam/lixo eletrônico
- Confirme se o email de destino está correto
- Teste com diferentes provedores de email

## Configurações Atuais

- **Email de envio**: joaovitorvianacoloprocto@gmail.com
- **Nome de exibição**: Dr. João Vitor Viana - Coloproctologia
- **SMTP**: smtp.gmail.com:587 (TLS)
- **Responder para**: joaovitorvianacoloprocto@gmail.com

## Segurança

⚠️ **IMPORTANTE**: 
- Nunca compartilhe sua senha de aplicativo
- A senha de aplicativo é específica para este sistema
- Você pode revogar a senha a qualquer momento nas configurações do Google
- Mantenha o arquivo `.env.local` seguro e nunca o envie para repositórios públicos