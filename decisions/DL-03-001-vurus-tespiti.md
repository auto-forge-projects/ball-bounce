# DL-03-001: Vuruş tespiti + kademeli hız artışı politikası

- Tarih: 2026-07-31
- Faz: 3 — Requirement Analizi
- Mod: AUTOPILOT
- Karar: Vuruş, imleç/dokunma noktasının topun görsel alanıyla kesişimi (fare/dokunma) veya boşluk tuşuna basıldığı anda topun ekranda olması (klavye) ile tetiklenir; top hızı skor eşiklerine bağlı kademeli, üst-sınırlı bir eğriyle artar (FR-5).
- Değerlendirilen alternatifler: Yalnız piksel-hassas çarpışma (daha karmaşık, mobilde dokunma toleransı düşük — kullanıcı deneyimini kötüleştirir); sınırsız hız artışı (oynanamaz hale gelir).
- Gerekçe: Geniş çarpışma alanı + üst-sınırlı hız, mobil dokunma toleransını ve oynanabilirliği korur; brief Q3 (zamanla hızlansın) ile uyumlu.
- Riskler: Çarpışma alanı çok geniş tutulursa oyun kolaylaşır — Faz 9'da manuel oynanabilirlik testiyle ayarlanacak.
- Geri alınabilirlik: Yüksek (yalnız doküman + sonraki kod tasarımını yönlendirir, henüz kod yok).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti).
- Varsayım mı?: Evet — AUTOPILOT varsayımı: brief'te vuruş toleransının tam eşiği belirtilmemişti, en yaygın/oynanabilir yaklaşım (geniş görsel-kesişim + üst-sınırlı hız) seçildi.
