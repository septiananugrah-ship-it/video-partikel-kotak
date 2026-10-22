import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN, EASE_IN_OUT, mix, rand, ramp} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {Electron, Vial, Walls, psi} from '../components/viz';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Tiga botol titik kuantum CdSe di bawah lampu UV → zoom ke satu butir → elektron dalam kotak.
export const QD = [
  {x: 620, color: '#3b6cff', size: '≈ 2 nm', d: 2, word: 'biru'},
  {x: 960, color: '#2fe060', size: '≈ 3 nm', d: 3, word: 'hijau'},
  {x: 1300, color: '#ff3020', size: '≈ 6 nm', d: 6, word: 'merah'},
];
const VY = 540;
const FOCUS = {x: QD[0].x, y: VY + 60};
const CEN = {x: 960, y: 500};

// kisi atom nanokristal (Cd emas, Se jingga) di dalam lingkaran
const LATTICE = (() => {
  const pts: {x: number; y: number; cd: boolean}[] = [];
  const a = 46;
  for (let i = -8; i <= 8; i++)
    for (let j = -8; j <= 8; j++) {
      const x = i * a + (j % 2 ? a / 2 : 0);
      const y = j * a * 0.866;
      if (Math.hypot(x, y) < 290) pts.push({x: CEN.x + x, y: CEN.y + y, cd: (i + j) % 2 === 0});
    }
  return pts;
})();

export const Hook: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const uv = ramp(t, wordOf(0, 'ultraviolet') - 0.3, wordOf(0, 'ultraviolet') + 0.5);
  const lit = QD.map((q) => ramp(t, wordOf(1, q.word) - 0.1, wordOf(1, q.word) + 0.5));
  const cdse = ramp(t, wordOf(2, 'kadmium') - 0.1, wordOf(2, 'kadmium') + 0.6);
  const noDye = ramp(t, cue(3), cue(3) + 0.5) * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.2));
  const sizes = QD.map((_, i) => ramp(t, cue(4) + 1.6 + i * 0.5, cue(4) + 2.2 + i * 0.5, BACK));
  const q = ramp(t, cue(5), cue(5) + 0.6, BACK) * (1 - ramp(t, cue(6) - 0.4, cue(6) + 0.2));
  // zoom-through ke butir biru
  const z1 = ramp(t, cue(6) - 0.3, cue(6) + 1.3, EASE_IN);
  const s1 = Math.exp(z1 * Math.log(26));
  const stage1 = 1 - ramp(z1, 0.6, 1);
  const crystal = ramp(t, cue(6) + 0.9, cue(6) + 1.8) * (1 - ramp(t, wordOf(6, 'partikel') - 0.5, wordOf(6, 'partikel') + 0.3));
  const box = ramp(t, wordOf(6, 'partikel') - 0.2, wordOf(6, 'partikel') + 0.8, EASE_IN_OUT);
  // elektron memantul di dalam butir
  const bx = CEN.x + 200 * Math.sin(t * 2.3) * Math.cos(t * 0.7);
  const by = CEN.y + 150 * Math.sin(t * 1.7 + 1);
  const B = {x0: 660, x1: 1260, top: 280, bottom: 740};

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={stage1} transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${s1}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
          {/* lampu UV */}
          <g opacity={ramp(t, 0, 1)}>
            <rect x={500} y={190} width={920} height={36} rx={18} fill="#1a1d38" stroke="#5a5f95" strokeWidth={2} />
            <rect x={520} y={200} width={880} height={16} rx={8} fill={C.violet} opacity={0.2 + 0.8 * uv} filter="url(#glow-strong)" />
            <path d="M520,226 L380,820 L1540,820 L1400,226 Z" fill={C.violet} opacity={0.07 * uv} />
            <Label x={1460} y={208} size={22} color={C.violet} anchor="start" font="mono" opacity={uv}>
              UV 365 nm
            </Label>
          </g>
          {QD.map((v, i) => (
            <g key={i}>
              <Vial x={v.x} y={VY} w={170} h={360} color={v.color} glow={lit[i] * (0.9 + 0.1 * Math.sin(t * 3 + i))} opacity={ramp(t, 0.2 + i * 0.2, 1.0 + i * 0.2)} />
              <Label x={v.x} y={VY + 220} size={28} color={C.ink} weight={600} font="mono" opacity={cdse}>
                CdSe
              </Label>
              <g opacity={sizes[i]}>
                <circle cx={v.x} cy={VY + 290} r={v.d * 6} fill={v.color} opacity={0.85} filter="url(#glow)" />
                <Label x={v.x + v.d * 6 + 16} y={VY + 290} size={26} color={v.color} anchor="start" weight={700}>
                  {v.size}
                </Label>
              </g>
            </g>
          ))}
          <g opacity={noDye}>
            <Label x={960} y={310} size={30} color={C.red} weight={700}>
              ✗ tanpa zat pewarna
            </Label>
          </g>
          <text x={1640} y={540} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={800} fontSize={190} fill={C.gold} opacity={q} style={{scale: String(0.7 + 0.3 * q)}}>
            ?
          </text>
        </g>
        {/* nanokristal: kisi atom + elektron terkurung */}
        <g opacity={crystal}>
          <circle cx={CEN.x} cy={CEN.y} r={320} fill="url(#soft-cyan)" opacity={0.18} />
          {LATTICE.map((a, i) => (
            <circle key={i} cx={a.x} cy={a.y} r={a.cd ? 13 : 16} fill={a.cd ? '#e8c46a' : '#ff8f3a'} opacity={0.5 + 0.2 * rand(i)} />
          ))}
          <circle cx={CEN.x} cy={CEN.y} r={305} fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
          <Electron x={bx} y={by} r={14} />
          <Label x={CEN.x} y={CEN.y + 350} size={28} color={C.muted}>
            satu butir CdSe · Ø ≈ 2 nm
          </Label>
        </g>
        {/* model: partikel dalam kotak */}
        <g opacity={box}>
          <Walls x0={B.x0} x1={B.x1} top={B.top} bottom={B.bottom} p={box} />
          {[1, 2, 3].map((n) => {
            const y = mix(B.bottom - 70, B.top + 70, (n - 1) / 2);
            const pts = Array.from({length: 121}, (_, k) => {
              const u = k / 120;
              return `${k ? 'L' : 'M'}${(B.x0 + u * (B.x1 - B.x0)).toFixed(1)},${(y - 46 * psi(n, u) * Math.cos(t * 2 * n)).toFixed(1)}`;
            }).join(' ');
            return <path key={n} d={pts} fill="none" stroke={[C.gold, C.cyan, C.violet][n - 1]} strokeWidth={5} opacity={ramp(t, wordOf(6, 'partikel') + 0.4 + 0.3 * n, wordOf(6, 'partikel') + 1 + 0.3 * n)} />;
          })}
          <Glow x={960} y={510} r={360} color="gold" opacity={0.12} />
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
