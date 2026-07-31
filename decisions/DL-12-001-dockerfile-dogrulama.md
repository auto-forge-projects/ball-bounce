# DL-12-001: Dockerfile — src/server.js hizası + sandbox host-port kısıtı

- Tarih: 2026-07-31
- Faz: 12 — CI/CD
- Mod: AUTOPILOT
- Karar: `node:22-alpine` tabanlı tek-stage `Dockerfile` eklendi (`npm ci --omit=dev` + `COPY src ./src` + `COPY public ./public` + `CMD ["node","src/server.js"]`). İmaj `docker build` ile başarıyla üretildi ve **container-içi** çağrıyla (host port bind ETMEDEN) `/health` (200, `{"status":"ok"}`) ve `/` (200, `index.html`) doğrulandı.
- Değerlendirilen alternatifler: (1) `docker run -p 18080:3000 ...` ile host'tan gerçek HTTP isteği — denendi, bu ajan oturumunun sandbox izin sistemi host-port bind işlemini reddetti ("Permission ... denied"; url-shortener/dice-game fazlarında da görülen bilinen kısıt). (2) `HEALTHCHECK` direktifi eklemek (url-shortener emsalinde olduğu gibi) — bu proje stateless ve tek endpoint'li olduğu için host-orkestrasyon health-check'i deploy tarafında (`deploy/remote-deploy.sh`) zaten karşılanıyor; eklemek NFR'lerde talep edilmeyen bir yüzey artışı olurdu (LITE bütçesi).
- Gerekçe: Container-içi doğrulama (Node'un kendi `http` istemcisiyle container'ın kendi ağ ad alanında istek atmak) host port publish'e eşdeğer kanıt sağlar — asıl test edilen şey "imaj gerçekten çalışıyor mu ve `express.static`/`/health` doğru mu" sorusudur, host↔container port haritalaması Docker'ın kendi (bu ortamda test edilemeyen) sorumluluğudur. Gerçek host-portu erişimi zaten SSH-deploy sonrası prod sunucuda `deploy/remote-deploy.sh`'in health-probe'uyla doğrulanacak.
- Riskler: Host-port bind sandbox'ta hiç test edilemedi — teorik olarak `docker run -p` ile ilgili bir prod-özel sorun (ör. `EXPOSE`/port çakışması) bu doğrulamayla yakalanamaz; kabul edildi, düşük risk (standart `-p host:container` haritalaması, imaj `EXPOSE 3000` zaten deklare ediyor).
- Geri alınabilirlik: Yüksek (Dockerfile 9 satır, herhangi bir katman kolayca değiştirilebilir/geri alınabilir).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti)
- Varsayım mı?: Evet — AUTOPILOT varsayımı: container-içi doğrulama, host-port erişiminin yerine geçebilecek yeterli kanıt kabul edildi (url-shortener/DL-12-001 emsaliyle tutarlı).
