# Dental Clinic Management System

Diş klinikleri için üretim kalitesinde SaaS yönetim sistemi.

## Özellikler

- Hasta yönetimi (kayıt, arama, detay sayfası)
- Randevu planlama (liste + haftalık takvim görünümü, çakışma kontrolü)
- Tedavi planları (adım adım takip, otomatik durum yönetimi)
- Dosya yükleme (X-ray, fotoğraf, PDF — drag & drop)
- Ödeme takibi (toplam / ödenen / kalan, kısmi ödeme)
- Rol tabanlı erişim (admin, doktor, asistan)
- Audit log (tüm yazma işlemleri otomatik kaydedilir)
- Dashboard (gerçek zamanlı istatistikler)

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | NestJS 11, TypeScript, REST API |
| Veritabanı | PostgreSQL + Prisma ORM |
| Auth | JWT (httpOnly cookie) |
| Dosya | Multer (lokal), S3-ready yapı |

## Proje Yapısı

```
DentistProject/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── patients/
│   │   │   │   ├── appointments/
│   │   │   │   ├── treatments/
│   │   │   │   ├── payments/
│   │   │   │   ├── files/
│   │   │   │   ├── audit/
│   │   │   │   └── dashboard/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── guards/
│   │   │   │   └── interceptors/
│   │   │   └── prisma/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── seed.ts
│   └── web/          # Next.js frontend (port 3000)
│       ├── app/
│       │   ├── (auth)/login/
│       │   └── (dashboard)/
│       │       ├── dashboard/
│       │       ├── patients/
│       │       │   └── [id]/
│       │       ├── appointments/
│       │       └── treatments/
│       ├── components/
│       │   ├── layout/
│       │   ├── patients/
│       │   ├── appointments/
│       │   ├── treatments/
│       │   ├── payments/
│       │   └── files/
│       └── lib/
└── packages/
    └── types/        # Ortak TypeScript tipleri
```

## Kurulum

### Gereksinimler

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### 1. Repoyu klonlayın ve bağımlılıkları yükleyin

```bash
cd DentistProject

# Backend bağımlılıkları
cd apps/api && npm install

# Frontend bağımlılıkları
cd ../web && npm install
```

### 2. Ortam değişkenlerini ayarlayın

```bash
# Backend
cp .env.example apps/api/.env
# apps/api/.env dosyasını düzenleyin (DATABASE_URL, JWT_SECRET)

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/web/.env.local
```

### 3. Veritabanını hazırlayın

```bash
cd apps/api

# Migration çalıştır
npx prisma migrate dev --name init

# Prisma client oluştur
npx prisma generate

# Örnek veri yükle
npm run seed
```

### 4. Uygulamaları başlatın

İki ayrı terminal açın:

```bash
# Terminal 1 — Backend
cd apps/api
npm run start:dev
# → http://localhost:3001/api

# Terminal 2 — Frontend
cd apps/web
npm run dev
# → http://localhost:3000
```

## Demo Giriş Bilgileri

Seed çalıştırdıktan sonra aşağıdaki hesaplarla giriş yapabilirsiniz:

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@demodis.com | password123 |
| Doktor | doktor@demodis.com | password123 |
| Asistan | asistan@demodis.com | password123 |

## API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Giriş yap |
| POST | `/api/auth/register` | Kayıt ol |
| GET | `/api/auth/me` | Oturum bilgisi |
| POST | `/api/auth/logout` | Çıkış yap |
| GET | `/api/patients` | Hasta listesi (arama: ?search=) |
| POST | `/api/patients` | Yeni hasta |
| GET | `/api/patients/:id/details` | Hasta detayı (ilişkilerle) |
| PATCH | `/api/patients/:id` | Hasta güncelle |
| DELETE | `/api/patients/:id` | Hasta sil |
| GET | `/api/appointments` | Randevu listesi (filtre: from, to, patientId, doctorId) |
| POST | `/api/appointments` | Yeni randevu (çakışma kontrolü) |
| PATCH | `/api/appointments/:id` | Randevu güncelle / durum değiştir |
| GET | `/api/treatments` | Tedavi listesi (?patientId=) |
| POST | `/api/treatments` | Yeni tedavi planı |
| PATCH | `/api/treatments/steps/:stepId` | Adım durumu güncelle |
| GET | `/api/payments` | Ödeme listesi |
| POST | `/api/payments` | Yeni ödeme kaydı |
| PATCH | `/api/payments/:id/pay` | Kısmi ödeme ekle |
| GET | `/api/payments/summary` | Klinik ödeme özeti |
| POST | `/api/files/upload` | Dosya yükle (multipart/form-data) |
| GET | `/api/files/static/:key` | Dosya görüntüle (auth gerekmez) |
| GET | `/api/dashboard/stats` | Dashboard istatistikleri |
| GET | `/api/audit` | Audit log (admin/doktor) |

## Ortam Değişkenleri

```env
# apps/api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/dentist_db
JWT_SECRET=min-32-karakter-rastgele-deger
JWT_EXPIRES_IN=7d
API_PORT=3001
API_URL=http://localhost:3001
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Geliştirme Notları

- Dosyalar `apps/api/uploads/` klasörüne kaydedilir (`.gitignore`'da)
- Production'da `FilesService` S3 entegrasyonu için hazır yapıda
- `AuditInterceptor` tüm `POST/PATCH/PUT/DELETE` isteklerini otomatik loglar
- JWT token httpOnly cookie'de saklanır, XSS'e karşı korumalı
- Tüm route'lar clinic ID ile izole edilmiş (multi-tenant ready)
