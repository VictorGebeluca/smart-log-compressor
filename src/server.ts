import express from 'express';
import cron from 'node-cron';
import { z } from 'zod';
import { LogCompressor } from './services/compressor.js';
import { flushLogsToDatabase } from './jobs/flushlogs.js';
import mongoose from 'mongoose';

// CONEXÃO COM O MONGODB ATLAS
// Substitua pela sua string se necessário, mas esta já é a sua do Atlas
const mongoURI = 'mongodb+srv://victormiguel01_db_user:PkL2vpurrzrBZnlP@cluster0.ozv7fva.mongodb.net/smart_logger?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(() => console.log('🍃 Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

const app = express();
app.use(express.json());

// Validação rigorosa dos dados recebidos
const logSchema = z.object({
  app: z.string().min(2),
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL']),
  message: z.string().min(5)
});

// Rota POST: Onde o Postman envia os logs
app.post('/logs', async (req, res) => {
  try {
    const { app: appName, level, message } = logSchema.parse(req.body);
    
    // O Compressor gera o Hash e salva temporariamente no Redis
    const result = await LogCompressor.processLog(appName, level, message);
    
    return res.status(202).json({
      status: 'Log processado e comprimido',
      hash: result.hash,
      total_na_fila: result.count
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || 'Dados inválidos' });
  }
});

// Agenda o descarregamento do Redis para o MongoDB a cada 1 minuto
cron.schedule('*/1 * * * *', () => {
  flushLogsToDatabase();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor Online: http://localhost:${PORT}`);
  console.log(`⏰ Monitorando logs e comprimindo no Redis...`);
});