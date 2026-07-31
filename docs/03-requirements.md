# 03 — Requirement Analizi: ball-bounce

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE

## Açık soruların çözümü (0b brief'inden)
- Mekanik: keepy-uppy (tıkla/dokun ile topu havada tut), skor = sektirme sayısı.
- Kontrol: fare tıklama + boşluk tuşu + dokunma — hepsi aynı anda aktif, birbirini dışlamaz.
- Zorluk: top hızı zamanla kademeli artar (sabit oranlı, zaman/skor bazlı ivme).
- Kalıcılık: skor yalnız oturum içi (localStorage yok).

## Fonksiyonel gereksinimler

### FR-1: Top vuruşu (havada tutma)
- **User story:** Oyuncu olarak, düşen topa tıklayıp/dokunup/boşluk tuşuna basıp onu yukarı sektirmek istiyorum, böylece topu havada tutabilirim.
- **Kabul kriterleri:**
  - Given top ekranda düşüyor, when top ile fare tıklaması/dokunma/boşluk tuşu çakışır (top-imleç/top-dokunma noktası kesişimi ya da boşluk anında topun görünür alanda olması), then top yukarı yönde zıplar ve skor 1 artar.
  - Given vuruş anında top ile temas/zamanlama yoksa, then hiçbir etki olmaz (skor değişmez, top düşmeye devam eder).
- **Öncelik:** Must

### FR-2: Skor sayacı
- **User story:** Oyuncu olarak, kaç kez başarılı sektirdiğimi anlık görmek istiyorum.
- **Kabul kriterleri:**
  - Given başarılı bir sektirme oldu, then skor sayacı ekranda ≤1 sn içinde güncellenir.
  - Given oyun yeniden başladı, then skor 0'a döner.
- **Öncelik:** Must

### FR-3: Oyun bitişi (top yere değme)
- **User story:** Oyuncu olarak, topu kaçırdığımda oyunun bittiğini net görmek istiyorum.
- **Kabul kriterleri:**
  - Given top zeminle temas eder, then oyun ≤1 sn içinde durur ve "Oyun bitti + final skor" ekranı gösterilir.
  - Given "oyun bitti" ekranı gösteriliyor, then "Yeniden başlat" seçeneği tıklanabilir durumdadır.
- **Öncelik:** Must

### FR-4: Yeniden başlatma
- **User story:** Oyuncu olarak, oyun bitince sayfayı yenilemeden tekrar oynamak istiyorum.
- **Kabul kriterleri:**
  - Given "oyun bitti" ekranı, when "Yeniden başlat" tıklanır/dokunulur, then skor 0'a döner, top başlangıç hızıyla yeniden düşmeye başlar.
- **Öncelik:** Must

### FR-5: Kademeli zorluk artışı
- **User story:** Oyuncu olarak, oyun ilerledikçe zorlaşmasını istiyorum, böylece meydan okuma hissedeyim.
- **Kabul kriterleri:**
  - Given oyun sürüyor, when skor/zaman belirli bir eşiği geçer, then topun düşme hızı kademeli olarak artar (üst sınırla sınırlı, oynanamaz hale gelmez).
- **Öncelik:** Should

### FR-6: Çoklu kontrol şeması
- **User story:** Oyuncu olarak, masaüstünde fare/klavye, mobilde dokunma ile aynı oyunu oynamak istiyorum.
- **Kabul kriterleri:**
  - Given cihaz masaüstü, then fare tıklama ve boşluk tuşu ikisi de topu sektirir.
  - Given cihaz dokunmatik, then dokunma topu sektirir.
- **Öncelik:** Must

## Fonksiyonel olmayan gereksinimler (kalite kapısı: ölçülebilir)
| ID | Kategori | Gereksinim | Ölçüt / Hedef |
|----|----------|------------|----------------|
| NFR-1 | Performans | Vuruştan skor güncellemesine gecikme | ≤ 1 sn |
| NFR-2 | Performans | Top yere değmeden oyun-bitti ekranına geçiş | ≤ 1 sn |
| NFR-3 | Uyumluluk | Güncel masaüstü + mobil tarayıcılarda çalışmalı | Framework'süz HTML/Canvas/JS, ek derleme yok |
| NFR-4 | Gizlilik/Kalıcılık | Skor sunucuda/localStorage'da saklanmamalı | Oturum-içi state, sayfa yenilenince sıfırlanır (statik kod incelemesiyle doğrulanır) |

## İzlenebilirlik
| FR | Karşıladığı KPI / iş hedefi |
|----|------------------------------|
| FR-1, FR-6 | Başarı kriteri 1 (sektirme + skor artışı) |
| FR-2 | Başarı kriteri 1 + KPI-2 (skor güncelleme≤1sn) |
| FR-3, FR-4 | Başarı kriteri 2 (oyun bitti ekranı + yeniden başlatma) + KPI-3 |
| FR-5 | Brief Q3 (kademeli zorluk) |

## Kalite kapısı raporu
- "Her FR'nin kabul kriteri var" → ✅ (FR-1..FR-6, Given/When/Then kriterleriyle)
- "NFR'ler ölçülebilir" → ✅ (NFR-1..NFR-4, ölçüt/hedef sütunuyla)
