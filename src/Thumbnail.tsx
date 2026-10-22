import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Glow, Stage} from './components/primitives';
import {Vial, ncol, psi} from './components/viz';
import {QD} from './scenes/Hook';
import {C, FONT, H, W} from './theme';

/** Gambar sampul video (2560×1440 lewat skala 4/3, lihat Root.tsx). */
const Cover: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 70% 45%, #2c1a5a 0%, ${C.bg2} 45%, ${C.bg} 100%)`}}>
    <Stage>
      <Glow x={1400} y={470} r={560} color="gold" opacity={0.22} />
      {[1060, 1740].map((x) => (
        <line key={x} x1={x} y1={170} x2={x} y2={640} stroke={C.ink} strokeWidth={6} />
      ))}
      {[1, 2, 3].map((n) => (
        <path
          key={n}
          d={Array.from({length: 121}, (_, k) => `${k ? 'L' : 'M'}${1060 + (k / 120) * 680},${560 - (n - 1) * 150 - 60 * psi(n, k / 120)}`).join(' ')}
          fill="none"
          stroke={ncol(n)}
          strokeWidth={7}
          filter="url(#glow)"
        />
      ))}
      {QD.map((q, i) => (
        <Vial key={i} x={1180 + i * 220} y={850} w={120} h={250} color={q.color} glow={1} />
      ))}
    </Stage>
    <div style={{position: 'absolute', left: 110, top: 220, width: 900}}>
      <div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: 8, color: C.gold}}>KIMIA KUANTUM · MODUL 3</div>
      <div style={{fontFamily: FONT.sans, fontSize: 70, fontWeight: 800, color: C.ink, lineHeight: 1.05, marginTop: 10}}>Gerak Translasi</div>
      <div style={{fontFamily: FONT.sans, fontSize: 140, fontWeight: 800, color: C.gold, lineHeight: 1, marginTop: 24, textShadow: '0 0 50px rgba(255,194,74,0.45)'}}>
        Partikel
        <br />
        dalam Kotak
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 44}}>
        {[
          ['kuantisasi', C.cyan],
          ['elektron π', C.violet],
          ['titik kuantum', C.amber],
        ].map(([t, col]) => (
          <div key={t} style={{padding: '10px 22px', borderRadius: 999, border: `2px solid ${col}`, color: col, fontFamily: FONT.sans, fontWeight: 600, fontSize: 30}}>
            {t}
          </div>
        ))}
      </div>
    </div>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.6) 100%)'}} />
  </AbsoluteFill>
);

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${2560 / W})`, transformOrigin: '0 0'}}>
      <Cover />
    </div>
  </AbsoluteFill>
);
