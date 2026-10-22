import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, ramp, smoothPath} from '../anim';
import {DrawPath, Glow, Label, Stage} from '../components/primitives';
import {Vial, heat, ncol, psi} from '../components/viz';
import {QD} from './Hook';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const NODES = [
  {x: 250, y: 470, title: 'bebas: kontinu', color: C.cyan},
  {x: 534, y: 560, title: 'Eₙ ∝ n²/L²', color: C.gold},
  {x: 818, y: 470, title: 'simpul & degenerasi', color: C.violet},
  {x: 1102, y: 560, title: 'ekor & penerowongan', color: C.red},
  {x: 1386, y: 470, title: 'elektron π & warna', color: C.mint},
  {x: 1670, y: 560, title: 'titik kuantum · STM · flash', color: C.amber},
];
const PATH = smoothPath(NODES.map((n) => [n.x, n.y]));

const Icon: React.FC<{i: number; x: number; y: number; t: number}> = ({i, x, y, t}) => {
  const wave = (f: (u: number) => number, x0: number, w: number, yy: number, a: number) =>
    Array.from({length: 41}, (_, k) => `${k ? 'L' : 'M'}${(x0 + (k / 40) * w).toFixed(1)},${(yy - a * f(k / 40)).toFixed(1)}`).join(' ');
  switch (i) {
    case 0:
      return <path d={wave((u) => Math.sin(u * 12 - t * 3), x - 60, 120, y, 18)} fill="none" stroke={C.cyan} strokeWidth={4} />;
    case 1:
      return (
        <g>
          {[1, 2, 3].map((n) => (
            <line key={n} x1={x - 46} y1={y + 40 - n * n * 8} x2={x + 46} y2={y + 40 - n * n * 8} stroke={ncol(n)} strokeWidth={4} />
          ))}
        </g>
      );
    case 2:
      return (
        <g>
          {Array.from({length: 100}, (_, k) => {
            const a = k % 10;
            const b = Math.floor(k / 10);
            const v = Math.sin(2 * Math.PI * ((a + 0.5) / 10)) ** 2 * Math.sin(Math.PI * ((b + 0.5) / 10)) ** 2;
            return <rect key={k} x={x - 50 + a * 10} y={y - 50 + b * 10} width={10.5} height={10.5} fill={heat(v)} />;
          })}
        </g>
      );
    case 3:
      return (
        <g>
          <rect x={x - 8} y={y - 40} width={16} height={70} fill={C.red} opacity={0.5} />
          <path d={wave((u) => (u < 0.45 ? Math.sin(u * 30 - t * 3) : u < 0.55 ? Math.sin(0.45 * 30 - t * 3) * Math.exp(-(u - 0.45) * 20) : 0.3 * Math.sin(u * 30 - t * 3)), x - 60, 120, y + 10, 18)} fill="none" stroke={C.cyan} strokeWidth={3} />
        </g>
      );
    case 4: {
      const pts = [0, 1, 2, 3].map((k) => [x - 60 + k * 40, y + (k % 2 ? -14 : 14)] as const);
      return (
        <g>
          {pts.slice(1).map((p, k) => (
            <line key={k} x1={pts[k][0]} y1={pts[k][1]} x2={p[0]} y2={p[1]} stroke="#8b97b8" strokeWidth={k === 1 ? 4 : 8} />
          ))}
          {pts.map((p, k) => (
            <circle key={k} cx={p[0]} cy={p[1]} r={10} fill="#4a5266" stroke="#8ea0c8" strokeWidth={2} />
          ))}
        </g>
      );
    }
    default:
      return (
        <g>
          {QD.map((q, k) => (
            <Vial key={k} x={x - 40 + k * 40} y={y} w={30} h={70} color={q.color} glow={0.9} />
          ))}
        </g>
      );
  }
};

export const Recap: React.FC = () => {
  const {t, cue} = useScene();
  const intro = ramp(t, cue(0) - 0.3, cue(0) + 1);
  const nodesOut = ramp(t, cue(7) - 0.3, cue(7) + 1, EASE_IN_OUT);
  const fin = ramp(t, cue(7) + 0.2, cue(7) + 1.8, EASE_IN_OUT);
  const lit = NODES.map((_, i) => ramp(t, cue(i + 1) - 0.1, cue(i + 1) + 0.6, BACK));
  const pathP = Math.max(...lit.map((l, i) => (l > 0 ? (i + l) / (NODES.length - 1) : 0)));
  const vials = ramp(t, cue(8), cue(8) + 1.5);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={intro * (1 - nodesOut)}>
          <DrawPath d={PATH} p={ramp(t, 0.1, 2.4)} stroke={C.faint} width={2} opacity={0.6} len={3000} />
          {NODES.map((n, i) => (
            <circle key={`g${i}`} cx={n.x} cy={n.y} r={92} fill="none" stroke={n.color} strokeOpacity={0.25 * ramp(t, 0.3 + i * 0.25, 0.9 + i * 0.25)} strokeWidth={2} strokeDasharray="6 8" />
          ))}
          <DrawPath d={PATH} p={Math.min(1, pathP)} stroke={C.gold} width={3} opacity={0.6} len={3000} />
          {NODES.map((n, i) => (
            <g key={i} opacity={lit[i]} transform={`translate(${n.x} ${n.y}) scale(${0.7 + 0.3 * lit[i]}) translate(${-n.x} ${-n.y})`}>
              <Glow x={n.x} y={n.y} r={150} color="gold" opacity={0.15} />
              <circle cx={n.x} cy={n.y} r={92} fill="rgba(12,18,40,0.9)" stroke={n.color} strokeWidth={3} />
              <Icon i={i} x={n.x} y={n.y} t={t} />
              <Label x={n.x} y={n.y + (i % 2 ? 140 : -140)} size={i === 5 ? 24 : 28} color={n.color} weight={700}>
                {n.title}
              </Label>
            </g>
          ))}
        </g>
        {/* penutup: kotak dengan gelombang berdiri + botol berpendar */}
        <g opacity={fin}>
          <Glow x={960} y={430} r={460} color="gold" opacity={0.15} />
          {[560, 1360].map((x) => (
            <line key={x} x1={x} y1={220} x2={x} y2={600} stroke={C.ink} strokeWidth={5} />
          ))}
          {[1, 2, 3].map((n) => (
            <path
              key={n}
              d={Array.from({length: 121}, (_, k) => `${k ? 'L' : 'M'}${560 + (k / 120) * 800},${540 - (n - 1) * 120 - 50 * psi(n, k / 120) * Math.cos(t * 1.8 * n)}`).join(' ')}
              fill="none"
              stroke={ncol(n)}
              strokeWidth={5}
              filter="url(#glow)"
            />
          ))}
        </g>
        {QD.map((q, k) => (
          <Vial key={k} x={760 + k * 200} y={760} w={110} h={190} color={q.color} glow={vials} opacity={vials} />
        ))}
      </Stage>
    </AbsoluteFill>
  );
};
