# DL-07-001: Güvenlik temeli — bağımlılıksız header middleware + sıkı statik servis

- Tarih: 2026-07-31
- Faz: 7 — Güvenlik
- Mod: AUTOPILOT
- Karar: ball-bounce'un güvenlik temeli **yeni bağımlılık eklemeden** kurulur: `helmet` yerine
  ~10 satırlık elle yazılmış header middleware (sıkı CSP `default-src 'none'` + `script-src 'self'`,
  nosniff, `frame-ancestors 'none'`, no-referrer, Permissions-Policy, HSTS), `express.static` sabit
  kök + `dotfiles:'ignore'` + `redirect:false`, gövde parser YOK / yalnız GET-HEAD, `/health` sabit
  gövde, non-root container ve lockfile+`npm ci`+`npm audit` tedarik zinciri disiplini. Kimlik
  doğrulama ve yetkilendirme **bilinçli olarak eklenmez**. Somut çıktı: Faz 9/12'ye devredilen
  SEC-1..SEC-14 maddeleri.
- Değerlendirilen alternatifler: (1) `helmet` paketi eklemek — hazır, bakımlı, doğru varsayılanlar;
  (2) hiç header koymamak ("statik oyun, riski yok"); (3) statik dosyaları Express yerine nginx'ten
  servis etmek (uygulamada statik yüzey kalmaz).
- Gerekçe: Mimarinin taşıyıcı ilkesi sıfır/asgari bağımlılıktır (NFR-3, DL-04-002); tek sayfalık bir
  oyun için `helmet` transitif bağımlılık ve sürüm bakımı getirir, oysa ihtiyaç duyulan 5-6 header
  statiktir ve değişmez — kod bakım maliyeti paket bakım maliyetinden düşük. (2) reddedildi: sıkı CSP
  ve `nosniff` bedava ve gerçek fayda sağlıyor; A05 bu mimarinin en somut OWASP riski. (3) reddedildi:
  Faz 4'te statik servis için Express seçildi (DL-04-002), mimariyi güvenlik uğruna değiştirmek
  orantısız — traversal riski `express.static`'in kendi güvenli çözümleyicisiyle zaten kapalı.
  Auth eklememe kararı, korunacak varlık (hesap/PII/ayrıcalıklı işlem) bulunmadığı içindir; auth
  eklemek yoktan bir kimlik deposu ve oturum saldırı yüzeyi yaratırdı.
- Riskler: (a) Elle yazılan header seti zamanla eksik kalabilir (yeni bir header standartlaşır) —
  Faz 10 review checklist'i ve Faz 15 bakım maddesi bunu izler. (b) CSP çok sıkı olursa oyun kırılır
  (özellikle inline `<script>`/inline style kullanılırsa) — Faz 9 harici `.js`/`.css` kullanmak
  zorundadır, Faz 11 tarayıcı doğrulaması bunu yakalar. (c) Uygulama düzeyinde rate limiting yok:
  düşük şiddetli artık risk, altyapı (nginx) katmanına bırakıldı; skor manipülasyonu da otorite
  üretmediği için kabul edildi — ikisi de `docs/07-security.md` "Kabul edilen artık riskler"
  tablosunda kayıtlı ve liderlik tablosu eklenirse Faz 7 yeniden koşulur.
- Geri alınabilirlik: Yüksek (header middleware tek bir fonksiyon — `helmet`'e geçiş veya politika
  gevşetmesi tek dosyada, birkaç satırlık değişiklik; auth kararı yeni bir faz-7 koşumuyla dönülür).
- İnsan onayı: Otomatik
- Varsayım mı?: Evet — AUTOPILOT varsayımı: ürünün liderlik tablosu/skor gönderimi gibi sunucu-tarafı
  bir özelliği hiç olmayacağı ve dağıtımın TLS sonlandıran bir reverse proxy arkasında yapılacağı
  varsayıldı (Faz 5 + fabrika deploy kalıbı). Bu varsayım bozulursa A01/A04/A07 satırları yeniden
  değerlendirilmelidir.
