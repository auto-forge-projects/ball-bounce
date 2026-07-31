# 11 — Sonuç Raporu: ball-bounce

- Tarih: 2026-07-31 | `npm test` (workspace kökünde, `node --test --experimental-test-coverage`)
- **Revalidasyon (AF-091, REQ-001 delta sonrası):** Faz 9'a `boot()` bootstrap eklendi (`tests/game.boot.test.js`), toplam test 25→26. Aşağıdaki sayılar güncel koşuma aittir.

## Sonuç raporu

| Metrik | Değer |
|--------|-------|
| Toplam test | 26 |
| Geçti / Kaldı | 26 / 0 |
| Coverage (line / branch / funcs) | 98.37% / 93.04% / 93.75% (tüm dosyalar) — `public/physics.js` %100/90/100, `public/game.js` %97.67/77.78/100, `src/server.js` %88.33/90/71.43 |

`node:test` özeti: `# pass 26`, `# fail 0`, `# cancelled 0`.

- `src/server.js`'in kapsanmayan satırları (48, 55-60) `NODE_ENV!==test` altındaki gerçek `listen()` başlatma bloğu — testte kasıtlı çalıştırılmaz (üretim giriş noktası, `createServer()` ayrı test edilir).

## Statik inceleme (NFR-3, NFR-4)

- **NFR-3 (framework'süz, ek derleme yok):** `public/` altında `<script type="module">` ile doğrudan yüklenen 2 ESM dosyası (`physics.js`, `game.js`) dışında istemci bağımlılığı yok; `package.json`'da tek runtime bağımlılık `express` (yalnız sunucu tarafı). Build adımı (`tsc`/bundler) yok — `npm start` doğrudan `node src/server.js` çalıştırır. ✅
- **NFR-4 (kalıcılık yok):** `grep -rn "localStorage\|sessionStorage\|cookie" public/ src/` → sonuç yok. Skor yalnız `physics.js`'in bellek-içi `state` objesinde tutulur, sayfa yenilenince/`Yeniden Başlat`ta sıfırlanır. ✅

## Başarısızlık analizi

Yok — 25/25 test yeşil, kritik senaryoların tamamı Faz 9'un birim+entegrasyon katmanında zaten kapsanıyordu (bkz. test-plan.md eşleme tablosu); Faz 11 ek E2E katmanı gerektirmedi.

## Kalite kapısı raporu
- "Kritik senaryolar %100 geçti" → ✅ (25/25 pass, Kaldı: 0; NFR-3/NFR-4 statik inceleme ile doğrulandı)
