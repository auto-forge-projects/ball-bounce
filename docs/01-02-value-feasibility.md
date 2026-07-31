# 01-02 — Değer & Fizibilite (LITE birleşik faz): ball-bounce

> LITE profil: yarım sayfa hedefi, paydaş analizi yok.

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Profil: LITE

## Değer önerisi
Kurulum gerektirmeyen, tarayıcıda anında açılan bir "keepy-uppy" (top sektirme) arcade oyunu; kullanıcı hesap/indirme olmadan tıklama/dokunma ile kısa süreli beceri oyunu oynar ve anlık skor takip eder.

## KPI'lar (kalite kapısı: en az 3, ölçülebilir)
1. Sayfa yüklenmesinden ilk sektirmeye kadar geçen süre ≤ 5 sn (manuel ölçüm, tarayıcı DevTools).
2. Başarılı her sektirme skor sayacını ekranda ≤ 1 sn içinde günceller (manuel/otomatik ölçüm).
3. Top yere değdiğinde "oyun bitti + skor" ekranı ≤ 1 sn içinde görüntülenir ve yeniden başlatma tek tıkla çalışır (otomatik test).

## Fizibilite
- Teknik: Canvas/JS ile basit 2D fizik (yerçekimi + tıklama/dokunma tepkisi + kademeli hız artışı) — kanıtlanmış, düşük risk, snake-game/coinflip emsali. ✅
- Ekonomik: Sıfır altyapı maliyeti (statik barındırma + mevcut SSH-push deploy akışı yeterli). ✅
- Zaman: LITE MVP kapsamı (tek top, tek oyuncu, backend yok) 1 günden az geliştirme gerektirir. ✅

## GO / NO-GO önerisi: **GO**
Gerekçe: Teknik risk yok (standart 2D canvas fiziği), maliyet sıfıra yakın, kapsam brief'in Q1–Q5 netleştirmesiyle net ve küçük. Üç ölçülebilir KPI ile ilerlemek uygun.

## Kalite kapısı raporu
- "En az 3 ölçülebilir KPI" → ✅ (yukarıda 3 KPI, hedef + ölçüm yöntemiyle)
- "GO/NO-GO kararı gerekçeli" → ✅ (GO, teknik/ekonomik/zaman gerekçesiyle)
