import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, ramp} from '../anim';
import {Glow, Stage} from '../components/primitives';
import {Vial, psi} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Peta video: tiga bagian wajib tugas.
const CARDS = [
  {n: '1', title: 'Prinsip & teori dasar', sub: 'kotak 1D–3D, simpul, penerowongan', color: C.cyan, x: 420},
  {n: '2', title: 'Implementasi dalam kimia', sub: 'serapan, elektron π, warna molekul', color: C.violet, x: 960},
  {n: '3', title: 'Penerapan di industri', sub: 'titik kuantum, STM, memori flash', color: C.amber, x: 1500},
];
const Y = 560;

const Icon: React.FC<{i: number; x: number; y: number; t: number}> = ({i, x, y, t}) => {
  if (i === 0)
    return (
      <g>
        <line x1={x - 70} y1={y - 50} x2={x - 70} y2={y + 40} stroke={C.ink} strokeWidth={4} />
        <line x1={x + 70} y1={y - 50} x2={x + 70} y2={y + 40} stroke={C.ink} strokeWidth={4} />
        {[1, 2].map((n) => (
          <path
            key={n}
            d={Array.from({length: 41}, (_, k) => `${k ? 'L' : 'M'}${x - 70 + (k / 40) * 140},${y + 20 - (n - 1) * 45 - 16 * psi(n, k / 40) * Math.cos(t * 2 * n)}`).join(' ')}
            fill="none"
            stroke={n === 1 ? C.gold : C.cyan}
            strokeWidth={3}
          />
        ))}
      </g>
    );
  if (i === 1) {
    const pts = [0, 1, 2, 3].map((k) => [x - 75 + k * 50, y + (k % 2 ? -18 : 18)] as const);
    return (
      <g>
        {pts.slice(1).map((p, k) => (
          <line key={k} x1={pts[k][0]} y1={pts[k][1]} x2={p[0]} y2={p[1]} stroke="#8b97b8" strokeWidth={k === 1 ? 4 : 9} />
        ))}
        {pts.map((p, k) => (
          <circle key={k} cx={p[0]} cy={p[1]} r={13} fill="#4a5266" stroke="#8ea0c8" strokeWidth={2} />
        ))}
        <ellipse cx={x} cy={y} rx={95} ry={40} fill="none" stroke={C.violet} strokeWidth={2} strokeDasharray="6 6" opacity={0.6 + 0.4 * Math.sin(t * 2)} />
      </g>
    );
  }
  return (
    <g>
      {['#4f8cff', '#52f07a', '#ff4a3a'].map((c, k) => (
        <Vial key={c} x={x - 52 + k * 52} y={y} w={38} h={90} color={c} glow={0.8 + 0.2 * Math.sin(t * 2 + k)} />
      ))}
    </g>
  );
};

export const Roadmap: React.FC = () => {
  const {t, cue} = useScene();
  const head = ramp(t, -0.2, 0.9);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', opacity: head, translate: `0px ${(1 - head) * 20}px`}}>
        <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: C.gold}}>TOPIK KAJIAN · MODUL 3</div>
        <div style={{fontFamily: FONT.sans, fontSize: 64, fontWeight: 700, color: C.ink, marginTop: 6}}>Teori Kuantum Gerak Translasi</div>
      </div>
      <Stage>
        {CARDS.map((c, i) => {
          const p = ramp(t, cue(i + 1) - 0.2, cue(i + 1) + 0.6, BACK);
          const lit = ramp(t, cue(i + 1), cue(i + 1) + 0.4) * (i === 2 || t < cue(i + 2) ? 1 : 0.55);
          return (
            <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 40})`}>
              <Glow x={c.x} y={Y} r={260} color={(['cyan', 'violet', 'gold'] as const)[i]} opacity={0.18 * lit} />
              <rect x={c.x - 252} y={Y - 170} width={504} height={340} rx={28} fill="rgba(12,18,40,0.82)" stroke={c.color} strokeOpacity={0.35 + 0.5 * lit} strokeWidth={2.5} />
              <text x={c.x - 214} y={Y - 110} fontFamily={FONT.mono} fontSize={64} fontWeight={600} fill={c.color} dominantBaseline="central">
                {c.n}
              </text>
              <Icon i={i} x={c.x + 120} y={Y - 90} t={t} />
              <text x={c.x - 214} y={Y + 40} fontFamily={FONT.sans} fontSize={31} fontWeight={700} fill={C.ink}>
                {c.title}
              </text>
              <text x={c.x - 214} y={Y + 88} fontFamily={FONT.sans} fontSize={22} fill={C.muted}>
                {c.sub}
              </text>
            </g>
          );
        })}
      </Stage>
    </AbsoluteFill>
  );
};
