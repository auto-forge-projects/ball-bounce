# 07 — Güvenlik Tasarımı: ball-bounce

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE
- Girdi: `docs/03-requirements.md`, `docs/05-architecture.md`

## Saldırı yüzeyi özeti
İki bileşen var: (1) tarayıcıda çalışan statik istemci (Canvas 2D + ESM, 0 runtime bağımlılık),
(2) `server.js` — Express `static` + `GET /health`. **Sunucuya giden kullanıcı verisi yok**
(gövde parser yok, oyun ucu yok, DB/oturum/kimlik yok, NFR-4 gereği `fetch`/cookie/storage yok).
Bu yüzden gerçek risk üç yerde yoğunlaşır: **statik dosya servisi**, **tarayıcı tarafı içerik
politikası (header'lar)** ve **npm tedarik zinciri + imaj/CI hattı**.

## Varlıklar ve veri sınıflandırma
| Veri | Sınıf | Nerede duruyor | Koruma |
|------|-------|----------------|--------|
| Oyun state'i (skor, top konumu, `speed`) | Public / geçici | Yalnız tarayıcı belleği (modül-kapsamlı obje) | Kalıcılık yok; sayfa yenileme sıfırlar (NFR-4) |
| Statik varlıklar (`index.html`, `game.js`, `physics.js`, `style.css`) | Public | Repo + imaj + `public/` | Salt okunur servis; yazma ucu yok |
| `/health` yanıtı | Public | Bellek (sabit `{status:"ok"}`) | Sürüm/uptime/env sızdırmaz (SEC-5) |
| HTTP erişim logları (IP, UA, yol) | Internal (IP zayıf-PII) | Sunucu/container stdout | Oyun verisi loglanmaz; kısa saklama, log'a sorgu gövdesi yazılmaz |
| Deploy sırları (SSH key, registry token) | Confidential | GitHub Secrets + sunucu ortamı | Repoda/imajda düz sır YOK; `deploy.json` yalnız `env_ref` |
| PII | — | Yok | Toplanmıyor: hesap, form, analitik, çerez yok |

## Threat model (STRIDE)
| Bileşen | S | T | R | I | D | E | Önlemler |
|---------|---|---|---|---|---|---|----------|
| Tarayıcı istemci (`game.js`/`physics.js`) | – (kimlik yok) | Orta: konsoldan skor/fizik değiştirilebilir | – (skor sunucuya gitmiyor, inkâr edilecek işlem yok) | Düşük: kod zaten public | Düşük: yalnız kendi sekmesi | Düşük: sandbox tarayıcıda | Skor **otorite değildir**; kalıcı/paylaşılan liderlik tablosu yok → hile etkisi oyuncunun kendisiyle sınırlı. XSS yüzeyi: `innerHTML`/`eval` yasak (SEC-7) |
| Express statik servis | – | Düşük: sunucu salt okunur | Düşük | **Ana risk: path traversal / gizli dosya ifşası** | Orta: bağlantı seli | – | `express.static` sabit kök + `dotfiles:'ignore'`, kullanıcı girdisinden yol KURULMAZ (SEC-3), yalnız GET/HEAD (SEC-4) |
| `GET /health` | – | – | – | Düşük: sürüm/env sızıntısı | Düşük: ucuz yanıt | – | Sabit gövde, sürüm/host/uptime yok (SEC-5) |
| npm bağımlılık zinciri (`express`) | Orta: paket adı ele geçirme | Orta: postinstall betiği | – | Orta: sır çalan paket | – | Yüksek: build ana kullanıcı | Sabit sürüm + `package-lock.json` + `npm ci` + `npm audit` (SEC-6) |
| Docker imaj / deploy hattı | Orta | Orta | Düşük | Orta: imaja gömülü sır | Düşük | Orta: root container | `USER node`, sırsız imaj, `127.0.0.1:<host_port>` bağlama, nginx/TLS önde (SEC-9) |

## Auth / Authz stratejisi
**Kimlik doğrulama ve yetkilendirme YOKTUR — ve olmaması bilinçli bir tasarım kararıdır.** Oyun
anonim, tek oturumluk ve tamamen istemci-içidir; korunacak hesap, kişisel veri veya ayrıcalıklı
işlem yoktur. Auth eklemek saldırı yüzeyini (kimlik deposu, oturum çerezi, parola akışı) yoktan
var ederdi. Sunucu tarafında **her istemci eşit ve yetkisizdir**; erişilebilen tek şey public
statik dosyalar + `/health`'tir. Yönetim ucu, admin paneli, yazma ucu yok. Oturum yönetimi yok
(çerez/JWT/sunucu oturumu kullanılmaz) → oturum çalma/sabitleme sınıfı tehditler doğmaz.
Gelecekte liderlik tablosu istenirse bu bölüm ve A01/A07 satırları YENİDEN değerlendirilmelidir.

## OWASP Top 10 (2021) değerlendirmesi
| # | Risk | Uygulanabilir mi | Önlem / Neden uygulanamaz |
|---|------|------------------|----------------------------|
| A01 | Broken Access Control | **Kısmen** | Rol/kaynak sahipliği yok (korunan kaynak yok) ama **statik servis path traversal + gizli dosya ifşası gerçek risktir**: `express.static` sabit `path.join(__dirname,'public')` kökü, `dotfiles:'ignore'`, `redirect:false`; kullanıcı girdisinden dosya yolu türetilmez, `res.sendFile(req.*)` yasak (SEC-3). CORS açılmaz. |
| A02 | Cryptographic Failures | **Kısmen** | Şifrelenecek/saklanan veri yok (parola, token, PII yok) → uygulama içi kripto gereksiz. Transit güvenliği yine de gerekli: yayın **HTTPS** (wildcard TLS + nginx), HTTP→HTTPS yönlendirme, `Strict-Transport-Security` (SEC-2). Kendi kripto yazılmaz. |
| A03 | Injection | **Düşük ama var** | SQL/NoSQL/ORM yok, shell çağrısı yok, sunucu kullanıcı girdisi işlemez (gövde parser eklenmez, SEC-4) → klasik injection yolu kapalı. Kalan yüzey **DOM-XSS**: skor/overlay metni `innerHTML` ile değil `textContent`/canvas `fillText` ile yazılır; `eval`/`new Function`/`setTimeout(string)` yasak (SEC-7). |
| A04 | Insecure Design | **Evet** | Tasarım kararları güvenlik lehine: state'siz sunucu, kalıcılık yok, 0 istemci bağımlılığı, tek `hit()` girdi noktası. Bilinçli güvensizlik: **istemci skoru güvenilmezdir** — bu kabul edilebilir çünkü skor hiçbir yerde ödül/otorite üretmez (liderlik tablosu yok). Skor sunucuya taşınırsa tasarım yeniden gözden geçirilir. |
| A05 | Security Misconfiguration | **Evet — bu mimarinin en somut riski** | `app.disable('x-powered-by')`; güvenlik header'ları elle eklenir (SEC-2): `Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy: geolocation=(), camera=(), microphone=()`, HSTS. Dizin listeleme kapalı, hata gövdesi stack/dosya yolu sızdırmaz (SEC-10), container non-root (SEC-9). |
| A06 | Vulnerable & Outdated Components | **Evet** | Tek runtime bağımlılık `express` (sabit sürüm), istemcide **sıfır** bağımlılık/CDN. `package-lock.json` commit'lenir, kurulum `npm ci`, CI'da `npm audit --omit=dev --audit-level=high` (SEC-6). Yeni bağımlılık eklemek bilinçli karar + DL gerektirir. |
| A07 | Identification & Authentication Failures | **Hayır** | Kimlik/oturum/parola/token mekanizması hiç yok (bkz. Auth bölümü) → brute force, credential stuffing, oturum sabitleme sınıfı tehditler doğmaz. Auth eklenirse bu satır geçersizdir. |
| A08 | Software & Data Integrity Failures | **Evet** | Dış script/CDN yüklenmez (SRI ihtiyacı doğmaz), auto-update/deserialization yok. Bütünlük hattı **tedarik zinciridir**: lockfile + `npm ci` + pinned base image (`node:<sürüm>-alpine`), CI workflow'unda `secrets` üçüncü-parti action'a verilmez, imaj yalnız kendi CI'ından push edilir (SEC-6/9/11). |
| A09 | Security Logging & Monitoring Failures | **Kısmen** | Denetlenecek güvenlik olayı (giriş, yetki reddi, işlem) yok. Yine de operasyonel görünürlük gerekir: sunucu başlatma/çökme logu + `/health` probe'u izlenir (Faz 14); loga oyun verisi/sorgu gövdesi/sır YAZILMAZ, IP logları kısa saklanır (SEC-12). Alarm: `/health` yanıt vermiyorsa. |
| A10 | Server-Side Request Forgery (SSRF) | **Hayır** | Sunucu **hiçbir giden istek yapmaz** (`fetch`/`http.request`/proxy/webhook/URL parametresi yok); kullanıcının etkileyebileceği bir hedef URL kavramı yoktur. Kod incelemesiyle doğrulanır: `server.js` içinde giden ağ çağrısı olmamalı (SEC-13). |

## AI tedarik zinciri & fabrika tehditleri
| Tehdit | Uygulanabilir? | Önlem / Neden uygulanamaz |
|--------|----------------|----------------------------|
| Prompt injection | Hayır | Üründe LLM/model çağrısı yok; kullanıcı girdisi hiçbir prompt'a girmez |
| Repo/artefakt prompt poisoning | Düşük | Repo tek sahipli ve fabrika tarafından üretildi; dış katkı/PR yolu yok |
| Dependency confusion | Düşük | Tek public paket (`express`), özel/iç scope paketi yok, registry varsayılan |
| Malicious package scripts | Evet | `npm ci` + lockfile; yeni bağımlılık eklenmez; CI'da `--ignore-scripts` değerlendirilir (SEC-6) |
| Shell komut güvenliği | Hayır | Uygulama `child_process` kullanmaz; kullanıcı içeriği kabuğa geçmez |
| Workspace / path & symlink escape | Evet | Statik kök sabit; `dotfiles:'ignore'`; sembolik link takibi statik kök dışına çıkmamalı (SEC-3) |
| Secret leakage | Evet | Repoda/imajda düz sır yok; `.gitignore`/`.dockerignore` ile `.env`+`node_modules` hariç; log'a sır yazılmaz (SEC-11) |
| Docker build izolasyonu | Evet | Pinned `node:alpine`, `USER node`, build-arg ile sır geçirilmez, imajda dev bağımlılık yok (SEC-9) |
| Üretilen CI güvenliği | Evet | Workflow yalnız gerekli izinlerle (`permissions: contents:read` + gerekli minimum), `pull_request_target` kullanılmaz, action'lar sabit sürümle (SEC-14) |
| MCP / tool izinleri | Hayır | Ürün ajan/araç yüzeyi içermez (fabrika tarafı kapsam dışı) |

## Faz 9'a devredilen güvenlik gereksinimleri (implementasyon listesi)
- [ ] **SEC-1:** `app.disable('x-powered-by')` — sunucu parmak izi verilmez.
- [ ] **SEC-2:** Bağımlılık eklemeden (helmet YOK) elle güvenlik header middleware'i: CSP (A05'teki tam politika), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, HSTS (`max-age=31536000; includeSubDomains`).
- [ ] **SEC-3:** `express.static(path.join(__dirname,'public'), { dotfiles:'ignore', index:'index.html', redirect:false })` — kullanıcı girdisinden dosya yolu KURULMAZ; `res.sendFile(req.params/query)` kullanılmaz.
- [ ] **SEC-4:** Gövde parser (`express.json`/`urlencoded`) EKLENMEZ; yalnız GET/HEAD servis edilir, diğer metodlar 404/405 döner.
- [ ] **SEC-5:** `GET /health` yalnız `{"status":"ok"}` döner — sürüm, uptime, env, hostname sızdırmaz.
- [ ] **SEC-6:** `express` sabit sürüm; `package-lock.json` commit'li; kurulum `npm ci`; CI'da `npm audit --omit=dev --audit-level=high` adımı (Faz 12).
- [ ] **SEC-7:** İstemcide `innerHTML`, `eval`, `new Function`, string-`setTimeout` YASAK; skor/overlay metni `textContent` veya canvas `fillText` ile yazılır.
- [ ] **SEC-8:** `localStorage`/`sessionStorage`/cookie/`fetch`/analitik/CDN kullanılmaz (NFR-4 ile aynı madde; Faz 10/11 statik grep ile doğrular).
- [ ] **SEC-9:** Dockerfile (Faz 12): pinned `node:<sürüm>-alpine`, `USER node` (non-root), imajda sır yok, container yalnız `127.0.0.1:<host_port>`'a bağlanır.
- [ ] **SEC-10:** 404/500 gövdeleri stack trace, dosya yolu veya iç hata detayı içermez; generic error handler tanımlanır.
- [ ] **SEC-11:** `.gitignore` + `.dockerignore` ile `.env`, `node_modules`, yerel artıklar hariç tutulur; repoda düz sır bulunmaz.
- [ ] **SEC-12:** Log'a oyun verisi, sorgu gövdesi veya sır yazılmaz; yalnız başlatma/hata + minimal erişim logu.
- [ ] **SEC-13:** `server.js` içinde giden ağ çağrısı (`fetch`/`http.request`/proxy) bulunmaz (A10 kanıtı).
- [ ] **SEC-14:** CI workflow'ları minimum `permissions` ile; action'lar sabit sürüm etiketiyle; sırlar üçüncü-parti action'a verilmez (Faz 12).

## Kabul edilen artık riskler (düşük şiddet — bloklamaz)
| Risk | Neden kabul edildi | İzleme |
|------|--------------------|--------|
| Uygulama düzeyinde rate limiting yok (A05/DoS) | Sunucu yalnız statik dosya servisi; hacim koruması altyapı katmanının (nginx/Cloudflare) işidir, uygulamaya bağımlılık eklemek maliyeti risk azalışını aşar | `/health` probe + Faz 14 alarmı; kötüye kullanım görülürse nginx `limit_req` |
| İstemci skoru manipüle edilebilir (A04) | Skor hiçbir otorite/ödül üretmez, paylaşılmaz, saklanmaz — etkisi oyuncunun kendi sekmesiyle sınırlı | Liderlik tablosu/skor gönderimi eklenirse Faz 7 yeniden koşulur |

## Kalite kapısı raporu
- "OWASP Top 10 değerlendirildi" → ✅ A01–A10'un **onu da** tek tek ele alındı; uygulanamaz olanlar (A07, A10) gerekçelendirildi, uygulanabilir olanlara somut SEC maddesi bağlandı.
- "Hassas veri sınıflandırması eksiksiz" → ✅ 6 varlık sınıflandırıldı; PII toplanmadığı açıkça kayıtlı.
- "STRIDE bileşen bazında" → ✅ 5 bileşen × 6 kategori.
- "Auth/Authz stratejisi" → ✅ (bilinçli "auth yok" kararı + yeniden değerlendirme tetikleyicisi).
- "AI/tedarik zinciri tehditleri" → ✅ 10 tehdit değerlendirildi.
- "Faz 9'a devredilebilir gereksinim listesi" → ✅ SEC-1..SEC-14, hepsi kontrol edilebilir ifadelerle.
- Decision Log: `decisions/DL-07-001-security-baseline.md`
