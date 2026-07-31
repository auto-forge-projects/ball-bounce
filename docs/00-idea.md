# 00 — Fikir (Intake)

## Problem (tek cümle)
Kullanıcının tarayıcıdan tek tıkla açıp topu sektirerek (tıklama/dokunma ile havada tutarak) skor biriktirebileceği, kurulum gerektirmeyen bağımsız bir web oyunu yok.

## Kim için
Tek kullanıcılı, anlık eğlence/demo arayan ziyaretçi — coinflip/dice-game/snake-game emsalindeki gibi kurulum gerektirmeyen, tarayıcıdan doğrudan açılan basit bir arcade oyunu arayan solo geliştirici/portföy ziyaretçisi.

## Kapsam (v1)
- "Keepy-uppy" mekaniği: tıklama/dokunma/boşluk tuşu ile topu yere düşürmeden havada tutma
- Skor = başarılı sektirme sayısı; ekranda 1 sn içinde güncellenir
- Top yere değince "oyun bitti + skor" ekranı (1 sn içinde) + yeniden başlatma
- Zamanla artan top hızı (kademeli zorluk)
- Emoji/basit sprite top, framework'süz statik HTML/Canvas/JS
- Client-side stateless: sunucu tarafı veri/DB yok, `localStorage` kullanılmaz (skor yalnız oturum içi)
- Docker imajına paketlenir, mevcut SSH-push deploy akışına uyumlu (`https://ball-bounce.apps.sametemek.com`)

## Kapsam dışı (v1)
- Çok oyunculu/rekabetli mod, sunucu tarafı skor tablosu
- Ses efekti/müzik zorunluluğu
- Birden fazla top veya güçlendirme (power-up) sistemi

## Kaynak
Onaylı brief: `docs/00-refined-brief.md` (Q1–Q5 netleştirme turu uygulanmış)

## Kalite kapısı raporu
Problem tek cümlede tanımlı ✅ (yukarıda)
