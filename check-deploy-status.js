const https = require('https');

const RAILWAY_URL = 'https://consultorio-dr-joao-vitor-production.up.railway.app';

console.log('🚀 Verificando status do deploy no Railway...\n');

function checkDeployStatus() {
  const options = {
    hostname: 'consultorio-dr-joao-vitor-production.up.railway.app',
    port: 443,
    path: '/api/health',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response:`, data);
      
      if (res.statusCode === 200) {
        console.log('\n🎉 DEPLOY REALIZADO COM SUCESSO!');
        console.log(`🌐 Site disponível em: ${RAILWAY_URL}`);
        console.log(`🏥 Área médica: ${RAILWAY_URL}/area-medica`);
        console.log(`📋 Agendamento: ${RAILWAY_URL}/agendamento`);
      } else {
        console.log('\n⚠️  Deploy ainda em andamento ou com problemas...');
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Erro na conexão: ${err.message}`);
    console.log('⏳ Deploy provavelmente ainda em andamento...');
  });

  req.on('timeout', () => {
    console.log('⏱️  Timeout - Deploy ainda em andamento...');
    req.destroy();
  });

  req.end();
}

// Verificar status inicial
checkDeployStatus();

// Verificar novamente em 30 segundos
setTimeout(() => {
  console.log('\n🔄 Verificando novamente...\n');
  checkDeployStatus();
}, 30000);

console.log('\n📝 PRÓXIMOS PASSOS:');
console.log('1. Configure as variáveis de ambiente no Railway Dashboard');
console.log('2. Aguarde o deploy automático (pode levar 2-5 minutos)');
console.log('3. Teste o sistema quando estiver online');
console.log('\n🔗 Railway Dashboard:');
console.log('https://railway.com/project/2695d160-9f29-4fb3-a8ad-52efeb72221a/service/16dadc2f-42e0-4b4b-b3a9-e40ff243824a');