# 00 — Rafine Proje Brief'i: ball-bounce

> **Faz 0b çıktısı.** Ham fikir, kullanılabilen en iyi modelle yapılandırılmış brief'e dönüştürülür.
> Bu brief kullanıcıya HAM FİKİRLE YAN YANA sunulur; **onaylanmadan Faz 0 (00-idea.md) üretilmez.**
> Onay sonrası bu brief, Faz 0 ve sonraki tüm fazların girdisidir.

- Tarih: 2026-07-31 | Rafine eden model: Claude Sonnet 5 (oturumdaki en iyi mevcut model) | Onay durumu: **Onaylandı** (dashboard, 2026-07-31)

## Ham fikir (kullanıcının girdisi — değiştirilmez)
> Top sektirme oyunu yap

## Rafine problem (tek cümle)
Kullanıcının tarayıcıdan tek tıkla açıp topu sektirerek (tıklama/dokunma ile havada tutarak) skor biriktirebileceği, kurulum gerektirmeyen bağımsız bir web oyunu yok.

## Hedef kitle
Tek kullanıcılı, anlık eğlence/demo arayan ziyaretçi — coinflip/dice-game/snake-game emsalindeki gibi kurulum gerektirmeyen, tarayıcıdan doğrudan açılan basit bir arcade oyunu arayan solo geliştirici/portföy ziyaretçisi.

## Kısıtlar & varsayımlar (AF-001 kapanışı)
- Platform/runtime: Web (tarayıcı, masaüstü + mobil dokunma); küçük Node/Express statik servis + Docker imajı, SSH-push deploy akışına (`https://ball-bounce.apps.sametemek.com`) uyumlu.
- Çevrimiçi/çevrimdışı, veri konumu: Tamamen client-side oyun mantığı (Canvas/JS); sunucu tarafında kalıcı veri/DB yok (stateless), kullanıcı hesabı yok. En yüksek skor kalıcı TUTULMAZ — yalnız oturum içi (sayfa yenilenince sıfırlanır), `localStorage` kullanılmaz (Q4).
- Oyun mekaniği: "keepy-uppy" — topu yere düşürmeden tıklama/dokunma ile havada tutma, skor = başarılı sektirme sayısı (Q1).
- Kontrol şeması: hepsi birden desteklenir — fare tıklama + boşluk tuşu (klavye) + dokunma; mobil ve masaüstü aynı anda hedef kitle (Q2).
- Zorluk eğrisi: top hızı zamanla kademeli artar (Q3).
- Görsel tema: emoji/basit sprite kullanılan top (sade geometrik şekil değil) — Faz 6 UI/UX girdisi (Q5).
- Tek top, tek oyuncu; çok oyunculu/rekabetli mod v1 kapsamı dışında.
- Zaman/kota bütçesi: Küçük kapsam, LITE profil, düşük efor — snake-game/dice-game ile aynı ölçek.

## Başarı kriterleri (ölçülebilir)
1. Kullanıcı tıklama/dokunma ile topu sektirebilir; her başarılı sektirme skor sayacını 1 artırır ve ekranda 1 saniye içinde güncellenir.
2. Top yere değdiğinde (skor sıfırlanır) oyun 1 saniye içinde "oyun bitti + skor" ekranı gösterir ve yeniden başlatma seçeneği sunar.
3. Ürün Docker imajına paketlenir, yerelde `docker run` ile çalışır ve mevcut SSH-push deploy akışıyla `https://ball-bounce.apps.sametemek.com` adresine deploy edilebilir.

## Kapsam sınırı (v1'de yapılmayacaklar)
- Çok oyunculu / gerçek zamanlı rekabetli mod, sunucu tarafı skor tablosu.
- Ses efekti/müzik zorunluluğu (opsiyonel, v1 sonrası).
- Birden fazla top veya güçlendirme (power-up) sistemi.

## Netleştirilen sorular
- [x] **Q1** 🔴 Oyun mekaniği → **Tıkla/dokun ile topu havada tut (keepy-uppy)**
- [x] **Q2** 🔴 Kontrol şekli → **Hepsi (fare + klavye + dokunma)**
- [x] **Q3** ⚪ Top hızı → **Zamanla hızlansın**
- [x] **Q4** ⚪ Skor kalıcılığı → **Hayır, yalnız oturum içi (localStorage yok)**
- [x] **Q5** ⚪ Görsel tema → **Emoji/basit sprite**
> Makine kaydı: `docs/00-refine-questions.json` (tüm sorular yanıtlandı, `applied_at` bu revizyonla damgalanır)

## Önerilen profil ve ilk mod
- Profil: **LITE** · Gerekçe: Solo, küçük kapsamlı, tek sayfalık stateless arcade oyunu — coinflip/dice-game/snake-game ile aynı ölçek; Faz 1+2 birleşik ilerler.

---
## Onay kaydı
- 2026-07-31 — Beklemede
