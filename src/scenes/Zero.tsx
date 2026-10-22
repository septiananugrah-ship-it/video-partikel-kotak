import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {Electron, areaPath, plotPath, psi} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const BOX = {cx: 500, top: 300, bottom: 760};
const MP = {cx: 1420, y: 800, half: 360, h: 230};
const Q = 4 * Math.PI; // rentang q = pL/ħ untuk L awal

/** |φ₁(q)|² ternormalisasi ke puncak 1, q = pL/ħ. */
const phi1 = (q: number) => {
  const d = Math.PI * Math.PI - q * q;
  if (Math.abs(d) < 1e-6) return phi1(q + 1e-3);
  return ((Math.PI ** 4 / 4) * 2 * (1 + Math.cos(q))) / (d * d);
};

export const Zero: React.FC = () => {
  const {t, cue} = useScene();
  const narrow = ramp(t, cue(8) + 0.3, cue(8) + 2.5, EASE_IN_OUT);
  const rel = mix(1, 0.5, narrow); // L / L awal
  const half = 300 * rel;
  const x0 = BOX.cx - half;
  const x1 = BOX.cx + half;
  const eLevel = BOX.bottom - 95 / (rel * rel);
  const box = ramp(t, -0.2, 0.8);
  const lvl = ramp(t, cue(0) + 0.6, cue(0) + 1.4);
  const jit = ramp(t, cue(1), cue(1) + 0.8);
  const speed = 1 / rel;
  const ex = BOX.cx + (half - 26) * (0.6 * Math.sin(t * 3.1 * speed) + 0.4 * Math.sin(t * 5.3 * speed + 1));
  const ey = eLevel - 10 * Math.sin(t * 7 * speed);
  const dx = win(t, cue(3), 9999, 0.6, 0.4);
  const mom = ramp(t, cue(4), cue(4) + 1.2, EASE_IN_OUT);
  const avg = ramp(t, cue(5), cue(5) + 0.6);
  const sq = ramp(t, cue(6), cue(6) + 0.8);
  const sx = MP.half / Q; // px per satuan q (L awal)
  const px = (q: number) => MP.cx + q * sx; // q dalam satuan L awal
  // distribusi momentum untuk L sekarang: lebar ∝ 1/rel, tinggi ∝ rel (luas tetap)
  const momPath = plotPath((q) => rel * phi1(q * rel), -Q, Q, {x: MP.cx - MP.half, y: MP.y, w: 2 * MP.half, sy: MP.h}, 300);
  const momArea = areaPath((q) => rel * phi1(q * rel), -Q, Q, {x: MP.cx - MP.half, y: MP.y, w: 2 * MP.half, sy: MP.h}, 300);
  const ar = (q: number) => q * sx;

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={box}>
          {[x0, x1].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={BOX.top} x2={x} y2={BOX.bottom} stroke={C.ink} strokeWidth={10} opacity={0.15} filter="url(#glow-strong)" />
              <line x1={x} y1={BOX.top} x2={x} y2={BOX.bottom} stroke={C.ink} strokeWidth={5} />
            </g>
          ))}
          <line x1={x0} y1={BOX.bottom} x2={x1} y2={BOX.bottom} stroke={C.muted} strokeWidth={2} />
          <Label x={x0 - 20} y={BOX.bottom} size={24} color={C.muted} anchor="end" font="mono">
            E = 0
          </Label>
        </g>
        <g opacity={lvl}>
          <line x1={x0} y1={eLevel} x2={x1} y2={eLevel} stroke={C.gold} strokeWidth={5} />
          <path d={areaPath((u) => psi(1, u) ** 2, 0, 1, {x: x0, y: eLevel, w: 2 * half, sy: 40})} fill={C.gold} opacity={0.18} />
          <line x1={x1 + 40} y1={BOX.bottom - 4} x2={x1 + 40} y2={eLevel + 6} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" />
          <Label x={x1 + 60} y={(BOX.bottom + eLevel) / 2} size={28} color={C.gold} anchor="start" weight={700}>
            E₁ &gt; 0
          </Label>
        </g>
        <Electron x={ex} y={ey} r={13} opacity={jit} />
        {/* Δx */}
        <g opacity={dx}>
          <line x1={BOX.cx - 0.1807 * 2 * half} y1={BOX.bottom + 40} x2={BOX.cx + 0.1807 * 2 * half} y2={BOX.bottom + 40} stroke={C.cyan} strokeWidth={4} markerEnd="url(#arrow-cyan)" markerStart="url(#arrow-cyan)" />
          <Label x={BOX.cx} y={BOX.bottom + 76} size={28} color={C.cyan} weight={600}>
            Δx ≈ 0,18 L
          </Label>
        </g>
        {/* distribusi momentum */}
        <g opacity={mom}>
          <line x1={MP.cx - MP.half - 20} y1={MP.y} x2={MP.cx + MP.half + 30} y2={MP.y} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={MP.cx + MP.half + 50} y={MP.y} size={30} color={C.muted} font="serif" italic>
            p
          </Label>
          <path d={momArea} fill={C.violet} opacity={0.3} />
          <path d={momPath} fill="none" stroke={C.violet} strokeWidth={5} />
          <Label x={MP.cx} y={MP.y - MP.h - 50} size={26} color={C.violet} weight={600}>
            sebaran momentum |φ(p)|²
          </Label>
          <g opacity={avg}>
            <line x1={MP.cx} y1={MP.y + 10} x2={MP.cx} y2={MP.y - MP.h - 15} stroke={C.ink} strokeWidth={2} strokeDasharray="6 6" />
            <Label x={MP.cx} y={MP.y + 34} size={28} color={C.ink} font="serif" italic>
              ⟨p⟩ = 0
            </Label>
            <Label x={MP.cx - 260} y={MP.y - 60} size={26} color={C.muted} opacity={1 - narrow}>
              ← ke kiri
            </Label>
            <Label x={MP.cx + 260} y={MP.y - 60} size={26} color={C.muted} opacity={1 - narrow}>
              ke kanan →
            </Label>
          </g>
          <g opacity={sq}>
            <line x1={px(0)} y1={MP.y - MP.h * 0.42} x2={px(ar(-Math.PI) / sx / rel)} y2={MP.y - MP.h * 0.42} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" />
            <line x1={px(0)} y1={MP.y - MP.h * 0.42} x2={px(ar(Math.PI) / sx / rel)} y2={MP.y - MP.h * 0.42} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" />
            <Label x={MP.cx} y={MP.y - MP.h * 0.42 - 26} size={30} color={C.gold} weight={700} font="serif" italic>
              ⟨p²⟩ ≠ 0
            </Label>
          </g>
        </g>
      </Stage>
      <Formula x={1420} y={290} p={win(t, cue(0) + 0.3, cue(2) - 0.1, 0.7, 0.4) * ramp(t, cue(0), cue(0) + 0.8, BACK)} accent={C.gold} caption="energi titik nol">
        <V color={C.gold}>E</V>
        <Sub>1</Sub>&nbsp;=&nbsp;
        <Frac n={<><V>h</V><Sup>2</Sup></>} d={<>8<V>mL</V><Sup>2</Sup></>} />
        &nbsp;&gt;&nbsp;0
      </Formula>
      <Formula x={1420} y={290} p={win(t, cue(2), cue(6) - 0.1, 0.7, 0.4)} accent={C.cyan} caption="prinsip ketidakpastian Heisenberg">
        Δ<V>x</V>&thinsp;·&thinsp;Δ<V>p</V>&nbsp;≥&nbsp;
        <Frac n={<V>ħ</V>} d="2" />
      </Formula>
      <Formula x={1420} y={290} p={win(t, cue(6), cue(7) - 0.1, 0.7, 0.4)} accent={C.violet} caption="energi kinetik dari rata-rata kuadrat momentum">
        ⟨<V>T</V>⟩&nbsp;=&nbsp;
        <Frac n={<>⟨<V>p</V><Sup>2</Sup>⟩</>} d={<>2<V>m</V></>} />
        &nbsp;=&nbsp;
        <Frac n={<><V>π</V><Sup>2</Sup><V>ħ</V><Sup>2</Sup></>} d={<>2<V>mL</V><Sup>2</Sup></>} />
      </Formula>
      <Formula x={1420} y={290} p={ramp(t, cue(7), cue(7) + 0.7)} accent={C.gold} caption="keadaan dasar: sedikit di atas batas minimum">
        Δ<V>x</V>&thinsp;·&thinsp;Δ<V>p</V>&nbsp;≈&nbsp;0,568&thinsp;<V>ħ</V>&nbsp;≥&nbsp;0,5&thinsp;<V>ħ</V>
      </Formula>
    </AbsoluteFill>
  );
};
