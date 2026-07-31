# DL-11-001: Test stratejisi — ayrı E2E katmanı yerine mevcut entegrasyon testlerinin genişletilmesi

- Tarih: 2026-07-31
- Faz: 11 — Test
- Mod: AUTOPILOT
- Karar: Faz 11 için ayrı bir jsdom/gerçek-tarayıcı E2E katmanı YAZILMADI; bunun yerine Faz 9'un `tests/game.test.js` (fake-dom ile canvas/window sahtesi) + `tests/physics.*.test.js` + `tests/server.test.js` dosyaları FR-1..FR-6 ve ölçülebilir NFR'lerin tamamını zaten karşıladığı doğrulandı (bkz. `docs/11-test/test-plan.md` eşleme tablosu), NFR-3/NFR-4 için statik kod incelemesi eklendi (`docs/11-test/results.md`).
- Değerlendirilen alternatifler: (1) `draw-straws`/`snake-game` emsalinde olduğu gibi ayrı `tests/e2e/` + gerçek jsdom `<script>` enjeksiyonu eklemek. (2) Gerçek tarayıcı (Playwright) ile uçtan uca test.
- Gerekçe: DL-05-001 gereği `public/game.js` zaten ince bir I/O adaptörüdür (rAF+render+HUD+input→`hit()`) ve `tests/helpers/fake-dom.js` bunu gerçek DOM olmadan uçtan uca (pointerdown/keydown → state geçişi → HUD/overlay metni) tetikliyor — ayrı bir E2E katmanı aynı senaryoları ikinci kez, yalnız daha ağır bir harness ile (jsdom kurulumu, script enjeksiyonu) tekrar edecekti. LITE artefakt bütçesi (7b) gereksiz tekrarı caydırır. Playwright eklemek NFR-3'ün "ek derleme/araç yükü yok" ölçütüyle çelişir ve bu ölçekte (tek HTML sayfası, ~400 satır kod) getirisi maliyetini karşılamaz.
- Riskler: Gerçek tarayıcı DPR/canvas render'ı (görsel doğruluk) otomatik test kapsamı dışında kalır — kabul edildi, düşük risk (render mantığı `game.js`'te ince, `physics.js` state hesaplaması zaten birim test kapsamında). Kapsam dışı liste `test-plan.md`'de kayıtlı.
- Geri alınabilirlik: Yüksek (ihtiyaç doğarsa `tests/e2e/` eklemek mevcut testleri bozmaz, yalnız üstüne katman ekler).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti)
- Varsayım mı?: Evet — AUTOPILOT varsayımı: mevcut entegrasyon testlerinin E2E'ye eşdeğer güvence sağladığı kabul edildi; kullanıcı gerçek tarayıcı doğrulaması isterse Faz 15 borcuna eklenir.

## Revalidasyon (AF-091 — REQ-001 delta, cycle 2)
- Tarih: 2026-07-31 | Tetikleyici: Faz 9'a `boot()` bootstrap eklendi (DL-09-002) — bu fazın çıktısı eski (bootstrap'sız) koda dayanıyordu.
- Etki: `tests/game.boot.test.js` yeni kritik senaryo olarak `test-plan.md`'e eklendi (bootstrap→render), `results.md` güncel koşuma (26/26 pass, coverage 98.37/93.04/93.75) göre yenilendi. Strateji/karar DEĞİŞMEDİ — yalnız kapsam genişledi.
