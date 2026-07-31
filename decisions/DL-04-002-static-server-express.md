# DL-04-002: Statik içerik servisi — Node + minimal Express (+ /health)

- Tarih: 2026-07-31
- Faz: 4 — Çözüm Analizi
- Mod: AUTOPILOT
- Karar: Ürün, `public/` altındaki statik dosyaları servis eden ~15 satırlık bir Node/Express sunucusuyla paketlenecek; `/health` ucu deploy probe'u için eklenecek. Sunucu tarafında oyun state'i, oturum ya da veritabanı YOKTUR (NFR-4).
- Değerlendirilen alternatifler: (B2) nginx-only konteyner imajı; (B3) çıplak Node `http` modülü ile elle statik servis.
- Gerekçe: Fabrika deploy hattı (SSH-push → `docker run 127.0.0.1:<host_port>` → host nginx reverse proxy → `/health` probe) emsal projelerde (coinflip, dice-game, snake-game) B1 ile doğrulandı; sapmanın getirisi (imaj boyutu) NFR listesinde bir hedef değil. B3 tek bağımlılığı kaldırır ama MIME/404/health kodunu elle yazdırır — net kayıp. B2 en küçük imaj (~25MB) ama canlıda zaten host nginx var; iki katman nginx işletim karmaşıklığı ekler.
- Riskler: (1) express transitive bağımlılık yüzeyi → sürüm sabitlenir, Faz 7'de bağımlılık denetimi. (2) İmaj boyutu (~130MB) — kabul edildi, izlenecek; sorun olursa B2'ye geçilir.
- Geri alınabilirlik: Yüksek (statik varlıklar sunucudan tamamen bağımsız; B2/B3'e geçiş yalnız Dockerfile + birkaç satır sunucu kodu — saatlik iş, kilitlenme yok).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti)
- Varsayım mı?: Evet — AUTOPILOT varsayımı: imaj boyutu için bir üst sınır gereksinimi bulunmadığı varsayıldı (NFR-1..4'te yok); yanlışsa B2'ye geçilir.
