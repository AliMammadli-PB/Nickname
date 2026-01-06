const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// Vercel'de /tmp dizinine yazma izni var, local'de data.json kullan
const DATA_FILE = process.env.VERCEL 
  ? path.join('/tmp', 'data.json')
  : path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Veritabanı dosyasını oluştur (yoksa)
function initDatabase() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// Veritabanını başlat
initDatabase();

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

  const newEntry = {
    id: Date.now(),
    name: name.trim(),
    ip: ip,
    time: azerbaijanTime,
    timestamp: timestamp
  };

  try {
    // Mevcut verileri oku
    let data = [];
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileContent);
    }

    // Yeni kaydı ekle
    data.push(newEntry);

    // Dosyaya yaz
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Kayıt başarıyla eklendi' });
  } catch (error) {
    console.error('Veri yazma hatası:', error);
    res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
  }
});

// Tüm kayıtları getir (admin panel için)
app.get('/api/records', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json([]);
    }

    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(fileContent);
    
    // En yeni kayıtlar önce gelsin
    const sortedData = data.sort((a, b) => b.id - a.id);
    
    res.json(sortedData);
  } catch (error) {
    console.error('Veri okuma hatası:', error);
    res.json([]);
  }
});

// Vercel için export, local için listen
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
  });
}

