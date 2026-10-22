import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {E1_EV, Electron, Heatmap2D, id} from '../components/viz';
import {Mesh3D} from '../components/Surface3D';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Kiri: kotak datar (peta panas |ψ|²). Kanan: diagram tingkat energi (satuan E₀ = h²/8mL²).
const BIG = {x: 200, y: 280, s: 560};
const GRID = [
  {nx: 1, ny: 1, col: 0, row: 0},
  {nx: 2, ny: 1, col: 1, row: 0},
  {nx: 1, ny: 2, col: 0, row: 1},
  {nx: 2, ny: 2, col: 1, row: 1},
];
const ED = {x0: 1130, x1: 1520, bot: 840, unit: 46}; // y = bot − (E − 1)·unit

export const Box2D: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const box = ramp(t, cue(0), cue(0) + 0.8);
  const ball = win(t, cue(0) + 0.4, cue(1) + 0.6, 0.6, 0.6);
  const big = win(t, cue(1) + 0.3, cue(3) - 0.2, 0.8, 0.5);
  const m11 = win(t, cue(1) + 0.3, cue(2) + 0.2, 0.8, 0.6);
  const m21 = win(t, cue(2), cue(3) - 0.2, 0.8, 0.5);
  const drum = Math.cos(t * 2.6);
  const grid = ramp(t, cue(3), cue(3) + 0.9);
  const nodes = ramp(t, cue(3) + 1.2, cue(3) + 2);
  const diag = ramp(t, cue(4) - 0.2, cue(4) + 0.8);
  const deg = ramp(t, wordOf(4, 'sama') - 0.3, wordOf(4, 'sama') + 0.4);
  const stretch = ramp(t, wordOf(6, 'Regangkan') - 0.2, wordOf(6, 'Regangkan') + 2.4, EASE_IN_OUT);
  const ev = ramp(t, cue(7) + 0.3, cue(7) + 1);
  const r = mix(1, 2, stretch); // Ly/Lx
  const en = (nx: number, ny: number) => nx * nx + (ny * ny) / (r * r);
  const yE = (e: number) => ED.bot - (e - 1) * ED.unit;
  const cell = 240;
  const gx = (col: number) => 190 + col * (cell + 60);
  const gy = (row: number) => 300 + row * (cell + 60);
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const pairHl = win(t, cue(4), cue(6) - 0.2, 0.5, 0.5);
  const bx = BIG.x + BIG.s / 2 + (BIG.s / 2 - 30) * Math.sin(t * 1.9);
  const by = BIG.y + BIG.s / 2 + (BIG.s / 2 - 30) * Math.sin(t * 1.3 + 1);

  const LEVELS: {e0: number; states: [number, number][]}[] = [
    {e0: 2, states: [[1, 1]]},
    {e0: 5, states: [[1, 2], [2, 1]]},
    {e0: 8, states: [[2, 2]]},
    {e0: 10, states: [[1, 3], [3, 1]]},
  ];

  return (
    <AbsoluteFill>
      <Stage>
        {/* kotak besar */}
        <g opacity={box * (1 - grid) * (1 - big)}>
          <Label x={BIG.x + BIG.s / 2} y={BIG.y + BIG.s + 36} size={30} color={C.gold} font="serif" italic>
            L<tspan baselineShift="sub" fontSize={20}>x</tspan>
          </Label>
          <Label x={BIG.x - 40} y={BIG.y + BIG.s / 2} size={30} color={C.gold} font="serif" italic>
            L<tspan baselineShift="sub" fontSize={20}>y</tspan>
          </Label>
          <g opacity={1 - big}>
            <rect x={BIG.x} y={BIG.y} width={BIG.s} height={BIG.s} fill="none" stroke={C.ink} strokeWidth={5} />
          </g>
          <Electron x={bx} y={by} r={13} opacity={ball} />
          <g opacity={ball}>
            <line x1={bx} y1={by} x2={bx + 90 * Math.cos(t * 1.9)} y2={by} stroke={C.cyan} strokeWidth={3} markerEnd="url(#arrow-cyan)" />
            <line x1={bx} y1={by} x2={bx} y2={by - 90 * Math.cos(t * 1.3 + 1)} stroke={C.mint} strokeWidth={3} markerEnd="url(#arrow-mint)" />
          </g>
        </g>
        {/* membran 3D: ψ(x, y) bergetar seperti kulit gendang */}
        {[
          {key: 'm11', nx: 1, ny: 1, o: m11 * (1 - grid)},
          {key: 'm21', nx: 2, ny: 1, o: m21 * (1 - grid)},
        ].map((m) => (
          <g key={m.key} opacity={m.o}>
            <Mesh3D
              f={(u, v) => drum * Math.sin((m.nx * Math.PI * (u + 1)) / 2) * Math.sin((m.ny * Math.PI * (v + 1)) / 2)}
              n={32}
              cx={480}
              cy={620}
              size={290}
              amp={240}
              yaw={0.62 + 0.12 * Math.sin(t * 0.4)}
              pitch={0.52}
            />
            <Heatmap2D x={1180} y={440} w={300} h={300} nx={m.nx} ny={m.ny} />
            <Label x={1330} y={775} size={24} color={C.muted}>
              |ψ|² dilihat dari atas
            </Label>
            <Label x={480} y={300} size={32} color={C.gold} font="serif" italic>
              (n<tspan baselineShift="sub" fontSize={22}>x</tspan>, n<tspan baselineShift="sub" fontSize={22}>y</tspan>) = ({m.nx}, {m.ny})
            </Label>
          </g>
        ))}
        {/* kisi empat keadaan */}
        <g opacity={grid}>
          {GRID.map((g, i) => {
            const isPair = (g.nx === 1 && g.ny === 2) || (g.nx === 2 && g.ny === 1);
            const w = mix(cell, 200, stretch);
            const h = w * r;
            const pcol = g.nx === 1 ? 0 : 1;
            const x = mix(gx(g.col), isPair ? 230 + pcol * 300 : gx(g.col), stretch);
            const y = mix(gy(g.row), isPair ? 250 : gy(g.row), stretch);
            const fade = isPair ? 1 : 1 - stretch;
            return (
              <g key={i} opacity={ramp(t, cue(3) + i * 0.25, cue(3) + 0.6 + i * 0.25) * fade}>
                <Heatmap2D x={x} y={y} w={w} h={h} nx={g.nx} ny={g.ny} cells={26} nodes={nodes} label={`(${g.nx}, ${g.ny})`} />
                {isPair ? <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} rx={8} fill="none" stroke={C.gold} strokeWidth={4} opacity={pairHl * (0.5 + 0.5 * pulse)} /> : null}
              </g>
            );
          })}
          <Label x={gx(1) + cell + 40} y={gy(0) + cell / 2} size={22} color={C.cyan} anchor="start" opacity={nodes * (1 - stretch)}>
            - - simpul
          </Label>
        </g>
        {/* diagram energi */}
        <g opacity={diag}>
          <line x1={ED.x0 - 40} y1={ED.bot + 20} x2={ED.x0 - 40} y2={yE(10.6)} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={ED.x0 - 40} y={yE(10.6) - 24} size={26} color={C.muted} font="serif" italic>
            E
          </Label>
          {LEVELS.flatMap((L, li) =>
            L.states.map(([a, b], k) => {
              const e = en(a, b);
              const y = yE(e);
              const nS = L.states.length;
              const x0 = nS === 1 ? ED.x0 : mix(ED.x0, ED.x0 + (k ? 200 : 0), 1);
              const x1 = nS === 1 ? ED.x1 : x0 + 190;
              const hl = li === 1 ? deg : 0;
              return (
                <g key={`${li}-${k}`} opacity={li === 1 ? 1 : 1 - 0.75 * stretch}>
                  <line x1={x0} y1={y} x2={x1} y2={y} stroke={li === 1 ? C.gold : C.ink} strokeWidth={li === 1 ? 5 : 3} opacity={0.6 + 0.4 * hl} />
                  <Label x={(x0 + x1) / 2} y={y - 22} size={22} color={li === 1 ? C.gold : C.muted} font="mono" opacity={li === 1 ? 1 : 1 - stretch}>
                    {`(${a},${b})`}
                  </Label>
                </g>
              );
            }),
          )}
          {LEVELS.map((L) => (
            <Label key={L.e0} x={ED.x1 + 30} y={yE(L.e0)} size={24} color={C.ink} anchor="start" font="mono" opacity={1 - stretch}>
              {`${L.e0}E₀`}
            </Label>
          ))}
          <Label x={ED.x1 + 30} y={yE(5) + 34} size={24} color={C.gold} anchor="start" weight={700} opacity={deg * (1 - stretch)}>
            g = 2
          </Label>
          <g opacity={ev}>
            <Label x={ED.x1 + 30} y={yE(en(1, 2))} size={24} color={C.gold} anchor="start" font="mono" weight={700}>
              {`${id(E1_EV * 2, 2)} eV`}
            </Label>
            <Label x={ED.x1 + 30} y={yE(en(2, 1))} size={24} color={C.gold} anchor="start" font="mono" weight={700}>
              {`${id(E1_EV * 4.25, 2)} eV`}
            </Label>
          </g>
        </g>
      </Stage>
      <Formula x={1440} y={300} p={win(t, cue(1), cue(2) - 0.1, 0.7, 0.4) * ramp(t, cue(1), cue(1) + 0.7, BACK)} accent={C.cyan} caption="pemisahan variabel: ψ = X(x) · Y(y)">
        <V>ψ</V>&nbsp;=&nbsp;
        <Frac n="2" d={<>√<V>L</V><Sub>x</Sub><V>L</V><Sub>y</Sub></>} />
        &thinsp;sin&thinsp;
        <Frac n={<><V>n</V><Sub>x</Sub><V>πx</V></>} d={<><V>L</V><Sub>x</Sub></>} />
        &thinsp;sin&thinsp;
        <Frac n={<><V>n</V><Sub>y</Sub><V>πy</V></>} d={<><V>L</V><Sub>y</Sub></>} />
      </Formula>
      <Formula x={1440} y={300} p={win(t, cue(2), cue(4) - 0.3, 0.7, 0.4)} accent={C.gold} caption={<>dua bilangan kuantum: <V>n</V><Sub>x</Sub>, <V>n</V><Sub>y</Sub> = 1, 2, 3, …</>}>
        <V color={C.gold}>E</V>&nbsp;=&nbsp;
        <Frac n={<><V>h</V><Sup>2</Sup></>} d={<>8<V>m</V></>} />
        (
        <Frac n={<><V>n</V><Sub>x</Sub><Sup>2</Sup></>} d={<><V>L</V><Sub>x</Sub><Sup>2</Sup></>} />
        +
        <Frac n={<><V>n</V><Sub>y</Sub><Sup>2</Sup></>} d={<><V>L</V><Sub>y</Sub><Sup>2</Sup></>} />)
      </Formula>
      <Formula x={1440} y={300} p={win(t, cue(4) - 0.2, cue(6) - 0.1, 0.7, 0.4)} accent={C.gold} caption={<>persegi: <V>E</V> = <V>E</V><Sub>0</Sub>(<V>n</V><Sub>x</Sub><Sup>2</Sup> + <V>n</V><Sub>y</Sub><Sup>2</Sup>)</>}>
        <V>E</V>
        <Sub>12</Sub>&nbsp;=&nbsp;<V>E</V>
        <Sub>21</Sub>&nbsp;=&nbsp;5<V>E</V>
        <Sub>0</Sub>
      </Formula>
      <Formula x={1440} y={300} p={ramp(t, cue(6), cue(6) + 0.7)} accent={C.mint} caption={<>persegi panjang <V>L</V><Sub>x</Sub> = 1 nm, <V>L</V><Sub>y</Sub> = 2 nm</>}>
        <V>E</V>
        <Sub>12</Sub>&nbsp;≠&nbsp;<V>E</V>
        <Sub>21</Sub>
      </Formula>
    </AbsoluteFill>
  );
};
