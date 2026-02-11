import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function regenerateBotToken() {
  const db = await open({
    filename: path.join(__dirname, 'taskpulse.db'),
    driver: sqlite3.Database
  });

  const bot = await db.get("SELECT id, username FROM users WHERE user_type = 'bot' AND username = 'neon'");

  if (!bot) {
    console.log('Bot "neon" not found');
    await db.close();
    return;
  }

  const newToken = 'bot_' + crypto.randomBytes(32).toString('hex');

  await db.run(
    "UPDATE users SET api_token = ? WHERE id = ?",
    [newToken, bot.id]
  );

  console.log('=== Bot Token Regenerated ===');
  console.log(`Bot: ${bot.username}`);
  console.log(`New API Token: ${newToken}`);
  console.log('================================');

  await db.close();
}

regenerateBotToken().catch(console.error);
