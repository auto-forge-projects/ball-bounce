# DL-09-002: REQ-001 — game.js modülüne gerçek DOM bootstrap'ı (`boot()`) eklendi

- Tarih: 2026-07-31
- Faz: 9 — Development (↺ Yeni İhtiyaç, cycle 2, REQ-001 delta)
- Mod: AUTOPILOT
- Karar: `public/game.js`'e `boot(doc, win)` eklendi — `document.getElementById(...)` ile gerçek `canvas`/`score`/`game-over`/`final-score`/`restart` elemanlarını bulup `createGame(...)`'i bunlarla çağırır. Modül tarayıcıda yüklendiğinde (`typeof window !== 'undefined'`) `boot(document, window)` otomatik çalışır; test ortamında (`node:test`, `window` tanımsız) bu self-invoke atlanır, testler `boot`u kendileri mock DOM ile çağırır. Kırmızı test önce yazıldı (`tests/game.boot.test.js`, commit 3b76a70), sonra implementasyon (commit e32ca9c) — 26/26 test yeşil.
- Değerlendirilen alternatifler: (1) `index.html`'e ayrı bir inline `<script type="module">` ekleyip oradan `createGame` çağırmak — çalışırdı ama `game.js`'in kendi kendine yeten bir modül olması yerine bootstrap mantığını HTML'e dağıtırdı; test edilebilirliği düşürür (inline script test edilemez). (2) `createGame`'i modül seviyesinde koşulsuz çağırmak — test ortamında da (import anında) gerçek DOM arar, `getElementById` `null` döner ve testler kırılırdı.
- Gerekçe: `boot()` ayrı bir export olarak bootstrap'ı test edilebilir kılıyor (REQ-001'in kök nedeni tam olarak buydu — bootstrap hiç test edilmiyordu) ve `typeof window` koşulu tarayıcı/test ortamı ayrımını tek satırla çözüyor, ekstra bağımlılık (jsdom vb.) gerektirmiyor (NFR-3: sıfır-bağımlılık).
- Riskler: `typeof window` kontrolü tarayıcı-dışı bir ortamda (ör. SSR) yanlışlıkla atlanabilir — bu proje saf istemci-taraflı statik oyun olduğu için kapsam dışı.
- Geri alınabilirlik: Yüksek (tek fonksiyon eklendi, mevcut `createGame`/`canvasPointFromEvent` davranışı değişmedi).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti — `npm test` 26/26 yeşil)
- Varsayım mı?: Hayır — REQ-001'in kök nedeni docs/00-idea-v2.md'de zaten netti, uygulama doğrudan o analizi izledi.
