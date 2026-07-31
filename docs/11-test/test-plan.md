# 11 — Test Planı: ball-bounce

- Tarih: 2026-07-31 | Mod: AUTOPILOT | İnceleyen: test-engineer (inline, ⟲)

## Strateji
- Birim (Faz 9, `tests/physics.core.test.js` + `tests/physics.hit.test.js`): saf fizik çekirdeği (`createState`/`step`/`speedFor`/`tryHit`/`isGrounded`), DOM'suz.
- Entegrasyon (`tests/game.test.js`, `tests/helpers/fake-dom.js` ile sahte canvas/window): rAF döngüsü + input (pointer/keydown) + HUD/overlay — gerçek tarayıcı olmadan `public/game.js`'i uçtan uca tetikler. Ayrı bir jsdom/E2E katmanına gerek kalmadı çünkü `game.js` zaten I/O adaptörü kadar ince (DL-05-001) ve fake-dom onu bütünüyle kapsıyor.
- Bootstrap (`tests/game.boot.test.js`, REQ-001 delta): modül-seviyesi `boot(doc, win)`'in gerçek DOM elemanlarını (`canvas`/`score`/`game-over`/`final-score`/`restart`) bulup `createGame(...)`'i fiilen çağırdığını doğrular — REQ-001'in kök nedeni (bootstrap hiç test edilmiyordu) buydu.
- Sunucu (`tests/server.test.js`): `/health` + statik servis + güvenlik header'ları.

## Kritik senaryolar

| Senaryo | FR/NFR | Test | Katman |
|---------|--------|------|--------|
| Tıklama/dokunma (pointerdown) topu sektirir, ready→playing | FR-1, FR-6 | game.test.js "pointerdown" | Entegrasyon |
| Boşluk tuşu topu sektirir (klavye kontrolü) | FR-1, FR-6 | game.test.js "keydown Space" | Entegrasyon |
| Erişim dışı/cooldown içi vuruş reddedilir, skor değişmez | FR-1 | physics.hit.test.js (2 senaryo) | Birim |
| Başarılı sektirme skor HUD'ını günceller | FR-2 | game.test.js "rAF döngüsü" | Entegrasyon |
| Top zemine değince oyun durur + overlay + final skor | FR-3 | game.test.js "oyun bitişi" + physics.core.test.js "NFR-2" | Entegrasyon + Birim |
| "Yeniden başlat" skor/faz sıfırlar | FR-4 | game.test.js "Yeniden Başlat" | Entegrasyon |
| Hız skor arttıkça kademeli artar, üst sınırı aşmaz | FR-5 | physics.core.test.js "speedFor" | Birim |
| `/health` 200 + sürüm sızdırmaz | NFR ölçüt (SEC-5) | server.test.js | Birim |
| Framework'süz, ek derleme yok | NFR-3 | statik inceleme (bkz. results.md) | Statik |
| localStorage/sessionStorage/cookie kullanılmaz | NFR-4 | statik inceleme (bkz. results.md) | Statik |
| Modül yüklenince gerçek DOM ile oyun fiilen başlar (top render edilir) | FR-1, FR-6 (REQ-001 regresyon) | game.boot.test.js | Entegrasyon |

- Kapsam dışı (bilinçli): Gerçek tarayıcı/cihaz matrisi (dokunma olayının fiziksel donanımda tetiklenmesi) — LITE'ta manuel doğrulamaya bırakıldı, otomasyon kapsamı `Pointer Event` simülasyonuyla sınırlı (DL-11-001).

## Kalite kapısı raporu
- "Kritik senaryolar %100 geçti" → ✅ (bkz. results.md)
