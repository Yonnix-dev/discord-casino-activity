import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Base de données
const db = new Database('casino.db');

// Table utilisateurs
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table parties
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    game_type TEXT,
    bet INTEGER,
    result TEXT,
    payout INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// R�cup�rer le solde
app.get('/api/balance/:userId', (req, res) => {
  const { userId } = req.params;
  
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  
  if (!user) {
    // Cr�er l'utilisateur avec 1000 de base
    db.prepare('INSERT INTO users (id, balance) VALUES (?, 1000)').run(userId);
    user = { id: userId, balance: 1000 };
  }
  
  res.json({ userId, balance: user.balance });
});

// Blackjack
app.post('/api/game/blackjack', (req, res) => {
  const { userId, amount, action } = req.body;
  
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user || user.balance < amount) {
    return res.json({ error: 'Solde insuffisant' });
  }
  
  // Logique simplifi�e de Blackjack (� am�liorer)
  const playerScore = Math.floor(Math.random() * 11) + 10; // 10-21
  const dealerScore = Math.floor(Math.random() * 11) + 10;
  
  let result = 'lose';
  let payout = 0;
  
  if (playerScore > dealerScore && playerScore <= 21) {
    result = 'win';
    payout = amount * 2;
  } else if (playerScore === dealerScore) {
    result = 'push';
    payout = amount;
  }
  
  // Mettre � jour le solde
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(payout - amount, userId);
  
  // Logger la partie
  db.prepare('INSERT INTO games (user_id, game_type, bet, result, payout) VALUES (?, ?, ?, ?, ?)')
    .run(userId, 'blackjack', amount, result, payout);
  
  res.json({
    playerScore,
    dealerScore,
    result,
    payout,
    newBalance: db.prepare('SELECT balance FROM users WHERE id = ?').get(userId).balance
  });
});

// Roulette
app.post('/api/game/roulette', (req, res) => {
  const { userId, amount, color } = req.body;
  
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user || user.balance < amount) {
    return res.json({ error: 'Solde insuffisant' });
  }
  
  // Roulette europ�enne (0-36)
  const number = Math.floor(Math.random() * 37);
  let resultColor = 'green';
  
  if (number !== 0) {
    // Rouge: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    resultColor = redNumbers.includes(number) ? 'red' : 'black';
  }
  
  let result = 'lose';
  let payout = 0;
  
  if (color === resultColor) {
    result = 'win';
    payout = color === 'green' ? amount * 36 : amount * 2;
  }
  
  // Mettre � jour le solde
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(payout - amount, userId);
  
  // Logger la partie
  db.prepare('INSERT INTO games (user_id, game_type, bet, result, payout) VALUES (?, ?, ?, ?, ?)')
    .run(userId, 'roulette', amount, result, payout);
  
  res.json({
    number,
    color: resultColor,
    result,
    payout,
    newBalance: db.prepare('SELECT balance FROM users WHERE id = ?').get(userId).balance
  });
});

// Historique des parties
app.get('/api/history/:userId', (req, res) => {
  const { userId } = req.params;
  
  const games = db.prepare('SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(userId);
  res.json(games);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Casino sur http://0.0.0.0:${PORT}`);
});
