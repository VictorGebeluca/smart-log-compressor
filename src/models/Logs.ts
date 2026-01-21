import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  app: { type: String, required: true },
  level: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  hash: { type: String } // Aquele hash que o seu compressor gera
});

export const LogModel = mongoose.model('Log', logSchema);