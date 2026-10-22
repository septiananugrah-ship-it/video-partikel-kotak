import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Atom, Badge, Bond, Label, Stage} from '../components/primitives';
import {Vial, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Pewarna sianin simetris (skematis: jalur konjugasi N…N) dan β-karoten.
const DYES = [
  {m: 1, nm: 524, name: 'sianin', sol: '#d8357f', y: 300},
  {m: 3, nm: 614, name: 'karbosianin', sol: '#3d55e8', y: 470},
  {m: 5, nm: 707, name: 'dikarbosianin', sol: '#1fa7b5', y: 640},
];
const SP = {x0: 1010, x1: 1770, y: 560, h: 220, l0: 400, l1: 800};
const sx = (nm: number) => mix(SP.x0, SP.x1, (nm - SP.l0) / (SP.l1 - SP.l0));
const peak = (c: number, w = 28) => (nm: number) => Math.exp(-(((nm - c) / w) ** 2)) + 0.35 * Math.exp(-(((nm - c + 45) / w) ** 2));
const curve = (f: (nm: number) => number, h = SP.h) =>
  Array.from({length: 201}, (_, i) => {
    const nm = SP.l0 + ((SP.l1 - SP.l0) * i) / 200;
    return `${i ? 'L' : 'M'}${sx(nm).toFixed(1)},${(SP.y - f(nm) * h * 0.9).toFixed(1)}`;
  }).join(' ');

const DyeRow: React.FC<{m: number; y: number; p: number; col: string}> = ({m, y, p, col}) => {
  const n = m + 2;
  const dx = 84;
  const x0 = 200;
  const pts = Array.from({length: n}, (_, i) => [x0 + i * dx, y + (i % 2 ? -26 : 26)] as [number, number]);
  return (
    <g opacity={p}>
      {pts.slice(1).map((q, i) => (
        <Bond key={i} x1={pts[i][0]} y1={pts[i][1]} x2={q[0]} y2={q[1]} order={1} width={10} color={i % 2 ? '#8b97b8' : '#b6a8ff'} />
      ))}
      {pts.map((q, i) => (
        <Atom key={i} x={q[0]} y={q[1]} el={i === 0 || i === n - 1 ? 'N' : 'C'} r={i === 0 || i === n - 1 ? 28 : 22} label={i === 0 || i === n - 1 ? 'N' : null} glow={0} />
      ))}
      <rect x={x0 - 40} y={y - 62} width={(n - 1) * dx + 80} height={124} rx={14} fill="none" stroke={col} strokeWidth={3} opacity={0.8} />
    </g>
  );
};

export const Dyes: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const A = 1 - ramp(t, cue(6) - 0.4, cue(6) + 0.4);
  const rows = DYES.map((_, i) => (i === 0 ? ramp(t, cue(1), cue(1) + 0.8) : ramp(t, cue(3) + 0.4 + (i - 1) * 1.2, cue(3) + 1.2 + (i - 1) * 1.2)));
  const spec = ramp(t, cue(0) + 0.3, cue(0) + 1.1);
  const pk = [ramp(t, wordOf(4, 'lima') - 0.2, wordOf(4, 'lima') + 0.6), ramp(t, wordOf(4, 'enam') - 0.2, wordOf(4, 'enam') + 0.6), ramp(t, wordOf(4, 'tujuh') - 0.2, wordOf(4, 'tujuh') + 0.6)];
  const vials = ramp(t, cue(5), cue(5) + 0.8);
  const kuhn = win(t, cue(2), cue(3) + 0.5, 0.6, 0.6);
  const B = ramp(t, cue(6) - 0.2, cue(6) + 0.8);
  const carSpec = ramp(t, wordOf(6, 'menyerap') - 0.3, wordOf(6, 'menyerap') + 0.8, EASE_IN_OUT);
  const alt = ramp(t, cue(7), cue(7) + 0.8);
  const fin = ramp(t, cue(8), cue(8) + 0.7, BACK);
  const CAR = Array.from({length: 22}, (_, i) => [180 + i * 72, 330 + (i % 2 ? -24 : 24)] as [number, number]);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={A}>
          {DYES.map((d, i) => (
            <g key={i}>
              <DyeRow m={d.m} y={d.y} p={rows[i]} col={wlColor(d.nm)} />
              <Label x={200 + (d.m + 1) * 84 + 70} y={d.y} size={28} color={C.ink} anchor="start" opacity={rows[i]}>
                {d.name}
              </Label>
            </g>
          ))}
          <Label x={200} y={760} size={22} color={C.muted} anchor="start" opacity={rows[0]}>
            skematis: jalur konjugasi N ⋯ N = kotak
          </Label>
          <g opacity={kuhn}>
            <rect x={620} y={250} width={340} height={110} rx={14} fill="rgba(12,18,40,0.9)" stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} />
            <Label x={790} y={285} size={26} color={C.gold} weight={700}>
              H. Kuhn (1948–1949)
            </Label>
            <Label x={790} y={325} size={22} color={C.muted}>
              model elektron bebas
            </Label>
          </g>
          {/* spektrum serapan */}
          <g opacity={spec}>
            <line x1={SP.x0} y1={SP.y} x2={SP.x1} y2={SP.y} stroke={C.muted} strokeWidth={2} />
            <rect x={SP.x0} y={SP.y + 8} width={SP.x1 - SP.x0} height={16} fill="url(#rainbow-h)" opacity={0.75} />
            {[400, 500, 600, 700, 800].map((nm) => (
              <Label key={nm} x={sx(nm)} y={SP.y + 44} size={20} color={C.muted} font="mono">
                {nm}
              </Label>
            ))}
            <Label x={(SP.x0 + SP.x1) / 2} y={SP.y - SP.h - 30} size={24} color={C.ink} weight={600}>
              λmaks terukur (etanol, katalog Sigma-Aldrich)
            </Label>
            {DYES.map((d, i) => (
              <g key={i} opacity={pk[i]}>
                <path d={curve(peak(d.nm))} fill="none" stroke={wlColor(d.nm)} strokeWidth={4} />
                <Label x={sx(d.nm)} y={SP.y - SP.h * 0.9 - 22} size={22} color={wlColor(d.nm)} weight={700} font="mono">
                  {`≈${d.nm}`}
                </Label>
              </g>
            ))}
          </g>
          {DYES.map((d, i) => (
            <g key={i} opacity={vials}>
              <Vial x={1150 + i * 230} y={770} w={90} h={150} color={d.sol} glow={0.75} />
              <Label x={1150 + i * 230 + 60} y={720} size={20} color={C.muted} anchor="start">
                {d.name}
              </Label>
            </g>
          ))}
        </g>
        {/* β-karoten */}
        <g opacity={B}>
          {CAR.slice(1).map((q, i) => (
            <Bond key={i} x1={CAR[i][0]} y1={CAR[i][1]} x2={q[0]} y2={q[1]} order={i % 2 ? 1 : 2} width={8} />
          ))}
          {CAR.map((q, i) => (
            <circle key={i} cx={q[0]} cy={q[1]} r={13} fill="#4a5266" stroke="#8ea0c8" strokeWidth={2} />
          ))}
          <Label x={960} y={230} size={30} color={C.amber} weight={700}>
            β-karoten · 11 ikatan rangkap terkonjugasi
          </Label>
          <g opacity={alt}>
            <Label x={CAR[10][0] + 36} y={410} size={24} color={C.gold} weight={600}>
              C=C ≈ 1,34 Å · C–C ≈ 1,46 Å
            </Label>
            <Label x={CAR[10][0] + 36} y={445} size={22} color={C.muted}>
              ikatan berselang-seling → celah tidak menutup
            </Label>
          </g>
          <Vial x={330} y={680} w={110} h={200} color="#ff8a1a" glow={0.85} />
          <Label x={330} y={815} size={22} color={C.amber}>
            tampak jingga
          </Label>
          <g opacity={carSpec}>
            <line x1={SP.x0} y1={SP.y + 220} x2={SP.x1} y2={SP.y + 220} stroke={C.muted} strokeWidth={2} />
            <rect x={SP.x0} y={SP.y + 228} width={SP.x1 - SP.x0} height={14} fill="url(#rainbow-h)" opacity={0.75} />
            <path
              d={Array.from({length: 201}, (_, i) => {
                const nm = SP.l0 + ((SP.l1 - SP.l0) * i) / 200;
                const v = 0.75 * Math.exp(-(((nm - 425) / 14) ** 2)) + Math.exp(-(((nm - 450) / 15) ** 2)) + 0.85 * Math.exp(-(((nm - 478) / 15) ** 2));
                return `${i ? 'L' : 'M'}${sx(nm).toFixed(1)},${(SP.y + 220 - v * 170).toFixed(1)}`;
              }).join(' ')}
              fill="none"
              stroke={C.amber}
              strokeWidth={4}
            />
            <Label x={sx(450)} y={SP.y + 20} size={24} color={C.amber} weight={700} font="mono">
              ≈ 450 nm (biru diserap)
            </Label>
            <Label x={sx(690)} y={SP.y + 120} size={22} color={C.red} opacity={alt}>
              {`model kotak polos: jauh di inframerah`}
            </Label>
          </g>
        </g>
      </Stage>
      <Badge x={640} y={515} text="TREN ✓" color={C.mint} opacity={fin * B} />
      <Badge x={1060} y={515} text="ANGKA PRESISI → MODEL LENGKAP" color={C.gold} opacity={fin * B} />
    </AbsoluteFill>
  );
};
