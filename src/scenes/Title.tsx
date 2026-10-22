import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {ncol, psi} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const Letters: React.FC<{text: string; t: number; start: number; step: number; style: React.CSSProperties}> = ({text, t, start, step, style}) => (
  <div style={{display: 'flex', justifyContent: 'center', ...style}}>
    {text.split('').map((ch, i) => {
      const p = ramp(t, start + i * step, start + i * step + 0.9);
      return (
        <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: p, translate: `0px ${(1 - p) * 40}px`, filter: `blur(${(1 - p) * 12}px)`}}>
          {ch}
        </span>
      );
    })}
  </div>
);

const X0 = 260;
const X1 = 1660;

export const Title: React.FC = () => {
  const {t} = useScene();
  const walls = ramp(t, 0.1, 1.4, EASE_IN_OUT);
  const sweep = ramp(t, 2.2, 4.2, EASE_IN_OUT);
  const sub = ramp(t, 2.6, 3.6);
  const line = ramp(t, 1.8, 3.2, EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <Stage>
        <Glow x={960} y={480} r={640} color="gold" opacity={0.16 * walls} />
        {[X0, X1].map((x) => (
          <g key={x} opacity={walls}>
            <line x1={x} y1={160} x2={x} y2={860} stroke={C.ink} strokeWidth={14} opacity={0.15} filter="url(#glow-strong)" />
            <line x1={x} y1={160 + (1 - walls) * 700} x2={x} y2={860} stroke={C.ink} strokeWidth={5} opacity={0.75} />
          </g>
        ))}
        {[1, 2, 3, 4, 5].map((n) => {
          const p = ramp(t, 0.6 + n * 0.25, 2.2 + n * 0.25, EASE_IN_OUT);
          const d = Array.from({length: 241}, (_, k) => {
            const u = k / 240;
            const x = X0 + u * (X1 - X0);
            const y = 500 + 120 * psi(n, u) * Math.cos(t * 1.4 * n * 0.6 + n);
            return `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');
          return <path key={n} d={d} fill="none" stroke={ncol(n)} strokeWidth={3} opacity={0.32 * p} filter="url(#glow)" />;
        })}
      </Stage>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{position: 'relative', textAlign: 'center'}}>
          <Letters text="TEORI KUANTUM GERAK TRANSLASI" t={t} start={0.4} step={0.03} style={{fontFamily: FONT.sans, fontWeight: 300, fontSize: 52, letterSpacing: 14, color: C.ink, marginRight: -14}} />
          <Letters
            text="PARTIKEL DALAM KOTAK"
            t={t}
            start={0.9}
            step={0.05}
            style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 142, letterSpacing: 3, lineHeight: 1.08, color: C.gold, textShadow: '0 0 60px rgba(255,194,74,0.45)'}}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(100deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,0.35) ${sweep * 140 - 20}%, transparent ${sweep * 140 - 10}%)`,
              mixBlendMode: 'overlay',
            }}
          />
        </div>
        <div style={{width: 640 * line, height: 2, margin: '30px 0 24px', background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
        <div style={{fontFamily: FONT.sans, fontSize: 36, color: C.muted, letterSpacing: 1, opacity: sub, translate: `0px ${(1 - sub) * 16}px`}}>
          Kimia Kuantum · Modul 3 — kuantisasi, simpul &amp; penerowongan
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
