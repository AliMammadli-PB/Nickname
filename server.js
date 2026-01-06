const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.db');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// SQLite veritabanını başlat
const db = new Database(DB_PATH);

// Tabloyu oluştur (yoksa)
db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )
`);

// Azerbaycan saati (UTC+4)
function getAzerbaijanTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const azerbaijanTime = new Date(utc + (4 * 3600000)); // UTC+4
  return azerbaijanTime.toISOString().replace('T', ' ').substring(0, 19);
}

// Kullanıcı IP'sini al
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'Bilinmiyor';
}

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// İsim kaydetme endpoint
app.post('/api/submit', (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'İsim gereklidir' });
  }

  const ip = getClientIP(req);
  const azerbaijanTime = getAzerbaijanTime();
  const timestamp = new Date().toISOString();

  try {
    const stmt = db.prepare('INSERT INTO records (name, ip, time, timestamp) VALUES (?, ?, ?, ?)');
    stmt.run(name.trim(), ip, azerbaijanTime, timestamp);
    res.json({ success: true, message: 'Kayıt başarıyla eklendi' });
  } catch (error) {
    console.error('Veri yazma hatası:', error);
    res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
  }
});

// Tüm kayıtları getir (admin panel için)
app.get('/api/records', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM records ORDER BY id DESC');
    const records = stmt.all();
    
    // Veritabanı formatını API formatına çevir
    const formattedRecords = records.map(record => ({
      id: record.id,
      name: record.name,
      ip: record.ip,
      time: record.time,
      timestamp: record.timestamp
    }));
    
    res.json(formattedRecords);
  } catch (error) {
    console.error('Veri okuma hatası:', error);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});

