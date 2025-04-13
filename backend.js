const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Correct CORS setup for Live Server
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to credit data
const dataFile = path.join(__dirname, 'data', 'creditData.json');

// === Helpers ===
function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ users: [], creditInfo: [], transactions: [] }, null, 2));
  }
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile));
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// === Register ===
app.post('/api/register', (req, res) => {
  const { userId, passcode } = req.body;
  const data = readData();

  if (data.users.find(u => u.userId === userId)) {
    return res.json({ success: false, message: "ID already exists." });
  }

  data.users.push({ userId, passcode });
  writeData(data);
  res.json({ success: true, message: "New ID created! You can now log in." });
});

// === Login ===
app.post('/api/login', (req, res) => {
  const { userId, passcode } = req.body;
  const data = readData();

  const user = data.users.find(u => u.userId === userId && u.passcode === passcode);
  res.json({ success: !!user, message: user ? "Login successful" : "Invalid ID or Passcode." });
});

// === Save Credit Info ===
app.post('/api/saveCreditInfo', (req, res) => {
  const { userId, limit, balance } = req.body;
  const data = readData();

  let userCredit = data.creditInfo.find(c => c.userId === userId);
  if (userCredit) {
    userCredit.limit = limit;
    userCredit.balance = balance;
  } else {
    data.creditInfo.push({ userId, limit, balance });
  }

  writeData(data);
  res.json({ success: true });
});

// === Get Credit Info ===
app.get('/api/getCreditInfo', (req, res) => {
  const { userId } = req.query;
  const data = readData();
  const info = data.creditInfo.find(c => c.userId === userId);
  res.json(info || {});
});

// === Save Transaction ===
app.post('/api/saveTransaction', (req, res) => {
  const { userId, date, amount } = req.body;
  const data = readData();

  let userTransactions = data.transactions.find(t => t.userId === userId);
  if (!userTransactions) {
    userTransactions = { userId, entries: [] };
    data.transactions.push(userTransactions);
  }

  userTransactions.entries.push({ date, amount });
  writeData(data);
  res.json({ success: true });
});

// === Get Transactions ===
app.get('/api/getTransactions', (req, res) => {
  const { userId } = req.query;
  const data = readData();
  const userTransactions = data.transactions.find(t => t.userId === userId);
  res.json({ transactions: userTransactions ? userTransactions.entries : [] });
});

// === Start Server ===
app.listen(PORT, () => console.log(`Server running at http://127.0.0.1:${PORT}`));   