import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Label, Stage, V} from '../components/primitives';
import {Electron, Walls as WallsViz, ncol} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const B = {x0: 300, x1: 1100, top: 270, bottom: 820};
const MID = 545;
const W = B.x1 - B.x0;

const curve = (f: (u: number) => number, y: number, amp: number) =>
  Array.from({length: 161}, (_, i) => {
    const u = i / 160;
    return `${i ? 'L' : 'M'}${(B.x0 + u * W).toFixed(1)},${(y - amp * f(u)).toFixed(1)}`;
  }).join(' ');

export const Walls: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const drop = ramp(t, cue(0) + 0.6, cue(0) + 1.4, BACK);
  const lbl = ramp(t, wordOf(0, 'L', 1) - 0.2, wordOf(0, 'L', 1) + 0.5);
  const pot = ramp(t, cue(1), cue(1) + 0.7);
  const n1 = win(t, cue(2), cue(4) - 0.2, 0.9, 0.5);
  const pins = win(t, wordOf(2, 'dinding') - 0.3, cue(4) - 0.2, 0.5, 0.5);
  const guitar = win(t, cue(3) - 0.2, cue(7) - 0.3, 0.7, 0.6);
  const gen = win(t, cue(4), cue(6) - 0.2, 0.8, 0.5);
  const cosOut = ramp(t, cue(5) + 0.5, cue(5) + 1.6);
  const sweepOn = win(t, cue(6), cue(7) - 0.1, 0.6, 0.5);
  const sw = ramp(t, cue(6) + 0.3, cue(7) - 0.4, EASE_IN_OUT);
  const kL = Math.PI * mix(0.55, 3.25, sw);
  const fit = Math.abs(Math.sin(kL)) < 0.09;
  const stack = ramp(t, cue(7), cue(7) + 0.8) * (1 - 0.7 * ramp(t, cue(8), cue(8) + 0.5));
  const zero = ramp(t, cue(8) + 0.2, cue(8) + 0.9);
  const vib = (n: number) => 0.78 + 0.22 * Math.cos(t * 3 * n);
  const vplot = win(t, cue(1) - 0.2, cue(4) - 0.3, 0.7, 0.5);

  return (
    <AbsoluteFill>
      <Stage>
        {(() => {
          const saw = (t * 0.55) % 2;
          const u = saw < 1 ? saw : 2 - saw;
          return <Electron x={B.x0 + 30 + u * (W - 60)} y={MID} r={16} opacity={win(t, -0.5, cue(2) - 0.2, 0.6, 0.5)} />;
        })()}
        <WallsViz x0={B.x0} x1={B.x1} top={B.top} bottom={B.bottom} p={drop} hatch={pot} />
        <g opacity={lbl * drop}>
          <line x1={B.x0} y1={B.bottom + 34} x2={B.x1} y2={B.bottom + 34} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
          <Label x={(B.x0 + B.x1) / 2} y={B.bottom + 34} size={32} color={C.gold} font="serif" italic>
            L
          </Label>
          <Label x={B.x0} y={B.bottom + 62} size={22} color={C.muted} font="mono">
            x = 0
          </Label>
          <Label x={B.x1} y={B.bottom + 62} size={22} color={C.muted} font="mono">
            x = L
          </Label>
        </g>
        <g opacity={pot}>
          <Label x={(B.x0 + B.x1) / 2} y={B.top + 30} size={30} color={C.mint} weight={600}>
            V = 0
          </Label>
          <Label x={B.x0 - 60} y={B.top + 30} size={34} color={C.red} weight={700}>
            ∞
          </Label>
          <Label x={B.x1 + 60} y={B.top + 30} size={34} color={C.red} weight={700}>
            ∞
          </Label>
        </g>
        {/* n = 1 dengan ujung terikat */}
        <path d={curve((u) => Math.sin(Math.PI * u) * vib(1), MID, 170)} fill="none" stroke={C.gold} strokeWidth={6} opacity={n1} filter="url(#glow)" />
        <g opacity={pins}>
          {[B.x0, B.x1].map((x) => (
            <g key={x}>
              <circle cx={x} cy={MID} r={12} fill={C.gold} filter="url(#glow-strong)" />
              <Label x={x + (x === B.x0 ? 70 : -70)} y={MID + 40} size={26} color={C.gold} weight={700}>
                ψ = 0
              </Label>
            </g>
          ))}
        </g>
        {/* grafik potensial V(x) */}
        <g opacity={vplot}>
          <rect x={1250} y={250} width={540} height={260} rx={20} fill="rgba(12,18,40,0.7)" stroke={C.faint} strokeWidth={2} />
          <path d="M1330,290 L1330,460 L1710,460 L1710,290" fill="none" stroke={C.gold} strokeWidth={5} />
          <rect x={1280} y={290} width={50} height={170} fill="url(#hatch-wall)" />
          <rect x={1710} y={290} width={50} height={170} fill="url(#hatch-wall)" />
          <Label x={1520} y={430} size={26} color={C.mint} font="serif" italic>
            V = 0
          </Label>
          <Label x={1520} y={320} size={26} color={C.ink} font="serif" italic>
            V(x)
          </Label>
          <Label x={1330} y={485} size={20} color={C.muted} font="mono">
            0
          </Label>
          <Label x={1710} y={485} size={20} color={C.muted} font="mono">
            L
          </Label>
        </g>
        {/* senar gitar */}
        <g opacity={guitar}>
          <rect x={1250} y={560} width={540} height={170} rx={20} fill="rgba(12,18,40,0.7)" stroke={C.faint} strokeWidth={2} />
          {[1290, 1750].map((x) => (
            <rect key={x} x={x - 9} y={610} width={18} height={70} rx={4} fill="#c9a36a" />
          ))}
          <path
            d={Array.from({length: 81}, (_, i) => `${i ? 'L' : 'M'}${1290 + (i / 80) * 460},${645 - 34 * Math.sin((Math.PI * i) / 80) * Math.cos(t * 9)}`).join(' ')}
            fill="none"
            stroke="#f2e6c9"
            strokeWidth={3}
          />
          <Label x={1520} y={590} size={24} color={C.muted}>
            senar gitar: ujung terikat
          </Label>
        </g>
        {/* solusi umum */}
        <g opacity={gen}>
          <path d={curve((u) => Math.sin(2.2 * Math.PI * u), MID, 120)} fill="none" stroke={C.cyan} strokeWidth={5} />
          <path d={curve((u) => Math.cos(2.2 * Math.PI * u), MID, 120)} fill="none" stroke={C.red} strokeWidth={5} opacity={1 - 0.75 * cosOut} strokeDasharray={cosOut > 0.5 ? '10 8' : undefined} />
          <g opacity={cosOut}>
            <circle cx={B.x0} cy={MID - 120} r={18} fill="none" stroke={C.red} strokeWidth={4} />
            <Label x={B.x0 + 40} y={MID - 160} size={26} color={C.red} weight={700} anchor="start">
              cos 0 = 1 ≠ 0 ✗
            </Label>
          </g>
        </g>
        {/* menyapu k: hanya yang pas */}
        <g opacity={sweepOn}>
          <path d={curve((u) => Math.sin(kL * u), MID, 150)} fill="none" stroke={fit ? C.mint : C.cyan} strokeWidth={6} filter={fit ? 'url(#glow)' : undefined} />
          <circle cx={B.x1} cy={MID - 150 * Math.sin(kL)} r={14} fill={fit ? C.mint : C.red} filter="url(#glow)" />
          <Label x={(B.x0 + B.x1) / 2} y={B.top + 80} size={30} color={fit ? C.mint : C.muted} font="mono" weight={600}>
            {`kL = ${(kL / Math.PI).toFixed(2).replace('.', ',')} π  ${fit ? '✓ pas' : ''}`}
          </Label>
        </g>
        {/* n = 1, 2, 3 */}
        <g opacity={stack}>
          {[1, 2, 3].map((n) => {
            const y = [700, 545, 390][n - 1];
            const p = ramp(t, cue(7) + 0.3 + (n - 1) * 0.6, cue(7) + 1 + (n - 1) * 0.6);
            return (
              <g key={n} opacity={p}>
                <line x1={B.x0} y1={y} x2={B.x1} y2={y} stroke={C.faint} strokeWidth={1.5} />
                <path d={curve((u) => Math.sin(n * Math.PI * u) * vib(n), y, 58)} fill="none" stroke={ncol(n)} strokeWidth={5} />
                <Label x={B.x1 + 140} y={y} size={32} color={ncol(n)} anchor="start" font="serif" italic weight={700}>
                  n = {n}
                </Label>
                <Label x={B.x1 + 260} y={y} size={26} color={C.ink} anchor="start">
                  {n === 1 ? '½ gelombang' : `${n} × ½ gelombang`}
                </Label>
              </g>
            );
          })}
        </g>
        <g opacity={zero}>
          <line x1={B.x0} y1={790} x2={B.x1} y2={790} stroke={C.red} strokeWidth={5} strokeDasharray="14 10" />
          <Label x={B.x1 + 140} y={790} size={28} color={C.red} anchor="start" weight={700}>
            n = 0 → ψ = 0 ✗
          </Label>
        </g>
      </Stage>
      <Formula x={1500} y={290} p={win(t, cue(4), cue(5) - 0.1, 0.7, 0.4)} accent={C.cyan} caption="solusi umum di dalam kotak">
        <V>ψ</V>&nbsp;=&nbsp;<V>A</V>&thinsp;sin&thinsp;<V>kx</V>&nbsp;+&nbsp;<V color={C.red}>B</V>&thinsp;cos&thinsp;<V>kx</V>
      </Formula>
      <Formula x={1500} y={290} p={win(t, cue(5), cue(6) - 0.1, 0.7, 0.4)} accent={C.red} caption="ψ(0) = 0 → B = 0">
        <V>ψ</V>&nbsp;=&nbsp;<V>A</V>&thinsp;sin&thinsp;<V>kx</V>
        <span style={{opacity: 0.5, textDecoration: 'line-through', textDecorationColor: C.red, marginLeft: 18}}>
          + <V>B</V> cos <V>kx</V>
        </span>
      </Formula>
      <Formula x={1500} y={290} p={ramp(t, cue(6) + 0.2, cue(6) + 1)} accent={C.gold} caption="ψ(L) = 0 → sin kL = 0">
        <V color={C.gold}>kL</V>&nbsp;=&nbsp;<V>n</V>π,&nbsp;&nbsp;<V>n</V>&nbsp;=&nbsp;1, 2, 3, …
      </Formula>
    </AbsoluteFill>
  );
};
