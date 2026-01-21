import { redis } from '../config/redis.js';
import { LogModel } from '../models/Logs.js';

export async function flushLogsToDatabase() {
  // Busca todas as chaves de contadores de logs
  const keys = await redis.keys('log:*');

  if (keys.length === 0) {
    console.log('\n--- 🧹 Ciclo: Nenhum log novo para processar ---');
    return;
  }

  console.log(`\n--- 🚀 Persistindo ${keys.length} tipo(s) de erro(s) para o MongoDB ---`);
  
  const logsToInsert = [];

  for (const key of keys) {
    // 1. Pega a contagem (X vezes que o log ocorreu)
    const count = await redis.get(key);
    
    // 2. Extrai os dados da estrutura da chave (log:app:level:hash)
    const [_, app, level, hash] = key.split(':');
    
    // 3. Busca a mensagem original no Redis usando o hash
    const message = await redis.get(`msg:${hash}`);

    if (message) {
      // LOG DETALHADO NO CONSOLE DO VS CODE
      console.log(`📌 [AGRUPADO] ${count}x | Level: ${level} | App: ${app}`);
      console.log(`💬 Mensagem: "${message}"`);
      console.log(`--------------------------------------------------`);

      // Prepara o objeto para o MongoDB
      logsToInsert.push({
        app,
        level,
        hash,
        message,
        occurrences: Number(count),
        timestamp: new Date()
      });
    }

    // 4. Limpa as chaves do Redis para não duplicar no próximo minuto
    await redis.del(key);
    // Nota: Opcionalmente limpamos a mensagem se não houver outros níveis usando o mesmo hash
    await redis.del(`msg:${hash}`);
  }

  // Envia tudo de uma vez para o Atlas (Performance!)
  if (logsToInsert.length > 0) {
    await LogModel.insertMany(logsToInsert);
    console.log('✅ Sucesso: Dados salvos no MongoDB Atlas e Redis limpo.');
  }
}