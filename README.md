# IP Sohbeti - Kullanıcı Kayıt Sistemi

Kullanıcıların isimlerini kaydeden ve admin panelinde görüntüleyen basit bir web uygulaması.

## Özellikler

- ✨ Modern ve güzel tasarım
- 📝 Kullanıcı isim girişi
- 🌐 Otomatik IP adresi tespiti
- 🕐 Azerbaycan saati (UTC+4) ile zaman kaydı
- 📊 Admin paneli ile tüm kayıtları görüntüleme
- 🔄 Otomatik yenileme (admin panel)

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Sunucuyu başlatın:
```bash
npm start
```

3. Tarayıcınızda açın:
- Ana sayfa: http://localhost:3000
- Admin panel: http://localhost:3000/admin

## Kullanım

1. Ana sayfada kullanıcılar isimlerini yazarak gönderir
2. Sistem otomatik olarak IP adresini ve Azerbaycan saatini kaydeder
3. Admin panelinden tüm kayıtlar görüntülenebilir

## Veri Depolama

Kayıtlar JSON dosyasında (`data.json`) saklanır. Vercel uyumlu olacak şekilde yapılandırılmıştır.

## Vercel Deployment

Proje Vercel'e deploy edilebilir. `vercel.json` dosyası yapılandırmayı içerir.

