# 🚀 Smart Log Compressor & Router

Um sistema de ingestão de logs de alta performance desenvolvido para otimizar a escrita em bancos de dados e reduzir custos de infraestrutura através de compressão em memória e persistência em lote (batching).

## 💡 O Problema
Sistemas de missão crítica podem gerar milhares de logs idênticos em poucos segundos durante uma falha. Salvar cada um desses logs individualmente causa:
1. **Gargalo de I/O:** O banco de dados trava tentando processar tantas escritas.
2. **Custo Elevado:** Armazenamento de dados redundantes.
3. **Ruído:** Dificuldade para encontrar a causa raiz no meio de milhares de mensagens iguais.

## ✨ A Solução
Este projeto atua como um **buffer inteligente**. Ele utiliza **Redis** para agrupar logs idênticos em tempo real e persiste apenas um resumo estatístico no **MongoDB Atlas (Nuvem)** a cada ciclo de tempo.

### Diferenciais Técnicos:
- **Deduplicação via Hash (MD5):** Identifica mensagens idênticas instantaneamente através do conteúdo da mensagem.
- **Armazenamento em Memória (Redis):** Latência ultra-baixa na recepção dos dados.
- **Persistência Híbrida:** Utiliza Redis local para velocidade e MongoDB Atlas para armazenamento persistente e escalável.
- **Garantia de Tipagem:** Validação de schemas com **Zod**.



## 🧪 Garantia de Qualidade (Testes)
O projeto conta com uma suíte de testes unitários utilizando **Jest** para garantir que a lógica de compressão nunca falhe. Os testes validam:
- Se logs idênticos geram o mesmo hash e incrementam o contador corretamente.
- Se logs diferentes geram hashes distintos, evitando colisões de dados.

Para rodar os testes:
```bash
npm test

---
Desenvolvido por **Victor Miguel** - www.linkedin.com/in/victor-miguel-2847ba267