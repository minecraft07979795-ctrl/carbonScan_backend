const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '7x!A%D*G-KaPdSgVkYp3s6v9y$B&E(H+';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

module.exports = {
  // Hash password before storage
  hashPassword: async (password) => {
    return await bcrypt.hash(password, saltRounds);
  },

  // Compare plain text with hashed password
  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Encrypt password (optional)
  encrypt: (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  },

  // ✅ FIXED: Decrypt password coming from frontend
  decrypt: (encryptedData) => {
    if (!encryptedData) throw new Error('No encrypted data received');
    const [ivHex, encryptedHex] = encryptedData.split(':');
    if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }
};
