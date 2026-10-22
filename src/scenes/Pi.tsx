import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {Chain, chainPts} from '../components/molecule';
import {ncol} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const MY = 330;
const DX = 150;
const BUT = {n: 4, bonds: [2, 1, 2]};
const HEX = {n: 6, bonds: [2, 1, 2, 1, 2]};
const SEP = {n: 6, bonds: [1, 2, 1, 1, 2], sp3: [0, 3]};
// tingkat energi (skala ∝ n²)
const LV = {x0: 260, x1: 640, bot: 845, unit: 20};
const SP = {x0: 1000, x1: 1780, y: 810, l0: 150, l1: 450};
const sx = (nm: number) => mix(SP.x0, SP.x1, (nm - SP.l0) / (SP.l1 - SP.l0));

const Arrows: React.FC<{x: number; y: number; n: number}> = ({x, y, n}) => (
  <g>
    {Array.from({length: n}, (_, k) => (
      <text key={k} x={x + k * 32} y={y - 4} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.cyan} dominantBaseline="central">
        {k % 2 ? '↓' : '↑'}
      </text>
    ))}
  </g>
);

export const Pi: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const mol = ramp(t, cue(0) - 0.2, cue(0) + 1);
  const hex = ramp(t, cue(7) - 0.2, cue(7) + 0.8, EASE_IN_OUT) * (1 - ramp(t, cue(9) - 0.3, cue(9) + 0.4));
  const sep = ramp(t, cue(9) - 0.1, cue(9) + 0.8);
  const butO = mol * (1 - ramp(t, cue(7) - 0.2, cue(7) + 0.5));
  const lobes = win(t, cue(1), cue(2) + 1, 0.8, 0.8);
  const band = ramp(t, cue(1) + 1.5, cue(1) + 2.5) * (1 - sep);
  const box = ramp(t, cue(2), cue(2) + 1) * (1 - sep);
  const levels = ramp(t, cue(3) - 0.2, cue(3) + 0.6) * (1 - sep);
  const fill = ramp(t, cue(3) + 1.2, cue(3) + 2.2);
  const homo = ramp(t, cue(4), cue(4) + 0.6);
  const spec = ramp(t, cue(6), cue(6) + 0.7) * (1 - sep);
  const meas = ramp(t, wordOf(6, 'tujuh') - 0.3, wordOf(6, 'tujuh') + 0.3);
  const trend = win(t, cue(8), cue(9) - 0.1, 0.7, 0.5);
  const N = hex > 0.5 ? 6 : 4;
  const nC = N;
  const P = chainPts(nC, 960, MY, DX);
  const halfW = ((nC - 1) * DX) / 2 + DX / 2;
  const boxW = mix(((4 - 1) * DX) / 2 + DX / 2, ((6 - 1) * DX) / 2 + DX / 2, hex);
  const Lnm = mix(0.578, 0.867, hex);
  const yL = (n: number) => LV.bot - n * n * LV.unit;
  const q = N / 2;
  void halfW;

  return (
    <AbsoluteFill>
      <Stage>
        {/* molekul */}
        <Chain n={4} cx={960} cy={MY} bonds={BUT.bonds} opacity={butO} dx={DX} r={34} />
        <Chain n={6} cx={960} cy={MY} bonds={HEX.bonds} opacity={hex} dx={DX} r={34} />
        <Chain n={6} cx={960} cy={MY} bonds={SEP.bonds} sp3={SEP.sp3} opacity={sep} dx={DX} r={34} />
        <Label x={960} y={200} size={30} color={C.ink} weight={600} opacity={butO}>
          butadiena · CH₂=CH–CH=CH₂ · 4 elektron π
        </Label>
        <Label x={960} y={200} size={30} color={C.ink} weight={600} opacity={hex}>
          heksatriena · 6 elektron π
        </Label>
        <Label x={960} y={200} size={30} color={C.ink} weight={600} opacity={sep}>
          CH₃–CH=CH–CH₂–CH=CH₂
        </Label>
        {/* orbital p */}
        <g opacity={lobes * butO}>
          {chainPts(4, 960, MY, DX).map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y - 80} rx={30} ry={52} fill={C.gold} opacity={0.45} />
              <ellipse cx={x} cy={y + 80} rx={30} ry={52} fill={C.cyan} opacity={0.45} />
            </g>
          ))}
        </g>
        {/* jalur π */}
        <g opacity={band}>
          <rect x={960 - boxW} y={MY - 70} width={2 * boxW} height={140} rx={70} fill={C.violet} opacity={0.12} />
          {Array.from({length: N}, (_, k) => {
            const u = 0.5 + 0.45 * Math.sin(t * (1.3 + k * 0.17) + k * 1.7);
            return <circle key={k} cx={960 - boxW + 20 + u * (2 * boxW - 40)} cy={MY + (k % 2 ? -50 : 50)} r={9} fill={C.cyan} filter="url(#glow)" />;
          })}
        </g>
        {/* kotak efektif */}
        <g opacity={box}>
          {[960 - boxW, 960 + boxW].map((x) => (
            <line key={x} x1={x} y1={MY - 90} x2={x} y2={MY + 110} stroke={C.ink} strokeWidth={5} />
          ))}
          <line x1={960 - boxW} y1={MY + 130} x2={960 + boxW} y2={MY + 130} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
          <Label x={960} y={MY + 160} size={28} color={C.gold} weight={700} font="mono">
            {`L ≈ ${Lnm.toFixed(3).replace('.', ',')} nm`}
          </Label>
          <line x1={P[0][0]} y1={MY + 100} x2={960 - boxW} y2={MY + 100} stroke={C.muted} strokeWidth={2} opacity={0.8} />
          <Label x={960 - boxW - 20} y={MY + 100} size={20} color={C.muted} anchor="end">
            + ½ ikatan
          </Label>
        </g>
        {/* tingkat energi */}
        <g opacity={levels}>
          {[1, 2, 3, 4].map((n) => (
            <g key={n}>
              <line x1={LV.x0} y1={yL(n)} x2={LV.x1} y2={yL(n)} stroke={ncol(n)} strokeWidth={4} />
              <Label x={LV.x0 - 20} y={yL(n)} size={24} color={ncol(n)} anchor="end" font="serif" italic>
                n = {n}
              </Label>
              {n <= q ? (
                <g opacity={fill}>
                  <Arrows x={(LV.x0 + LV.x1) / 2 - 16} y={yL(n)} n={2} />
                </g>
              ) : null}
            </g>
          ))}
          <g opacity={homo}>
            <Label x={LV.x1 + 20} y={yL(q)} size={26} color={C.gold} anchor="start" weight={700}>
              HOMO
            </Label>
            <Label x={LV.x1 + 20} y={yL(q + 1)} size={26} color={C.mint} anchor="start" weight={700}>
              LUMO
            </Label>
            <line x1={LV.x1 - 40} y1={yL(q) - 6} x2={LV.x1 - 40} y2={yL(q + 1) + 8} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" />
          </g>
        </g>
        {/* spektrum UV */}
        <g opacity={spec}>
          <rect x={SP.x0} y={SP.y - 22} width={SP.x1 - SP.x0} height={44} rx={8} fill="#2a1d5a" opacity={0.8} />
          <rect x={sx(380)} y={SP.y - 22} width={SP.x1 - sx(380)} height={44} fill="url(#rainbow-h)" opacity={0.7} />
          {[200, 300, 400].map((nm) => (
            <Label key={nm} x={sx(nm)} y={SP.y + 44} size={20} color={C.muted} font="mono">
              {nm}
            </Label>
          ))}
          <Label x={(SP.x0 + sx(380)) / 2} y={SP.y + 44} size={20} color={C.violet}>
            ultraviolet
          </Label>
          <g opacity={1 - hex}>
            <line x1={sx(220.3)} y1={SP.y - 36} x2={sx(220.3)} y2={SP.y + 22} stroke={C.gold} strokeWidth={5} />
            <Label x={sx(220.3) + 12} y={SP.y - 50} size={24} color={C.gold} anchor="start" weight={700} font="mono">
              model 220 nm
            </Label>
            <g opacity={meas}>
              <line x1={sx(217)} y1={SP.y - 22} x2={sx(217)} y2={SP.y + 30} stroke={C.mint} strokeWidth={3} strokeDasharray="4 4" />
              <Label x={sx(217) - 12} y={SP.y - 50} size={24} color={C.mint} anchor="end" font="mono">
                ukur ≈ 217
              </Label>
            </g>
          </g>
          <g opacity={hex}>
            <line x1={sx(354.1)} y1={SP.y - 36} x2={sx(354.1)} y2={SP.y + 22} stroke={C.gold} strokeWidth={5} />
            <Label x={sx(354.1)} y={SP.y - 50} size={24} color={C.gold} weight={700} font="mono">
              model 354 nm
            </Label>
          </g>
        </g>
        {/* tren */}
        <g opacity={trend}>
          <rect x={1060} y={500} width={720} height={240} rx={16} fill="rgba(10,14,30,0.8)" stroke={C.faint} strokeWidth={2} />
          {[
            [2, 91.8, 'etena'],
            [4, 220.3, 'butadiena'],
            [6, 354.1, 'heksatriena'],
          ].map(([n, nm, name], i) => {
            const x = 1180 + i * 240;
            const h = (Number(nm) / 400) * 160;
            return (
              <g key={i}>
                <rect x={x - 40} y={715 - h} width={80} height={h} rx={6} fill={C.gold} opacity={0.75} />
                <Label x={x} y={715 - h - 20} size={22} color={C.gold} font="mono" weight={700}>
                  {`${String(nm).replace('.', ',')} nm`}
                </Label>
                <Label x={x} y={731} size={20} color={C.muted}>
                  {`${name} (N = ${n})`}
                </Label>
              </g>
            );
          })}
        </g>
        {/* dua kotak kecil */}
        <g opacity={sep}>
          {[
            [1, 2],
            [4, 5],
          ].map(([a, b], i) => {
            const pts = chainPts(6, 960, MY, DX);
            const x0 = pts[a][0] - DX / 2;
            const x1 = pts[b][0] + DX / 2;
            return (
              <g key={i}>
                <rect x={x0} y={MY - 90} width={x1 - x0} height={200} rx={10} fill={C.mint} opacity={0.08} stroke={C.mint} strokeWidth={3} />
                <Label x={(x0 + x1) / 2} y={MY + 140} size={24} color={C.mint} weight={600}>
                  kotak kecil
                </Label>
              </g>
            );
          })}
          <Label x={chainPts(6, 960, MY, DX)[3][0]} y={MY + 200} size={26} color={C.red} weight={700}>
            C jenuh (sp³) memutus jalur
          </Label>
        </g>
      </Stage>
      <Formula x={1390} y={600} p={win(t, cue(5), cue(8) - 0.1, 0.7, 0.4) * ramp(t, cue(5), cue(5) + 0.7, BACK)} accent={C.gold} caption="celah HOMO–LUMO untuk N elektron π">
        Δ<V color={C.gold}>E</V>&nbsp;=&nbsp;
        <Frac n={<>(<V>N</V> + 1)&thinsp;<V>h</V><Sup>2</Sup></>} d={<>8<V>m</V><Sub>e</Sub><V>L</V><Sup>2</Sup></>} />
      </Formula>
    </AbsoluteFill>
  );
};
