import crypto from 'crypto';
import { redis } from '../config/redis.js';

export class LogCompressor {
  /**
   * Processa o log, gera um hash único e armazena no Redis
   */
  static async processLog(app: string, level: string, message: string) {
    // 1. Geramos o hash usando App, Level e a MENSAGEM.
    // Se qualquer um desses mudar, o hash será diferente!
    const hashData = `${app}:${level}:${message}`;
    const hash = crypto.createHash('md5').update(hashData).digest('hex');
    
    // 2. Criamos as chaves para o Redis
    const logKey = `log:${app}:${level}:${hash}`; // Chave do contador
    const msgKey = `msg:${hash}`;                // Chave da mensagem

    // 3. Incrementamos o contador (o Redis cria se não existir)
    const count = await redis.incr(logKey);
    
    // 4. Armazenamos a mensagem original vinculada a esse hash
    // Usamos SETNX para não precisar sobrescrever a mesma mensagem toda hora
    await redis.set(msgKey, message);

    // Retornamos para o server.ts poder responder ao Postman
    return { hash, count };
  }
}