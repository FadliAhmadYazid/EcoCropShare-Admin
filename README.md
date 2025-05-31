# EcoCropShare Admin Panel

Panel administrasi untuk platform EcoCropShare yang dibangun dengan Next.js, TypeScript, dan MongoDB.

## 🚀 Fitur

- **Dashboard Analytics** - Statistik dan grafik aktivitas platform
- **Kelola User** - Manajemen user (khusus SuperAdmin)
- **Kelola Artikel** - Moderasi artikel yang dibuat user
- **Kelola Post** - Moderasi post benih/panen
- **Kelola Request** - Moderasi permintaan tanaman
- **History Transaksi** - Riwayat pertukaran yang telah selesai
- **Autentikasi** - Login dengan 2 level akses (SuperAdmin & Admin)

## 🏗️ Teknologi

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js
- **Charts**: Chart.js + react-chartjs-2
- **UI Components**: Headless UI, Heroicons
- **Image Storage**: Cloudinary

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ecocropshare-admin.git
cd ecocropshare-admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Salin file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Kemudian edit `.env.local` dengan konfigurasi Anda:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecocropshare?retryWrites=true&w=majority

# NextAuth.js Configuration
NEXTAUTH_SECRET=your-very-long-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. Setup Database

Pastikan Anda memiliki:
- MongoDB Atlas cluster yang sudah berjalan
- Database bernama `ecocropshare` (atau sesuai MONGODB_URI)
- Collection User, Article, Post, Request, History dari aplikasi utama

### 5. Setup Admin Accounts

Jalankan script untuk membuat akun admin default:

```bash
node setup-admin.js
```

Script ini akan membuat 2 akun:
- **SuperAdmin**: `superadmin@ecocropshare.com` / `password123`
- **Admin**: `admin@ecocropshare.com` / `password123`

### 6. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 🔐 Login Accounts

### SuperAdmin
- **Email**: `superadmin@ecocropshare.com`
- **Password**: `password123`
- **Akses**: Semua fitur admin panel + kelola user

### Admin
- **Email**: `admin@ecocropshare.com`
- **Password**: `password123`
- **Akses**: Semua fitur admin panel kecuali kelola user

⚠️ **PENTING**: Ganti password default setelah login pertama!

## 📁 Struktur Folder

```
ecocropshare-admin/
├── components/
│   └── Layout/
│       ├── Layout.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   ├── mongodb.ts
│   └── auth.ts
├── models/
│   ├── Admin.ts
│   ├── User.ts
│   ├── Article.ts
│   ├── Post.ts
│   ├── Request.ts
│   └── History.ts
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   ├── dashboard.ts
│   │   ├── users/
│   │   ├── articles/
│   │   ├── posts/
│   │   ├── requests/
│   │   └── history/
│   ├── index.tsx (Dashboard)
│   ├── login.tsx
│   ├── users.tsx
│   ├── articles.tsx
│   ├── posts.tsx
│   ├── requests.tsx
│   └── history.tsx
├── styles/
│   └── globals.css
├── types/
│   └── next-auth.d.ts
├── .env.example
├── setup-admin.js
└── README.md
```

## 🔧 Development

### Menambah Admin Baru

Untuk menambah admin baru secara manual:

```javascript
// Jalankan di MongoDB shell atau script
db.admins.insertOne({
  name: "Nama Admin",
  email: "email@example.com",
  password: "$2a$10$hashed_password_here",
  role: "admin", // atau "superadmin"
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Mengubah Role Admin

```javascript
// Upgrade admin menjadi superadmin
db.admins.updateOne(
  { email: "admin@ecocropshare.com" },
  { $set: { role: "superadmin", updatedAt: new Date() } }
);
```

### Custom Build

```bash
# Build untuk production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables di Vercel dashboard
4. Deploy

### Environment Variables untuk Production

```env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_SECRET=your-super-secure-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

## 🔒 Keamanan

- Password di-hash menggunakan bcryptjs
- Session management dengan NextAuth.js
- API routes protected dengan authentication
- Role-based access control
- HTTPS required untuk production

## 📊 Fitur Dashboard

### Analytics
- Total user, artikel, post, request, history
- Grafik aktivitas bulanan
- Aktivitas terbaru

### User Management (SuperAdmin Only)
- Lihat semua user
- Hapus user
- Search & filter

### Content Moderation
- Kelola artikel, post, request
- Preview konten
- Hapus konten yang tidak sesuai

### Transaction History
- Riwayat pertukaran
- Filter berdasarkan tanggal/tipe
- Detail transaksi

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test MongoDB connection
node -e "require('mongoose').connect('your-mongodb-uri').then(() => console.log('Connected')).catch(console.error)"
```

### Reset Admin Password
```javascript
// Di MongoDB shell
const bcrypt = require('bcryptjs');
const newPassword = await bcrypt.hash('newpassword123', 10);
db.admins.updateOne(
  { email: "superadmin@ecocropshare.com" },
  { $set: { password: newPassword } }
);
```

### Clear Sessions
```bash
# Restart development server
npm run dev
```

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Check logs di browser console
2. Check server logs di terminal
3. Pastikan environment variables sudah benar
4. Pastikan MongoDB connection berjalan

## 📄 License

MIT License - Silakan gunakan untuk keperluan pembelajaran dan pengembangan.

---

**EcoCropShare Admin Panel** - Mengelola platform pertukaran tanaman dengan mudah! 🌱