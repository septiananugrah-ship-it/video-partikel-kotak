# Partikel dalam Kotak — video Modul 3 Kimia Kuantum

Film edukasi **Teori Kuantum Gerak Translasi** (Modul 3, S1 Kimia UNESA), dibuat dengan [Remotion](https://remotion.dev).
1920 × 1080 / 2560 × 1440 · 30 FPS · **±21 menit** (estimasi sebelum narasi direkam) · 17 bab + pembuka, judul, peta video, dan penutup.
Mesin video sama dengan repo `video-atom-hidrogen` (Modul 6): naskah → timeline → subtitle kata-per-kata → musik orisinal.

## Alur

| Bagian | Bab |
|---|---|
| — | Pembuka: tiga botol titik kuantum CdSe (2, 3, 6 nm) berpendar biru-hijau-merah · Judul · Peta video |
| 1 · Teori dasar | 01 Partikel bebas (e^{ikx}, de Broglie, E = ħ²k²/2m kontinu, paket gelombang) · 02 Memasang dinding (syarat batas, kL = nπ) · 03 Tangga energi (Eₙ = n²h²/8mL²; L = 1 nm: 0,376 · 1,50 · 3,38 eV; L → 2L ⇒ E/4) · 04 Fungsi gelombang & peluang (√(2/L) sin, n − 1 simpul, P = 0,818 / 0,500, korespondensi) · 05 Energi titik nol (Δx·Δp ≈ 0,568 ħ) · 06 Kotak 2D (degenerasi 5E₀, persegi panjang 0,75 & 1,60 eV) · 07 Kotak 3D (3E₀, g = 3, 6, kebetulan 27E₀; 1,13 & 2,26 eV) · 08 Sumur berhingga (z₀ = 2: 0,265 & 0,898 V₀) · 09 Penerowongan (E = 1 eV, V₀ = 5 eV: T = 0,042 → 9,1 × 10⁻⁵, ±463×) |
| 2 · Implementasi kimia | 10 Transisi & serapan (1→2 = 1,13 eV, 1099 nm; aturan paritas) · 11 Elektron π (butadiena 220 nm model / ±217 nm ukur; heksatriena 354 nm) · 12 Pewarna sianin (±523 · 604 · 707 nm) & β-karoten · 13 Penerowongan dalam molekul (inversi NH₃ ±24 GHz, ND₃; KIE lipoksigenase ±80) |
| 3 · Industri | 14 Titik kuantum & layar QLED (InP, Nobel Kimia 2023) · 15 Mikroskop penerowongan (STM, Nobel 1986; pagar kuantum 48 atom Fe) · 16 Memori flash (penerowongan Fowler–Nordheim) |
| — | 17 Rangkuman · Penutup & rujukan |

Daftar bab bertimecode untuk YouTube: `naskah/BAB_YOUTUBE.txt` (diperbarui otomatis setelah narasi direkam).

## Narasi (ElevenLabs, suara Bagas)

1. Pastikan secret **`ELEVENLABS_API_KEY`** ada di repo ini (Settings → Secrets and variables → Actions). Secret repo lain tidak ikut terbawa.
2. Actions → **Buat voice-over ElevenLabs + render 2K** → Run workflow (voice ID bawaan = Bagas, model `eleven_v4`).
3. Workflow membuat MP3 per baris, menyesuaikan timeline & musik, lalu merender **dua versi**:
   - `partikel-kotak-dengan-narasi-2k-30fps` (narasi + musik pelan + subtitle),
   - `partikel-kotak-tanpa-narasi-2k-30fps` (musik + subtitle, tanpa suara — untuk dubbing sendiri).

Render ulang tanpa membuat suara: Actions → **Render Partikel dalam Kotak 2K 30FPS** (isi `props` dan `nama`).

## Intro SCIENTIAN

Unggah intro 30 FPS ke `intro/intro.mp4` (lihat `intro/README.md`); render berikutnya otomatis menghasilkan juga `…-dengan-intro.mp4`.

## Mengubah naskah

Edit `src/script.ts`, lalu `npm run timeline && npm run music`. Pratinjau: `npm run dev` (folder *Adegan* berisi tiap adegan).
QA: `node scripts/qa-audit.mjs out/audit` lalu `python3 scripts/contact.py out/audit out/sheets` (lembar kontak per adegan);
`node --experimental-strip-types scripts/check-cues.ts` memeriksa penanda kata `wordOf`.

## Catatan ilmiah

Angka model dihitung dari rumus Modul 3 (massa elektron, hc = 1239,842 eV·nm, κ = 5,12317 √(V₀ − E) nm⁻¹).
Nilai ukur (butadiena, pewarna sianin, β-karoten, NH₃/ND₃, KIE) ditandai "≈" dan dirujuk di layar penutup.
Pewarna, sel flash, STM, dan pagar kuantum digambar skematis; warna titik kuantum pada Bab 14 memakai kurva celah skematis.
