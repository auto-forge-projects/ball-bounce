# 16 — Retrospektif: AutoForge pipeline'ı (ball-bounce koşusu)

- Tarih: 2026-07-31 | Mod: AUTOPILOT | Girdi: `AUTOFORGE-FEEDBACK.md` (AF-127)
- Kapsam: FABRİKA değerlendirilir, ürün değil.

## Ne iyi gitti
- Faz 9'da ORPHANED_RUN (TASK-008 ortasında kesinti) iş-listesinden doğru kurtarıldı: TASK-001..007 diske karşı doğrulandı, yeniden üretilmedi (AF-038); yalnız `server.js`'in emsal proje yapısından (`src/server.js`) saptığı ve DL-09-001'in hiç yazılmadığı tespit edilip tamamlandı.
- Faz 12'de host-port-publish Docker testi sandbox'ta reddedilince (bilinen kısıt, url-shortener emsali) container-içi doğrulamaya (Node'un kendi HTTP istemcisiyle) sorunsuz geçildi — kanıt tiyatrosu yapılmadı, sınır açıkça DL-12-001'e yazıldı.
- LITE bütçe disiplini korundu: Faz 11/13/14/15 artefaktları kısa/tablo ağırlıklı; Faz 10 atlaması (AF-112) JOIN kapısı tarafından doğru tanındı, Release'i bloklamadı.

## En önemli öğrenim
`state-update.mjs`'in mutasyon gövdesi (`applyMutations`) bir `if/else if` ZİNCİRİ: tek çağrıda `--merge` + `--append-history` + `--append-checkpoint` birlikte verilirse yalnız İLKİ (`--merge`) çalışır, gerisi SESSİZCE yok sayılır — `--request-commit` ise ayrı/sonraki bir blokta bağımsız işlendiği için her zaman çalışır ve çıktıda göründüğü için "hepsi uygulandı" yanılgısını güçlendirir. CLAUDE.md kural 3'ün "TEK transaction'da yazar" ifadesi yalnız `--merge`+`--request-commit` ikilisi için doğru; bu oturumda 3 fazlık (9/11/12) kapanışta `phase_closed`/`phase_started` history olayları ve checkpoint notları hiç yazılmamış olarak bulundu — yalnız `--get history`/`--get checkpoints` ile diske karşı doğrulama (AF-038 disiplini) sayesinde fark edildi ve ayrı çağrılarla telafi edildi. Kayıp veri kalıcı olmadı ama tespit tesadüfi değildi; script bu durumu hiç raporlamıyor (`{"ok":true}` döner).

## Kök-neden temaları
| Tema | İlgili AF | Özet |
|------|-----------|------|
| Çoklu mutasyon bayrağı sessizce tek işleme düşüyor | AF-127 | `applyMutations` if/else zinciri; `--request-commit` ayrı blokta olduğu için yanıltıcı "başarı" görüntüsü veriyor |
| Diske-doğrula disiplini kör noktaları yakalıyor | AF-038 | Bu koşuda 4 kez (Faz 9 kurtarma + 9/11/12 history kaybı) doğru çalıştı |
| Sandbox host-port kısıtı tekrarlayan bir desen | (url-shortener DL-12-001 emsali) | Container-içi doğrulama artık standart telafi yöntemi |

## Somut süreç iyileştirmeleri (kalite kapısı: ≥1)
### Öneri 1 — `state-update.mjs`'e çoklu-bayrak koruması ekle **[P1, seçildi — AF-127'de kaydedildi, henüz uygulanmadı]**
Birden fazla mutasyon bayrağı (`--merge`, `--append-history`, `--append-telemetry`, `--set-tasks`, `--mark-task`, `--append-checkpoint`, `--replace`) AYNI çağrıda verilirse script ya HEPSİNİ sırayla uygulasın ya da `fail()` ile açıkça reddetsin ("tek çağrıda tek mutasyon bayrağı" kısıtını dokümante edip zorunlu kılsın). Şu anki sessiz-yoksayma davranışı, orchestrator'ın (insan ya da headless ajan) CLAUDE.md kural 3'ün "TEK transaction" ifadesini yanlış genelleyip veri kaybetmesine yol açıyor.

### Öneri 2 — Commit-queue drain sonucu "push BAŞARISIZ" derken aslında push başarılıysa yanlış-negatif raporlamasın **[P3, değerlendirildi — seçilmedi bu turda]**
Bu koşuda iki kez `commit-queue.mjs --drain` "push BAŞARISIZ" dedi ama `git log origin/main` commit'in ZATEN orada olduğunu gösterdi (muhtemelen eşzamanlı bir push/race). Kod incelemesi bu oturuma sığmadı — sonraki bir Faz 16/AUTOFORGE-FEEDBACK turunda kök nedeni izlenmeli (yanlış-negatif, kullanıcıyı gereksiz "push'u elle at" aksiyonuna yönlendirebilir).

## MASTER-PROMPT / CLAUDE.md / şablon değişiklik önerileri
1. `scripts/state-update.mjs` → `applyMutations` çoklu-bayrak kısıtını uygula/dokümante et (Öneri 1, AF-127).
2. CLAUDE.md kural 3 — "TEK transaction'da yazar" cümlesinin kapsamını netleştir (yalnız `--merge`+`--request-commit`); `--append-history`/`--append-checkpoint` için ayrı çağrı gerektiğini belirt.

## Kalite kapısı raporu
- "En az 1 somut süreç iyileştirmesi" → ✅ (Öneri 1: `state-update.mjs` çoklu-bayrak koruması, kaynak AF-127)
