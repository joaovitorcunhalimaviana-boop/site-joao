const fs = require('fs');
const path = require('path');

// Função para limpar arquivos JSON locais
function clearLocalDataFiles() {
  console.log('🧹 Iniciando limpeza de arquivos de dados locais...');
  
  const dataDir = path.join(__dirname, '..', 'data');
  const unifiedSystemDir = path.join(dataDir, 'unified-system');
  
  // Arquivos que devem ser limpos (resetados para array vazio)
  const filesToClear = [
    path.join(unifiedSystemDir, 'medical-patients.json'),
    path.join(unifiedSystemDir, 'communication-contacts.json'),
    path.join(unifiedSystemDir, 'appointments.json'),
    path.join(unifiedSystemDir, 'surgeries.json'),
    path.join(dataDir, 'medical-attachments.json'),
    path.join(dataDir, 'schedule-slots.json')
  ];
  
  let clearedCount = 0;
  
  filesToClear.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        // Ler o arquivo atual para verificar se tem dados
        const currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (Array.isArray(currentData) && currentData.length > 0) {
          console.log(`📄 Limpando ${path.basename(filePath)} - ${currentData.length} registros encontrados`);
          
          // Resetar para array vazio
          fs.writeFileSync(filePath, '[]', 'utf8');
          clearedCount++;
          
          console.log(`✅ ${path.basename(filePath)} limpo com sucesso`);
        } else {
          console.log(`ℹ️ ${path.basename(filePath)} já está vazio`);
        }
      } else {
        console.log(`⚠️ Arquivo não encontrado: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao limpar ${path.basename(filePath)}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Limpeza concluída! ${clearedCount} arquivos foram limpos.`);
  
  return {
    success: true,
    clearedFiles: clearedCount,
    totalFiles: filesToClear.length
  };
}

// Executar se chamado diretamente
if (require.main === module) {
  try {
    const result = clearLocalDataFiles();
    console.log('\n📊 Resultado:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

module.exports = { clearLocalDataFiles };