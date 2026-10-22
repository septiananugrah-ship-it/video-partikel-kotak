import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Glow, Label, Stage} from '../components/primitives';
import {Vial, Walls, psi} from '../components/viz';
import {ScaleHud, ZoomGrid} from '../components/Zoom';
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

// nanokristal CdSe 3D (kisi zinc blende: dua sublattice FCC), jari-jari ±2 sel satuan
const NANO = (() => {
  const fcc = [
    [0, 0, 0],
    [0.5, 0.5, 0],
    [0.5, 0, 0.5],
    [0, 0.5, 0.5],
  ];
  const pts: {x: number; y: number; z: number; cd: boolean}[] = [];
  const R = 1.645; // = 1,0 nm ÷ a (a = 0,608 nm) → diameter 2 nm
  for (let i = -3; i <= 3; i++)
    for (let j = -3; j <= 3; j++)
      for (let k = -3; k <= 3; k++)
        for (const [fx, fy, fz] of fcc)
          for (const cd of [true, false]) {
            const x = i + fx + (cd ? 0 : 0.25);
            const y = j + fy + (cd ? 0 : 0.25);
            const z = k + fz + (cd ? 0 : 0.25);
            if (Math.hypot(x, y, z) < R) pts.push({x, y, z, cd});
          }
  return pts;
})();

const Nanocrystal: React.FC<{t: number; cx: number; cy: number; s: number; opacity: number}> = ({t, cx, cy, s, opacity}) => {
  if (opacity <= 0) return null;
  const yaw = t * 0.35;
  const pitch = 0.42;
  const P = NANO.map((q) => {
    const x1 = q.x * Math.cos(yaw) - q.y * Math.sin(yaw);
    const d1 = q.x * Math.sin(yaw) + q.y * Math.cos(yaw);
    const z2 = q.z * Math.cos(pitch) - d1 * Math.sin(pitch);
    const d2 = q.z * Math.sin(pitch) + d1 * Math.cos(pitch);
    return {X: cx + x1 * s, Y: cy - z2 * s, d: d2, cd: q.cd};
  }).sort((a, b) => b.d - a.d);
  const breathe = 0.85 + 0.15 * Math.sin(t * 2.2);
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={cy} r={s * 2.3} fill="url(#soft-cyan)" opacity={0.25} />
      {P.map((p, i) => {
        const near = 0.55 + 0.45 * (1 - (p.d + 2) / 4);
        return <circle key={i} cx={p.X} cy={p.Y} r={(p.cd ? 0.085 : 0.105) * s * (0.7 + 0.45 * near)} fill={p.cd ? '#e8c46a' : '#ff8f3a'} opacity={0.25 + 0.6 * near} />;
      })}
      {/* awan elektron terkurung: keadaan dasar mengisi seluruh butir */}
      <circle cx={cx} cy={cy} r={s * 1.45 * breathe} fill="url(#soft-cyan)" opacity={0.55} />
      <circle cx={cx} cy={cy} r={s * 1.78} fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
    </g>
  );
};

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
  const crystal = ramp(t, cue(6) + 1.15, cue(6) + 1.9) * (1 - ramp(t, wordOf(6, 'partikel') - 0.5, wordOf(6, 'partikel') + 0.3));
  const hud = win(t, cue(6) - 0.5, wordOf(6, 'partikel') + 0.3, 0.4, 0.5);
  const box = ramp(t, wordOf(6, 'partikel') - 0.2, wordOf(6, 'partikel') + 0.8, EASE_IN_OUT);
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
          {/* berkas UV */}
          {Array.from({length: 9}, (_, k) => (
            <rect key={`ray${k}`} x={540 + k * 105 + 20 * Math.sin(t * 0.7 + k)} y={226} width={26} height={560} fill={C.violet} opacity={0.05 * uv * (0.6 + 0.4 * Math.sin(t * 1.3 + k * 1.7))} filter="url(#blur-soft)" />
          ))}
          {QD.map((v, i) => (
            <g key={i}>
              <Vial x={v.x} y={VY} w={170} h={360} color={v.color} glow={lit[i] * (0.9 + 0.1 * Math.sin(t * 3 + i))} opacity={ramp(t, 0.2 + i * 0.2, 1.0 + i * 0.2)} t={t} />
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
        {/* zoom ala SCIENTIAN ke satu butir */}
        <ZoomGrid k={s1} alpha={hud * 0.9} />
        <Nanocrystal t={t} cx={CEN.x} cy={CEN.y} s={140 * (0.6 + 0.4 * crystal)} opacity={crystal} />
        <Label x={CEN.x} y={CEN.y + 330} size={28} color={C.muted} opacity={crystal}>
          satu butir CdSe · Ø ≈ 2 nm · ±160 atom (emas = Cd, jingga = Se)
        </Label>
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
      <ScaleHud level={z1} exps={[-2, -9]} names={['BOTOL KECIL', 'SATU BUTIR CdSe']} colors={[C.blue, C.cyan]} alpha={hud} />
    </AbsoluteFill>
  );
};
