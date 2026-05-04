# Dentist Projesi — Deploy Rehberi
## (Neon + Railway + Vercel)

> Bu rehber hiç sunucu kurulumu yapmamış biri için adım adım yazılmıştır.
> Sırayla takip edin, hiçbir adımı atlamamaya özen gösterin.

---

## Genel Bakış: Ne Nereye Gidecek?

```
Kullanıcı (Tarayıcı)
       │
       ▼
  ┌─────────────┐
  │   VERCEL    │  ← apps/web  (Next.js Frontend)
  └──────┬──────┘
         │ HTTP istekleri
         ▼
  ┌─────────────┐
  │   RAILWAY   │  ← apps/api  (NestJS Backend)
  └──────┬──────┘
         │ Veritabanı sorguları
         ▼
  ┌─────────────┐
  │    NEON     │  ← PostgreSQL (Bulut Veritabanı)
  └─────────────┘
```

**Açılacak hesaplar:**
- [neon.tech](https://neon.tech) → Veritabanı
- [railway.app](https://railway.app) → NestJS API sunucusu
- [vercel.com](https://vercel.com) → Next.js sitesi

**Tahmini süre:** 45–60 dakika (ilk defa yapıyorsanız)

---

## BÖLÜM 1: GitHub'a Yükleyin (Zorunlu Ön Adım)

Railway ve Vercel, kodunuzu GitHub üzerinden çeker. Kodunuzun GitHub'da olması gerekiyor.

### Adım 1.1 — GitHub'da repo oluşturun

1. [github.com](https://github.com) adresine gidin ve hesabınıza giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın → **"New repository"**
3. Repository adı: `dentist-project` (ya da istediğiniz bir isim)
4. **Private** seçin (kodunuz gizli kalsın)
5. "Create repository" butonuna tıklayın

### Adım 1.2 — Kodu GitHub'a gönderin

Bilgisayarınızda terminali açın, proje klasörüne gidin:

```bash
cd d:/DentistProject
```

Sonra sırasıyla şu komutları çalıştırın:

```bash
git init
git add .
git commit -m "ilk commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/dentist-project.git
git push -u origin main
```

> ⚠️ `KULLANICI_ADINIZ` kısmını kendi GitHub kullanıcı adınızla değiştirin.

---

## BÖLÜM 2: Neon ile Bulut Veritabanı Kurun

### Adım 2.1 — Neon hesabı açın

1. [neon.tech](https://neon.tech) adresine gidin
2. **"Sign Up"** butonuna tıklayın
3. **GitHub ile giriş yapın** (en kolay yol)

### Adım 2.2 — Proje ve veritabanı oluşturun

1. Giriş yaptıktan sonra **"Create a project"** butonuna tıklayın
2. Şu bilgileri doldurun:
   - **Project name:** `dentist-project`
   - **Database name:** `dentist_db`
   - **Region:** `Europe West (Frankfurt)` seçin (Türkiye'ye en yakın)
   - **Postgres version:** `16` bırakın
3. **"Create project"** butonuna tıklayın

### Adım 2.3 — Bağlantı adresini kopyalayın

Proje oluştuktan sonra karşınıza bir ekran gelecek. Orada **"Connection string"** yazan bir alan var.

Şöyle görünür:
```
postgresql://neondb_owner:AbCdEfGh12345@ep-cool-name-123456.eu-west-2.aws.neon.tech/dentist_db?sslmode=require
```

> 🔴 KRİTİK: Bu bağlantı adresini bir yere kopyalayıp saklayın!
> Bu şifredir, başkasıyla paylaşmayın.

---

## BÖLÜM 3: Veritabanı Tablolarını Oluşturun (Migration)

Neon veritabanı şu an boş. Tablolarınızı oluşturmanız gerekiyor.

### Adım 3.1 — Yerel `.env` dosyasını geçici olarak güncelleyin

`apps/api/.env` dosyasını açın ve `DATABASE_URL` satırını değiştirin:

```env
# ÖNCE bu satırı bir yere kopyalayıp yedekleyin (eski local url'niz):
# DATABASE_URL="postgresql://postgres:Mehmet12345@localhost:5432/dentist_db"

# SONRA bunu yeni Neon URL'iniz ile değiştirin:
DATABASE_URL="postgresql://neondb_owner:SIFRENIZ@ep-xxx.eu-west-2.aws.neon.tech/dentist_db?sslmode=require"
```

### Adım 3.2 — Migration'ı çalıştırın

Terminalde `apps/api` klasörüne gidin:

```bash
cd d:/DentistProject/apps/api
```

Şu komutu çalıştırın:

```bash
npx prisma migrate deploy
```

> Bu komut Neon'daki boş veritabanına tüm tablolarınızı oluşturur.
> Şöyle bir çıktı görmelisiniz:
> ```
> Applying migration `20260419141611_init`
> All migrations have been applied.
> ```

### Adım 3.3 — Demo verilerini yükleyin (İsteğe bağlı)

Sisteme test için hazır veri yüklemek isterseniz:

```bash
npm run seed
```

Bu komut şu demo kullanıcıları oluşturur:
- Admin: `admin@demodis.com` / `password123`
- Doktor: `doktor@demodis.com` / `password123`
- Asistan: `asistan@demodis.com` / `password123`

---

## BÖLÜM 4: Railway ile Backend'i Yayınlayın

### Adım 4.1 — Railway hesabı açın

1. [railway.app](https://railway.app) adresine gidin
2. **"Login"** → **"Login with GitHub"** seçin
3. GitHub hesabınızla giriş yapın

### Adım 4.2 — Yeni proje oluşturun

1. Dashboard'da **"New Project"** butonuna tıklayın
2. **"Deploy from GitHub repo"** seçin
3. Açılan listede `dentist-project` repo'nuzu seçin
4. Railway sizi proje sayfasına yönlendirecek

### Adım 4.3 — API servisini yapılandırın

Sol menüden servisinize tıklayın, ardından:

**"Settings"** sekmesine gidin:

- **Root Directory:** `apps/api` yazın
  > ⚠️ Bu çok önemli! Railway'e sadece api klasörünü çalıştırmasını söylüyoruz.
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/main`

**"Variables"** sekmesine gidin ve şu değişkenleri tek tek ekleyin:

| Değişken Adı | Değer |
|---|---|
| `DATABASE_URL` | Neon'dan kopyaladığınız URL |
| `JWT_SECRET` | `8d5954424a9c5370f17003871b40a703d3d61a448e92b534fa5eb591925be87b` |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `API_PORT` | `3001` |
| `NEXT_PUBLIC_API_URL` | Şimdilik boş bırakın, Vercel deploy olduktan sonra dolduracağız |

> Her değişkeni girdikten sonra "Add" butonuna basın.

### Adım 4.4 — Deploy edin

"Deploy" butonuna tıklayın. Railway build işlemini başlatacak.

Sağ altta bir log ekranı açılır. Şunları görmelisiniz:
```
✓ Build successful
✓ API is running on: http://localhost:3001/api
```

Build 3-5 dakika sürebilir. Bitince Railway size bir URL verir:
```
https://dentist-project-production.up.railway.app
```

> 🔴 KRİTİK: Bu URL'i kopyalayın! Vercel ayarlarında kullanacaksınız.

### Adım 4.5 — API'nin çalıştığını test edin

Tarayıcınızda şu adrese gidin:
```
https://RAILWAY_URL_NIZI.up.railway.app/api
```

Ekranda JSON bir yanıt veya "Not Found" yazıyorsa API çalışıyor demektir. ✅

---

## BÖLÜM 5: Vercel ile Frontend'i Yayınlayın

### Adım 5.1 — Vercel hesabı açın

1. [vercel.com](https://vercel.com) adresine gidin
2. **"Sign Up"** → **"Continue with GitHub"** seçin

### Adım 5.2 — Projeyi import edin

1. Dashboard'da **"Add New..."** → **"Project"** tıklayın
2. GitHub repo listenizden `dentist-project`'i bulun
3. **"Import"** butonuna tıklayın

### Adım 5.3 — Proje ayarlarını yapın

Import ekranında şunları ayarlayın:

- **Framework Preset:** `Next.js` (otomatik algılıyor, değiştirmeyin)
- **Root Directory:** **"Edit"** butonuna basın → `apps/web` yazın
  > ⚠️ Bu çok önemli! Vercel'e sadece web klasörünü deploy etmesini söylüyoruz.

**"Environment Variables"** bölümünü genişletin ve şunu ekleyin:

| Değişken Adı | Değer |
|---|---|
| `NEXT_PUBLIC_API_URL` | Railway'den aldığınız URL (örn: `https://dentist-project-production.up.railway.app`) |

> ⚠️ Sonuna `/api` EKLEMEYİN, sadece ana URL'i girin.

### Adım 5.4 — Deploy edin

**"Deploy"** butonuna tıklayın.

Vercel build'i başlatır (2-3 dakika). Bitince size bir URL verir:
```
https://dentist-project.vercel.app
```

---

## BÖLÜM 6: Son Ayar — CORS Güncelleme

Railway'deki API'nizin Vercel sitenizden gelen isteklere izin vermesi için Railway'e Vercel URL'ini bildirmeniz gerekiyor.

### Adım 6.1 — Railway'de CORS ayarını güncelleyin

Railway → Projeniz → Variables sekmesine gidin.

`NEXT_PUBLIC_API_URL` değişkenini güncelleyin:
```
https://dentist-project.vercel.app
```

> Bu değişken `apps/api/src/main.ts` dosyasında CORS ayarı için kullanılıyor.

### Adım 6.2 — Railway'i yeniden başlatın

Variables sekmesinde değişiklik kaydedince Railway otomatik olarak yeniden başlar. 1-2 dakika bekleyin.

---

## BÖLÜM 7: Test Edin

Her şey hazır! Şimdi test edin:

1. Vercel URL'inizi tarayıcıda açın: `https://dentist-project.vercel.app`
2. Giriş ekranına gidin
3. Demo bilgileriyle giriş yapın:
   - Email: `admin@demodis.com`
   - Şifre: `password123`
4. Dashboard açılıyorsa her şey çalışıyor! ✅

---

## Sorun Giderme

### "CORS error" hatası alıyorsam
Railway'deki `NEXT_PUBLIC_API_URL` değişkeninin Vercel URL'iniz ile birebir aynı olduğundan emin olun. Sonunda `/` işareti olmamalı.

### "Cannot connect to database" hatası
Railway'deki `DATABASE_URL` değişkeninin Neon'dan kopyaladığınız URL ile aynı olduğunu kontrol edin. URL'nin sonunda `?sslmode=require` olmalı.

### Railway build başarısız oluyorsa
Railway loglarına bakın. Genellikle şu sorunlardan biri olur:
- `Root Directory` yanlış yazılmış (`apps/api` olmalı, başında `/` olmamalı)
- Build command yanlış

### Vercel build başarısız oluyorsa
Vercel loglarına bakın. Genellikle:
- `Root Directory` yanlış yazılmış (`apps/web` olmalı)
- `NEXT_PUBLIC_API_URL` değişkeni eksik

---

## Önemli Notlar

> 🔴 `apps/api/.env` dosyanızdaki gerçek şifreleri GitHub'a yüklemeyin!
> `.gitignore` dosyanızda `.env` satırının olduğundan emin olun.
> Yoksa şu komutu çalıştırın: `echo ".env" >> .gitignore`

> 🟡 Railway ücretsiz planda ayda 500 saat çalışma hakkı var.
> Neon ücretsiz planda 0.5 GB depolama limiti var.

> 🟢 Kodunuzda değişiklik yaptığınızda sadece `git push` yapmanız yeterli.
> Railway ve Vercel otomatik olarak yeniden deploy eder.

---

## Özet — Hızlı Kontrol Listesi

- [ ] GitHub'a proje yüklendi
- [ ] Neon'da veritabanı oluşturuldu
- [ ] Neon connection string kopyalandı
- [ ] `prisma migrate deploy` çalıştırıldı
- [ ] `npm run seed` çalıştırıldı (demo veriler)
- [ ] Railway'de servis oluşturuldu
- [ ] Railway'de Root Directory `apps/api` ayarlandı
- [ ] Railway'de tüm environment variables eklendi
- [ ] Railway deploy başarılı, URL alındı
- [ ] Vercel'de proje oluşturuldu
- [ ] Vercel'de Root Directory `apps/web` ayarlandı
- [ ] Vercel'de `NEXT_PUBLIC_API_URL` eklendi (Railway URL)
- [ ] Vercel deploy başarılı, URL alındı
- [ ] Railway'deki `NEXT_PUBLIC_API_URL` Vercel URL ile güncellendi
- [ ] Siteye giriş test edildi ✅
