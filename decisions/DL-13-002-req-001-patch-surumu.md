# DL-13-002: REQ-001 — patch sürüm artışı v0.1.0 → v0.1.1 ve cycle kapanışı

- Tarih: 2026-07-31
- Faz: 13 — Release (↺ Yeni İhtiyaç, cycle 2, REQ-001)
- Mod: AUTOPILOT
- Karar: `package.json`/`package-lock.json` `0.1.1`'e yükseltildi (SemVer PATCH — davranış değişmedi, yalnız var olan FR-1/FR-6'nın fiilen çalışması sağlandı, bkz. `docs/00-idea-v2.md` sınıflandırması), `docs/13-release-notes.md` "Değişiklikler" bölümüyle güncellendi. `docs/00-idea-v2.md`'de zaten "patch → v0.1.0'dan 0.1.1'e" olarak öngörülmüştü.
- Değerlendirilen alternatifler: MINOR (0.2.0) — reddedildi, `pipeline-request.md` adım 4 kuralı gereği yalnız **feature** talepleri minor alır; bu bir **patch** (davranış/FR değişmedi, mevcut FR'nin bozuk implementasyonu düzeltildi).
- Gerekçe: `/pipeline-request` spesifikasyonu (adım 4) patch talepleri için PATCH bump zorunlu kılıyor; kullanıcıya API/davranış garantisi açısından yanıltıcı bir MINOR/MAJOR sinyali verilmemesi gerekiyor.
- Riskler: Yok — durumsuz mimari, rollback her zamanki gibi basit (DL-13-001).
- Geri alınabilirlik: Yüksek (yalnız sürüm alanı + release notes; kod DL-09-002'de zaten kapanmıştı).
- İnsan onayı: Otomatik (AUTOPILOT, kapı geçti — REQ-001 için özel onay kapısı yok, `pipeline-request.md` kuralı).
- Varsayım mı?: Hayır — sürüm şeması `pipeline-request.md` adım 4'te açıkça tanımlı (patch→patch bump).
