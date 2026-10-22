import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {ncol, psi} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const REFS = [
  'Modul 3 Kimia Kuantum — Teori Kuantum pada Gerak Translasi (bahan kuliah IGMA Sanjaya, UNESA)',
  'P. Atkins & J. de Paula, Physical Chemistry · I. N. Levine, Quantum Chemistry · D. A. McQuarrie, Quantum Chemistry',
  'CODATA 2018 (NIST): h, ħ, mₑ, c, e',
  'H. Kuhn, J. Chem. Phys. 17, 1198 (1949) — model elektron bebas untuk pewarna',
  'NIST Chemistry WebBook — spektrum UV 1,3-butadiena',
  'C. B. Murray, D. J. Norris & M. G. Bawendi, J. Am. Chem. Soc. 115, 8706 (1993)',
  'The Nobel Prize in Chemistry 2023 — quantum dots (nobelprize.org)',
  'G. Binnig & H. Rohrer, Rev. Mod. Phys. 59, 615 (1987) — mikroskop penerowongan',
  'M. F. Crommie, C. P. Lutz & D. M. Eigler, Science 262, 218 (1993) — pagar kuantum',
  'J. P. Gordon, H. J. Zeiger & C. H. Townes, Phys. Rev. 95, 282 (1954) — maser amonia',
  'M. J. Knapp, K. Rickert & J. P. Klinman, J. Am. Chem. Soc. 124, 3865 (2002) — KIE lipoksigenase',
  'S. M. Sze & K. K. Ng, Physics of Semiconductor Devices — memori flash & Fowler–Nordheim',
];

export const Outro: React.FC = () => {
  const {t, dur} = useScene();
  const a = ramp(t, 0, 1.6);
  const waves = ramp(t, 0, 4, EASE_IN_OUT);
  const refs = ramp(t, 2.4, 3.4);
  const out = 1 - ramp(t, dur - 1.6, dur - 0.1, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <Glow x={960} y={300} r={500} color="gold" opacity={0.15} />
        {[1, 2, 3].map((n) => (
          <path
            key={n}
            d={Array.from({length: 161}, (_, k) => `${k ? 'L' : 'M'}${360 + (k / 160) * 1200},${300 - 60 * psi(n, k / 160) * Math.cos(t * 1.2 * n)}`).join(' ')}
            fill="none"
            stroke={ncol(n)}
            strokeWidth={3}
            opacity={0.25 * waves}
          />
        ))}
      </Stage>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 150}}>
        <div style={{fontFamily: FONT.sans, fontSize: 30, letterSpacing: 18, color: C.ink, fontWeight: 300, opacity: a}}>GERAK TRANSLASI</div>
        <div style={{fontFamily: FONT.sans, fontSize: 100, fontWeight: 800, color: C.gold, lineHeight: 1.05, opacity: a, textShadow: '0 0 50px rgba(255,194,74,0.4)'}}>PARTIKEL DALAM KOTAK</div>
        <div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 34, color: C.ink, opacity: ramp(t, 1.2, 2.2)}}>Terima kasih telah menonton</div>
        <div style={{marginTop: 46, textAlign: 'center', opacity: refs}}>
          <div style={{fontFamily: FONT.mono, fontSize: 20, letterSpacing: 4, color: C.muted, marginBottom: 14}}>RUJUKAN</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 56, rowGap: 6, width: 1720, textAlign: 'left'}}>
            {REFS.map((r, i) => (
              <div key={r} style={{fontFamily: FONT.sans, fontSize: 21, color: C.muted, lineHeight: 1.45, opacity: ramp(t, 2.4 + i * 0.08, 3.2 + i * 0.08)}}>
                {r}
              </div>
            ))}
          </div>
          <div style={{marginTop: 22, fontFamily: FONT.sans, fontSize: 20, color: C.faint}}>
            Angka model dihitung dari rumus Modul 3 · nilai ukur ditandai “≈” · ilustrasi alat &amp; molekul bersifat skematis
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
