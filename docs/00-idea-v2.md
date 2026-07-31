# 00 — Yeni İhtiyaç (REQ-001, cycle 2): ball-bounce

- Tarih: 2026-07-31 | Talep kanalı: `/pipeline-request` | Bildirim: sametemek@windowslive.com

## Talep metni (birebir)
> "Oyunda sektirilecek top yok"

**Not:** Bu talep, aynı REQ-001 cycle'ının daha önce bir kez ("Oyunda top yok.") bildirilmiş ama
işleme (state merge + commit) tamamlanmadan yarıda kalmış hâlidir — `.pipeline-complete` silinmek
üzere stage edilmişti, bu dosya diskte yazılmıştı, ama `pipeline-state.json`'da `cycle`/`requests`
hiç yazılmamıştı (koşum kesintiye uğramış). Aynı köke işaret eden ikinci bildirim bu analizi
doğruluyor; sıfırdan tekrar üretmek yerine kaldığı yerden tamamlanıyor.

## Sınıflandırma
- **Tür:** patch (davranış değişmeyen hata düzeltmesi — mevcut FR'lerin hiçbiri değişmiyor, oyun zaten "top var" varsayımıyla tasarlanmıştı)
- **Hedef faz:** 9 (Development)
- **Gerekçe:** `public/game.js` içindeki `createGame({...})` fonksiyonu tanımlı ve `tests/game.test.js` onu mock DOM ile çağırıp yeşil geçiyor, ama **gerçek tarayıcı bootstrap'ında (`index.html` → `game.js` modül girişi) hiçbir yerde `createGame(...)` gerçek `canvas`/DOM elemanlarıyla çağrılmıyor.** Sonuç: modül yüklenip fonksiyonları tanımlıyor ama oyun döngüsü (`requestAnimationFrame`) hiç başlamıyor → canvas boş kalıyor, top hiç çizilmiyor. Test paketi bunu yakalayamamış çünkü testler `createGame`'i doğrudan çağırıyor (bootstrap eksikliğini simüle etmiyor).
- **Varsayım (kural 8):** "Oyunda top yok" ifadesi, oyunun hiç başlamaması/canvasın boş kalması olarak yorumlandı (fizik/render mantığının kendisi — `physics.js`, `render()` — zaten doğru; eksik olan yalnız gerçek DOM elemanlarıyla `createGame` çağrısının modül seviyesinde yapılmaması).

## Etki
- **Etkilenen:** `public/game.js` (modül sonuna gerçek `document.getElementById(...)` ile `createGame` bootstrap çağrısı eklenir), yeni bir test (`tests/game.test.js` veya ayrı bootstrap testi) bootstrap'ın gerçekten çalıştığını doğrular.
- **Etkilenmeyen:** `physics.js` (fizik çekirdeği doğru), `server.js`, mimari/gereksinim dokümanları — FR-1..FR-6 değişmiyor, yalnız FR-1/FR-6'nın fiilen ÇALIŞMASI sağlanıyor.
- Downstream: Faz 10 (blind re-review, yalnız diff), Faz 11 (regresyon — bootstrap senaryosu), Faz 13 (patch sürüm artışı v0.1.0 → v0.1.1).
