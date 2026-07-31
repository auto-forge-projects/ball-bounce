# Faz 12 — CI/CD

## Var olan (scaffold'dan, dokunulmadı)
- `.github/workflows/ci.yml` — push/PR'da `npm test` koşar (26/26 test — REQ-001 revalidasyonu, bkz. aşağı).
- `.github/workflows/deploy-image.yml` — GHCR'a build+push, ardından SSH ile `deploy/remote-deploy.sh` çalıştırır (`deploy.json.enabled:true` gate'i — bu projede zaten `true`, `host_port:5007`).
- `deploy.json` — `port:3000`, `healthcheck:/health` — bu faz için değiştirilmedi.

## Eklenen: `Dockerfile`
- Taban imaj: `node:22-alpine`.
- Tek-stage: `npm ci --omit=dev` (yalnız `express`, dev bağımlılık yok).
- `COPY src ./src` + `COPY public ./public` — Faz 9 kararıyla (DL-09-001) hizalı dizin yapısı; `CMD ["node", "src/server.js"]`.
- Sunucu zaten stateless (NFR-4) — volume/DB gerekmiyor.

## Doğrulama (lokalde çalıştırıldı)
- `docker build -t ball-bounce:test .` → **başarılı**.
- Host-portu-publish edilmiş çalıştırma (`docker run -p ...`) bu sandbox ortamında izin sistemi tarafından reddedildi ("Permission ... denied") — url-shortener/dice-game fazlarında da görülen bilinen kısıt.
- Bunun yerine imaj **container-içi doğrulandı** (host port bind gerektirmeden): `docker run --rm ball-bounce:test node --input-type=module -e "..."` ile `src/server.js`'teki `createServer()` içeriden çağrıldı, `127.0.0.1`'e rastgele porta bind edildi ve container'ın kendi Node süreci içinden `GET /health` → `200 {"status":"ok"}`, `GET /` → `200 text/html` (595 byte, `index.html`) doğrulandı.
- Test imajı temizlendi (`docker rmi`) — yerel Docker ortamında kalıntı yok.

## Kalite kapısı raporu
- ✅ Pipeline artefaktları mevcut: `ci.yml` + `deploy-image.yml` (scaffold) + yeni `Dockerfile`.
- ✅ `Dockerfile` gerçekten build ediliyor (`docker build` başarılı).
- ✅ İmaj çalışıyor, `/health` 200 ve statik `index.html` servis ediliyor (container-içi doğrulandı).
- ⚠️ Host-portu-publish edilmiş dış erişim bu ortamda test edilemedi (sandbox `-p` kısıtı, DL-12-001'de not edildi) — gerçek doğrulama SSH-deploy sonrası `deploy/remote-deploy.sh`'in kendi health-probe'uyla yapılır.
- ✅ `state.product.commands.run` tanımlı (dashboard "Ürün" paneli).

## Revalidasyon (AF-091 — REQ-001 delta, cycle 2)
- Tarih: 2026-07-31 | Tetikleyici: Faz 9'a `boot()` bootstrap eklendi (DL-09-002), yalnız `public/game.js` + yeni test dosyası değişti.
- Etki: YOK — `Dockerfile` `COPY public ./public` zaten tüm `public/` dizinini kopyalıyor (yeni kod dahil), `ci.yml` genel `npm test` çalıştırır (yeni test otomatik dahil). Dockerfile/CI/deploy.json değişikliği gerekmedi.
