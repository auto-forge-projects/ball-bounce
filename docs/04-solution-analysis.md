# 04 — Çözüm Analizi: ball-bounce

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE
- Girdi: `docs/03-requirements.md` (FR-1..FR-6, NFR-1..NFR-4), `docs/01-02-value-feasibility.md`

## Karar 1 — Oyun döngüsü & render katmanı (istemci)

### Alternatifler
- **A — (A1) Vanilla Canvas 2D + `requestAnimationFrame`:** tek `<canvas>`, elle yazılmış yerçekimi/vuruş fiziği (~150 satır), sıfır bağımlılık.
- **B — (A2) Oyun/fizik kütüphanesi (Phaser, kaboom.js, matter.js):** hazır sahne + fizik motoru; CDN veya bundle ile gelir.
- **C — (A3) DOM + CSS transform/animation:** top bir `<div>`, konum `transform: translate()` ile güncellenir; Canvas yok.

### Trade-off matrisi
| Kriter | A1 Canvas 2D (vanilla) | A2 Oyun kütüphanesi | A3 DOM + CSS |
|---|---|---|---|
| Maliyet (geliştirme) | Düşük — fizik basit: `v += g; y += v` | Düşük ama API öğrenme + entegrasyon turu | Çok düşük |
| Karmaşıklık (runtime) | Düşük, tek dosya | Yüksek — 200KB–1MB bağımlılık, build/CDN kararı | Düşük |
| NFR-1/2 (≤1 sn tepki) | ✅ rAF ~16ms frame | ✅ ama ağır yükleme ilk kare gecikmesi | ⚠️ CSS animasyon ile çarpışma/temas anını frame-hassas yakalamak zor |
| NFR-3 (framework'süz, ek derleme yok) | ✅ tam uyum | ❌ ihlal (bağımlılık + çoğu durumda bundle) | ✅ uyumlu |
| NFR-4 (oturum-içi state) | ✅ nötr | ✅ nötr | ✅ nötr |
| FR-5 (kademeli hız artışı) | ✅ tek katsayıyı büyütmek yeterli | ✅ motor parametresi | ⚠️ süregelen animasyonu ortada yeniden hızlandırmak kırılgan |
| FR-6 (fare+klavye+dokunma) | ✅ canvas üzerinde tek noktadan event | ✅ | ✅ |
| Test edilebilirlik (Faz 9/11) | ✅ saf fizik fonksiyonları DOM'suz birim-test edilir | ⚠️ motor mock'u gerekir | ❌ mantık CSS'e sızar, birim-test zor |
| İlk yükleme (KPI-1 ≤5 sn) | ✅ tek HTML+JS, <50KB | ⚠️ kütüphane indirmesi | ✅ |
| Geri alınabilirlik | Yüksek — render katmanı izole, sonradan lib eklenebilir | Orta — kod motora bağlanır | Orta |

### Seçim: **A1 — Vanilla Canvas 2D + requestAnimationFrame**
- NFR-3 açıkça "framework'süz HTML/Canvas/JS, ek derleme yok" diyor → A2 gereksinim ihlali (göstermelik değil, gerçek eleme sebebi).
- Fizik kapsamı tek boyutlu (dikey hız + yerçekimi + üst sınırlı ivme); motor getirisi maliyetini karşılamıyor.
- A3, FR-3'ün "zeminle temas ≤1 sn" ve FR-1'in isabet kontrolü için frame-başına konum bilgisi ister; CSS animasyonunda bu bilgi ya `getBoundingClientRect()` polling'i ile taklit edilir ya da JS'e geri döner — yani A1'in karmaşıklığına ek bir dolaylılıkla varılır.
- Emsal doğrulaması: snake-game/coinflip aynı desende üretildi ve deploy akışı kanıtlandı.

## Karar 2 — Statik içerik servisi (sunucu tarafı)

### Alternatifler & matris
| Kriter | B1 Node + Express (minimal) | B2 nginx-only imaj | B3 Çıplak Node `http` modülü |
|---|---|---|---|
| Bağımlılık | 1 npm paketi (express) | 0 npm, nginx imajı | 0 npm |
| İmaj boyutu | ~130MB (node:alpine) | ~25MB (nginx:alpine) | ~130MB |
| Karmaşıklık | Çok düşük, 15 satır | Düşük ama ayrı `nginx.conf` + MIME/SPA kuralları | Düşük ama MIME/404'ü elle yazmak gerekir |
| Deploy uyumu (SSH-push + host nginx reverse proxy, `127.0.0.1:<port>`) | ✅ emsallerle birebir aynı | ⚠️ nginx-içinde-nginx; çalışır ama fabrika şablonundan sapar | ✅ |
| Healthcheck (`/health`, kural 9 probe) | ✅ tek route | ⚠️ statik dosya ile taklit | ✅ elle route |
| Test edilebilirlik (Faz 11/12) | ✅ supertest/fetch ile kolay | ⚠️ konteyner gerektirir | ✅ |
| Geri alınabilirlik | Yüksek — 15 satır, B2/B3'e geçiş saatlik iş | Yüksek | Yüksek |

### Seçim: **B1 — Node + Express minimal statik sunucu (+ `/health`)**
- Fabrika deploy hattı (`deploy.json.host_port` → host nginx bloğu → `/health` probe) emsal projelerde B1 ile doğrulanmış; sapma riski getirisinden büyük.
- B3'ün tek kazancı bir bağımlılığın kaldırılması; karşılığında MIME/404/health kodu elle yazılır — NFR'lerde imaj boyutu hedefi yok, bu takas değmez.
- B2 en küçük imajı verir; canlıda zaten host nginx var, iki katman nginx işletim karmaşıklığı ekler. İleride imaj boyutu sorun olursa B2'ye geçiş yalnız Dockerfile + conf değişimidir (yüksek geri alınabilirlik).

## Kalite kapısı raporu
- "≥2 alternatif karşılaştırıldı" → ✅ İstemci: 3 alternatif (A1/A2/A3) 10 kriterde satır satır; Sunucu: 3 alternatif (B1/B2/B3) 7 kriterde satır satır.
- "Seçim gerekçeli" → ✅ Her iki kararda eleme sebebi somut (NFR-3 ihlali, frame-hassas temas, deploy hattı uyumu).
- Decision Log: `decisions/DL-04-001-client-vanilla-canvas.md`, `decisions/DL-04-002-static-server-express.md`
