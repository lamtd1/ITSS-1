import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { sequelize, User } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend/.env is loaded (same as db.js behavior)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function isBcryptHash(value) {
  if (typeof value !== 'string') return false;
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
}

async function main() {
  console.log('[hash-seed-passwords] Starting...');
  try {
    await sequelize.authenticate();
    console.log('[hash-seed-passwords] DB connected');

    const users = await User.findAll();
    console.log(`[hash-seed-passwords] Found ${users.length} users`);

    let updatedCount = 0;
    for (const user of users) {
      const current = user.password;
      if (!isBcryptHash(current)) {
        // Hash the current plaintext password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(current, salt);
        user.password = hashed;
        await user.save();
        updatedCount++;
        console.log(`[hash-seed-passwords] Updated user id=${user.id} email=${user.email}`);
      }
    }

    console.log(`[hash-seed-passwords] Done. Updated ${updatedCount} user(s).`);
    process.exit(0);
  } catch (err) {
    console.error('[hash-seed-passwords] Error:', err);
    process.exit(1);
  }
}

main();
