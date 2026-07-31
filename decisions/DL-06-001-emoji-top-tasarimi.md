# DL-06-001: Emoji/sprite top + tek-nokta girdi yüzeyi

- Tarih: 2026-07-31
- Faz: 6 — UI/UX
- Mod: AUTOPILOT
- Karar: Top görseli emoji/basit sprite (brief Q5) olarak çizilir; fare/dokunma/klavye (Space) tüm girdi yolları tek `hit()` fonksiyonuna yönlenir; oyun-bitti durumu ayrı bir overlay katmanla (`#game-over`) gösterilir, canvas'ın kendisi donar.
- Değerlendirilen alternatifler: Sade renkli/geometrik top (brief Q5'te reddedildi); zorluk artışı için görsel gösterge eklemek (brief'te istenmedi, v1 dışı bırakıldı).
- Gerekçe: Brief netleştirmesi emoji/sprite'ı net seçti; tek-nokta girdi (`hit()`) FR-6'nın "hepsi aynı anda aktif" gereksinimini kod tekrarı olmadan karşılar.
- Riskler: Emoji render kalitesi tarayıcı/işletim sistemine göre değişir (emoji font farklılığı) — kritik değil, kozmetik.
- Geri alınabilirlik: Yüksek (yalnız görsel katman, physics.js'i etkilemez).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti).
- Varsayım mı?: Hayır — brief Q5 doğrudan emoji/sprite seçti.
