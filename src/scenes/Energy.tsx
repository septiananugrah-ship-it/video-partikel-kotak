import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {E1_EV, id, ncol, psi} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const BOT = 830;
const UNIT = 35; // px per E₁
const CX = 560;

export const Energy: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const A = 1 - ramp(t, cue(8) - 0.3, cue(8) + 0.6);
  const s = mix(1, 2, ramp(t, cue(7) + 0.3, cue(7) + 2.3, EASE_IN_OUT)); // L → sL
  const half = 200 * s;
  const x0 = CX - half;
  const x1 = CX + half;
  const box = ramp(t, -0.2, 0.8);
  const lv = [1, 2, 3, 4].map((n) => ramp(t, cue(1) + 0.6 + n * 0.4, cue(1) + 1.2 + n * 0.4, BACK));
  const ghost = ramp(t, cue(7) + 0.3, cue(7) + 1);
  const leftLbl = 1 - ramp(t, cue(7) + 0.3, cue(7) + 1);
  const band = win(t, cue(2) - 0.4, cue(3) - 0.2, 0.6, 0.6);
  const mult = ramp(t, cue(3), cue(3) + 0.6) * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.2));
  const gaps = win(t, wordOf(3, 'renggang'), cue(4) - 0.2, 0.6, 0.4);
  const ev = win(t, cue(4), cue(7) - 0.1, 0.6, 0.4);
  const quarter = ramp(t, cue(7) + 0.4, cue(7) + 1.2);
  const macro = ramp(t, cue(8) + 0.2, cue(8) + 1.4);
  const yE = (e: number) => BOT - (e * UNIT) / (s * s);
  const evLabel = (n: number) => `${id(E1_EV * n * n, n === 1 ? 3 : 2)} eV`;

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={A}>
          {/* dinding kotak */}
          <g opacity={box}>
            {[x0, x1].map((x, i) => (
              <g key={i}>
                <line x1={x} y1={230} x2={x} y2={BOT} stroke={C.ink} strokeWidth={10} opacity={0.15} filter="url(#glow-strong)" />
                <line x1={x} y1={230} x2={x} y2={BOT} stroke={C.ink} strokeWidth={5} />
              </g>
            ))}
            <line x1={x0} y1={BOT} x2={x1} y2={BOT} stroke={C.muted} strokeWidth={2} />
            <line x1={x0 - 110} y1={BOT} x2={x0 - 110} y2={240} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <Label x={x0 - 110} y={218} size={28} color={C.muted} font="serif" italic>
              E
            </Label>
          </g>
          {[1, 2, 3, 4].map((n, i) => {
            const y = yE(n * n);
            const p = lv[i];
            const d = Array.from({length: 81}, (_, k) => `${k ? 'L' : 'M'}${(x0 + (k / 80) * (x1 - x0)).toFixed(1)},${(y - 20 * psi(n, k / 80) * Math.cos(t * 2 + n)).toFixed(1)}`).join(' ');
            return (
              <g key={n} opacity={p}>
                <line x1={mix(CX, x0, p)} y1={y} x2={mix(CX, x1, p)} y2={y} stroke={ncol(n)} strokeWidth={4} />
                <path d={d} fill="none" stroke={ncol(n)} strokeWidth={2} opacity={0.55} />
                <line x1={CX - 200} y1={BOT - n * n * UNIT} x2={CX + 200} y2={BOT - n * n * UNIT} stroke={ncol(n)} strokeWidth={2} strokeDasharray="8 8" opacity={0.45 * ghost} />
                <Label x={x0 - 24} y={y} size={26} color={ncol(n)} anchor="end" font="serif" italic opacity={leftLbl}>
                  n = {n}
                </Label>
                <Label x={x1 + 22} y={y} size={26} color={ncol(n)} anchor="start" font="mono" opacity={mult}>
                  {n === 1 ? 'E₁' : `${n * n}E₁`}
                </Label>
                <Label x={x1 + 22} y={y} size={26} color={ncol(n)} anchor="start" font="mono" opacity={ev}>
                  {evLabel(n)}
                </Label>
                <Label x={x1 + 22} y={y} size={26} color={ncol(n)} anchor="start" font="mono" opacity={quarter}>
                  {['¼ E₁', '1 E₁', '2,25 E₁', '4 E₁'][n - 1]}
                </Label>
              </g>
            );
          })}
          {/* selisih antartingkat */}
          <g opacity={gaps}>
            {[1, 2, 3].map((n) => {
              const ya = yE(n * n);
              const yb = yE((n + 1) * (n + 1));
              return (
                <g key={n}>
                  <line x1={x1 + 150} y1={ya - 6} x2={x1 + 150} y2={yb + 6} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
                  <Label x={x1 + 170} y={(ya + yb) / 2} size={26} color={C.gold} anchor="start" font="mono" weight={600}>
                    {`${2 * n + 1}E₁`}
                  </Label>
                </g>
              );
            })}
          </g>
          {/* pita kontinu yang runtuh menjadi tangga */}
          <g opacity={band}>
            <rect x={1040} y={yE(16)} width={40} height={BOT - yE(16)} rx={8} fill="url(#rainbow-v)" opacity={0.6 * (1 - ramp(t, cue(2) + 0.8, cue(2) + 2))} />
            {[1, 4, 9, 16].map((e) => (
              <rect key={e} x={1030} y={yE(e) - 3} width={60} height={6} fill={C.gold} opacity={ramp(t, cue(2) + 0.8, cue(2) + 1.6)} />
            ))}
            <Label x={1060} y={865} size={24} color={C.muted}>
              kontinu → diskret
            </Label>
          </g>
          <g opacity={quarter}>
            <line x1={x0} y1={BOT + 34} x2={x1} y2={BOT + 34} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
            <Label x={CX} y={BOT + 34} size={30} color={C.gold} font="serif" italic>
              2L
            </Label>
          </g>
        </g>
        {/* skala sehari-hari */}
        <g opacity={macro}>
          <rect x={560} y={300} width={800} height={500} rx={10} fill="#3a2a16" opacity={0.35} stroke="#c9a36a" strokeWidth={4} />
          {Array.from({length: 120}, (_, k) => (
            <line key={k} x1={575} y1={790 - k * 4} x2={1345} y2={790 - k * 4} stroke={C.gold} strokeWidth={1} opacity={0.25} />
          ))}
          <circle cx={960 + 330 * Math.sin(t * 1.6)} cy={760 - 220 * Math.abs(Math.sin(t * 2.6))} r={34} fill={C.amber} filter="url(#glow)" />
          <Label x={960} y={260} size={30} color={C.ink} weight={600}>
            bola 50 g di dalam kotak 30 cm
          </Label>
          <Label x={1400} y={540} size={28} color={C.gold} anchor="start" font="mono">
            E₁ ≈ 1 × 10⁻⁶⁵ J
          </Label>
          <Label x={1400} y={590} size={24} color={C.muted} anchor="start">
            anak tangga tak terbedakan
          </Label>
        </g>
      </Stage>
      <Formula x={1450} y={300} p={win(t, cue(1) - 0.2, cue(6) - 0.2, 0.7, 0.5) * ramp(t, cue(1) - 0.2, cue(1) + 0.6, BACK)} accent={C.gold} caption="tingkat energi partikel dalam kotak 1D">
        <V color={C.gold}>E</V>
        <Sub>n</Sub>&nbsp;=&nbsp;
        <Frac n={<><V>n</V><Sup>2</Sup><V>h</V><Sup>2</Sup></>} d={<>8<V>mL</V><Sup>2</Sup></>} />
        ,&nbsp;&nbsp;<V>n</V>&nbsp;=&nbsp;1, 2, 3, …
      </Formula>
      <Formula x={1450} y={300} p={win(t, cue(6), cue(7) - 0.1, 0.7, 0.4)} accent={C.cyan} caption="lebih ringan atau lebih sempit → anak tangga lebih renggang">
        <V color={C.gold}>E</V>
        <Sub>n</Sub>&nbsp;∝&nbsp;
        <Frac n={<><V>n</V><Sup>2</Sup></>} d={<><V>m</V>&thinsp;<V>L</V><Sup>2</Sup></>} />
      </Formula>
      <Formula x={1450} y={300} p={win(t, cue(7), cue(8) - 0.1, 0.7, 0.4)} accent={C.mint} caption="semua tingkat turun menjadi seperempatnya">
        <V>L</V>&nbsp;→&nbsp;2<V>L</V>&nbsp;&nbsp;⇒&nbsp;&nbsp;<V>E</V>
        <Sub>n</Sub>&nbsp;→&nbsp;
        <Frac n={<><V>E</V><Sub>n</Sub></>} d="4" />
      </Formula>
    </AbsoluteFill>
  );
};
