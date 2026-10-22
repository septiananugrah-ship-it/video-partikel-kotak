# Audit & polish video Modul 3 — Partikel dalam Kotak

Metode: still di akhir tiap baris narasi (163) + awal/tengah/akhir & 3 still per transisi (`qa-audit.mjs`),
lembar kontak (`scripts/contact.py`), `check-cues.ts`, Whisper small (163 baris) + medium (22 baris mencurigakan),
verifikasi fakta luar ke sumber.

## Temuan (urut prioritas) → tindakan
1. **Akurasi** — λmaks pewarna sianin tertulis 523/604/705 nm "metanol"; katalog Sigma-Aldrich (etanol): 524 / 614 / 707 nm → label & narasi `dyes-04` diperbaiki.
2. **Akurasi** — penghalang inversi NH₃ "25 kJ/mol"; literatur ≈ 2020 cm⁻¹ = 24 kJ/mol → label & narasi `chemtunnel-02`.
3. **Tipografi** — subskrip di semua kartu rumus (Eₙ, ψₙ, E₁) tampil naik karena wadah flex → `Formula` diubah ke baris inline.
4. **Tata letak** — label eV kotak 2L bertumpuk; "hapus: tegangan dibalik" menabrak kotak bit (Bab 16); label "dua tingkat" menabrak batang ND₃ (Bab 13); ⟨p⟩ tampil sebagai (p) → semua diperbaiki.
5. **Kejelasan** — layar setengah kosong/statis: Bab 03 (kotak melebar & kardus statis), Bab 06 (peta panas kotak-kotak), Bab 08 (gelombang terlalu kecil), Bab 09 (setengah atas kosong), Bab 15 (lingkaran datar), Bab 16 (diagram statis 68 dtk), pembuka (botol datar).
6. **Teknis** — Whisper small menandai "penerowongan"→"penerawangan" & "pi"→"P"; medium memastikan pengucapan benar (alarm palsu). Penanda kata cocok semua; transisi bersih (tidak ada adegan bertumpuk).
7. **Struktur** — Bagian 1 (Bab 01–09), 2 (10–13), 3 (14–16) lengkap; Bagian 3 ±16 % durasi.

## Peningkatan visual
- Pembuka sinematik: botol berpendar dengan foton naik & berkas UV, zoom ala SCIENTIAN (HUD 10⁻² → 10⁻⁹ m) ke nanokristal CdSe 3D (±160 atom, kisi zinc blende).
- Bab 09: simulasi paket gelombang nyata (Schrödinger bergantung waktu, split-operator; `scripts/sim-packet.py`) — peluang tembus 3,8 % ≈ T = 0,042.
- Bab 15: permukaan 3D hasil pindaian STM & pagar kuantum 48 atom Fe (J₀²) yang muncul baris demi baris.
- Bab 06: membran 3D bergetar ψ(x, y) + peta panas halus.
- Bab 16: zoom ponsel → chip NAND → susunan sel → satu sel (HUD 10⁻¹ → 10⁻⁷ m).
- Bab 03: kotak L dan 2L berdampingan, kurva E₁ ∝ 1/L² (Gambar 4 modul), zoom-out ke kardus 30 cm.
