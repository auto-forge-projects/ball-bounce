# DL-08-001: 9 görev, mimari moduller ile hizali

- Tarih: 2026-07-31
- Faz: 8 — Planlama
- Mod: AUTOPILOT
- Karar: Plan, Faz 5 mimarisindeki 3 modül (physics/game/server) + statik yüzey + entegrasyon testleri olarak 9 TASK'a bölündü; TDD sırası (önce physics.js çekirdek testleri) korundu.
- Değerlendirilen alternatifler: Tüm oyun mantığını tek TASK'ta yazmak — Faz 9'da TDD red→green commit çiftini izlemeyi zorlaştırır, ilerleme görünürlüğü düşük olur.
- Gerekçe: Küçük, bağımsız doğrulanabilir adımlar; her TASK ayrı commit çiftine (test+impl) haritalanır (AF-093).
- Riskler: TASK-006 (server.js) TASK-001..005 ile paralel yazılabilir — sıra esnek, bağımlılık grafı bunu TASK-007'de birleştirir.
- Geri alınabilirlik: Yüksek (yalnız plan dokümanı, kod henüz yazılmadı).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti).
- Varsayım mı?: Hayır.
