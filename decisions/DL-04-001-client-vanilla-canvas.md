# DL-04-001: İstemci render/oyun döngüsü — Vanilla Canvas 2D + requestAnimationFrame

- Tarih: 2026-07-31
- Faz: 4 — Çözüm Analizi
- Mod: AUTOPILOT
- Karar: Oyun tek bir `<canvas>` üzerinde, bağımlılıksız vanilla JS ile çizilecek; oyun döngüsü `requestAnimationFrame`, fizik (yerçekimi + vuruş impulsu + üst sınırlı kademeli ivme) elle yazılan saf fonksiyonlarda tutulacak. Girdi (fare/dokunma/boşluk) tek bir `hit()` giriş noktasında birleştirilir.
- Değerlendirilen alternatifler: (A2) Oyun/fizik kütüphanesi — Phaser/kaboom/matter.js; (A3) DOM `<div>` + CSS transform/animation.
- Gerekçe: NFR-3 "framework'süz HTML/Canvas/JS, ek derleme yok" diyor → A2 doğrudan gereksinim ihlali ve KPI-1 (≤5 sn ilk oyun) için gereksiz indirme yükü. A3, FR-1 isabet kontrolü ve FR-3 (zemin teması ≤1 sn) için frame-başına konum bilgisi gerektirir; CSS animasyonunda bu ya rect-polling'e ya JS'e geri döner. A1'de fizik saf fonksiyon olduğu için Faz 9/11'de DOM'suz birim-test edilir.
- Riskler: (1) Elle fizikte "tünelleme" — yüksek hızda top zemin frame'ini atlayabilir → çözüm: konum güncellemesinde zemin geçişi `y >= ground` ile kontrol edilir, eşitlik değil eşik. (2) FR-5 hız artışı oyunu oynanamaz yapabilir → üst sınır (`vMax`) zorunlu, Faz 11'de sınır testi. (3) Yüksek-DPI ekranlarda bulanıklık → `devicePixelRatio` ölçekleme.
- Geri alınabilirlik: Yüksek (render/fizik katmanı tek modülde izole; sonradan kütüphaneye geçiş oyun mantığını değil yalnız çizim/döngü adaptörünü değiştirir; kilitlenme riski yok — bağımlılık sıfır).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti)
- Varsayım mı?: Hayır (NFR-3 doğrudan dayatıyor)
