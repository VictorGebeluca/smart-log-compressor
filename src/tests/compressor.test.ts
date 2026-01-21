import { LogCompressor } from '../services/compressor.js';
import { redis } from '../config/redis.js';

describe('LogCompressor Service', () => {
  it('deve gerar o mesmo hash para mensagens idênticas', async () => {
    const app = 'test-app';
    const level = 'INFO';
    const message = 'Conexão estabelecida';

    const result1 = await LogCompressor.processLog(app, level, message);
    const result2 = await LogCompressor.processLog(app, level, message);

    // O hash deve ser igual
    expect(result1.hash).toBe(result2.hash);
    // O contador deve ter subido
    expect(result2.count).toBeGreaterThan(result1.count);
  });

  it('deve gerar hashes diferentes para mensagens diferentes', async () => {
    const res1 = await LogCompressor.processLog('app', 'INFO', 'Mensagem A');
    const res2 = await LogCompressor.processLog('app', 'INFO', 'Mensagem B');

    expect(res1.hash).not.toBe(res2.hash);
  });
});

afterAll(async () => {
  await redis.quit();
});