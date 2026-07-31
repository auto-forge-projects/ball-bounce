# ball-bounce v0.1.0 — Release Notes

- Tarih: 2026-07-31 | SemVer: **v0.1.0** (0.x = API garanti yok) | Mod: AUTOPILOT

## Öne çıkanlar
İlk sürüm (M1, Faz 8 planı) — kimlik/oturum gerektirmeyen, tek oyunculu keepy-uppy (top sektirme) tarayıcı oyunu. Tek Docker imajı, sunucu tarafında oyun mantığı/kalıcı veri yok.

## Özellikler
- Fare tıklama, boşluk tuşu ve dokunma — hepsi aynı anda aktif, topu sektirme (FR-1, FR-6).
- Anlık skor sayacı, ≤1sn güncelleme (FR-2).
- Top zemine değince "Oyun bitti" ekranı + final skor + "Yeniden başlat" (FR-3, FR-4).
- Skor arttıkça kademeli, üst-sınırlı hız artışı (FR-5, `speedFor`: K_STEP=0.04, K_MAX=1.8).
- `GET /health` → `200 {"status":"ok"}` (Express, statik `public/` servis).

## Güvenlik
OWASP Top 10 değerlendirildi (`docs/07-security.md`) — kimlik doğrulama/PII/kalıcı veri yok. CSP/nosniff/HSTS/Referrer-Policy başlıkları, path-traversal ve dotfile koruması, sabit `express` sürümü, DOM-XSS yasağı (`innerHTML`/`eval` yok). Skor yalnız bellek-içi state'te tutulur (NFR-4) — `localStorage`/`sessionStorage`/cookie kullanılmaz (statik incelemeyle doğrulandı, `docs/11-test/results.md`).

## Bilinen sınırlar
Gerçek tarayıcı/cihaz matrisi ve host-port-publish edilmiş Docker doğrulaması bu ortamda otomatikleştirilemedi (sandbox kısıtı, `DL-12-001`); container-içi doğrulama + prod SSH-deploy health-probe'u ile telafi edilir. Detay: `docs/15-maintenance.md` (Faz 15).

## Kurulum
```
docker build -t ball-bounce:0.1.0 .
docker run -d --rm -p 3000:3000 --name ball-bounce ball-bounce:0.1.0
curl http://localhost:3000/health
```
Uzak dağıtım: `deploy.json` (nginx proxy, `host_port:5007`, wildcard TLS) → `https://ball-bounce.apps.sametemek.com`.

## Rollback planı (kalite kapısı)
1. **Kod:** Bu sürüm tek commit aralığında (`git log --oneline`); önceki yeşil tag/commit'e `git revert` veya `git reset --hard <önceki-sha>` + push.
2. **Veri uyumluluğu:** Yok — uygulama durumsuz (sunucu tarafında kalıcı veri/DB yok), downgrade veri kaybı riski taşımaz.
3. **Doğrulama:** Rollback sonrası `GET /health` → `200 {"status":"ok"}` + tarayıcıda manuel smoke (tıkla → sektir → skor artışı → top kaçır → oyun bitti → yeniden başlat).
4. **Dağıtım:** `deploy-image.yml` önceki SHA/`latest` tag'iyle yeniden build+push edilir; sunucuda `docker run` önceki image tag'iyle tekrar başlatılır (host_port aynı, nginx bloğu değişmez).

## Kalite kapısı raporu
- "Rollback prosedürü tanımlı" → ✅
- "Sürüm plana uygun" → ✅ (Faz 8 M1 milestone: v0.1.0, FR-1..FR-6 kapsandı)
