import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, rand, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {BoxCube} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const CUBE = {cx: 540, cy: 545, size: 195};
const LV = [
  {e: 3, g: 1, s: '(1,1,1)'},
  {e: 6, g: 3, s: '(1,1,2)'},
  {e: 9, g: 3, s: '(1,2,2)'},
  {e: 11, g: 3, s: '(1,1,3)'},
  {e: 12, g: 1, s: '(2,2,2)'},
  {e: 14, g: 6, s: '(1,2,3)'},
];
const D = {x0: 1100, x1: 1400, bot: 830, unit: 40};
const yE = (e: number) => (e > 20 ? 290 : D.bot - (e - 3) * D.unit);

export const Box3D: React.FC = () => {
  const {t, cue} = useScene();
  const cube = ramp(t, cue(0), cue(0) + 1, BACK);
  const yaw = 0.6 + t * 0.25;
  const metal = ramp(t, cue(7), cue(7) + 1.5, EASE_IN_OUT);
  // keadaan yang ditampilkan di kubus
  let n: [number, number, number] | null = null;
  let tag = '';
  if (t >= cue(2) && t < cue(3)) [n, tag] = [[1, 1, 1], '(1,1,1)'];
  else if (t >= cue(3) && t < cue(4)) {
    const k = Math.floor((t - cue(3)) / 1.6) % 3;
    n = [[1, 1, 2], [1, 2, 1], [2, 1, 1]][k] as [number, number, number];
    tag = ['(1,1,2)', '(1,2,1)', '(2,1,1)'][k];
  } else if (t >= cue(4) && t < cue(5)) [n, tag] = [[1, 2, 3], '(1,2,3)'];
  else if (t >= cue(5) && t < cue(7)) {
    const k = Math.floor((t - cue(5)) / 2) % 2;
    n = k ? [3, 3, 3] : [1, 1, 5];
    tag = k ? '(3,3,3)' : '(1,1,5)';
  }
  const cloudIn = (a: number) => ramp(t, a, a + 0.5);
  const cloud = n ? Math.min(1, cloudIn(cue(2)) + (t > cue(3) ? 1 : 0)) : 0;
  const diag = ramp(t, cue(2) - 0.2, cue(2) + 0.8);
  const lvP = (i: number) => (i === 0 ? ramp(t, cue(2), cue(2) + 0.6) : i === 1 ? ramp(t, cue(3), cue(3) + 0.6) : i < 5 ? ramp(t, cue(4) - 0.3 + (i - 2) * 0.3, cue(4) + 0.3 + (i - 2) * 0.3) : ramp(t, cue(4) + 1.5, cue(4) + 2.1));
  const hl = (i: number) => (i === 1 ? win(t, cue(3), cue(4), 0.4, 0.4) : i === 3 ? win(t, cue(4), cue(4) + 2.5, 0.3, 0.4) : i === 5 ? win(t, cue(4) + 1.5, cue(5), 0.4, 0.4) : 0);
  const acc = ramp(t, cue(5), cue(5) + 0.8);
  const ev = ramp(t, cue(6), cue(6) + 0.8);

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={cube * (1 - metal)}>
          <BoxCube cx={CUBE.cx} cy={CUBE.cy} size={CUBE.size} yaw={yaw} n={n} cloud={cloud} />
          <Label x={CUBE.cx} y={CUBE.cy - 310} size={30} color={C.gold} font="mono" weight={600} opacity={n ? 1 : 0}>
            {tag}
          </Label>
          <Label x={CUBE.cx} y={CUBE.cy + 300} size={26} color={C.muted} opacity={ev}>
            kubus bersisi 1 nm
          </Label>
        </g>
        {/* logam: lautan elektron */}
        <g opacity={metal}>
          <rect x={200} y={330} width={680} height={460} rx={16} fill="#5d6a86" opacity={0.25} stroke="#aab6d6" strokeWidth={4} />
          {Array.from({length: 90}, (_, i) => (
            <circle key={i} cx={220 + ((rand(i) * 640 + t * 60 * (rand(i * 3) - 0.5)) % 640 + 640) % 640} cy={350 + rand(i * 7) * 420 + 8 * Math.sin(t * 3 + i)} r={6} fill={C.cyan} opacity={0.75} />
          ))}
          <Label x={540} y={290} size={30} color={C.ink} weight={600}>
            sepotong logam: gas elektron bebas
          </Label>
        </g>
        {/* diagram tingkat */}
        <g opacity={diag}>
          <line x1={D.x0 - 50} y1={D.bot + 20} x2={D.x0 - 50} y2={255} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={D.x0 - 50} y={232} size={26} color={C.muted} font="serif" italic>
            E
          </Label>
          {LV.map((l, i) => (
            <g key={l.e} opacity={lvP(i) * (1 - metal)}>
              <line x1={D.x0} y1={yE(l.e)} x2={D.x1} y2={yE(l.e)} stroke={hl(i) > 0.05 ? C.gold : C.ink} strokeWidth={3 + 2 * hl(i)} />
              <Label x={D.x0 - 14} y={yE(l.e)} size={22} color={C.ink} anchor="end" font="mono">
                {`${l.e}E₀`}
              </Label>
              <Label x={D.x0 + 8} y={yE(l.e) - 16} size={18} color={C.muted} anchor="start" font="mono">
                {l.s}
              </Label>
              {Array.from({length: l.g}, (_, k) => (
                <rect key={k} x={D.x1 + 24 + k * 28} y={yE(l.e) - 10} width={20} height={20} rx={4} fill={C.gold} opacity={0.85} />
              ))}
              <Label x={D.x1 + 40 + l.g * 28} y={yE(l.e)} size={22} color={C.gold} anchor="start" font="mono">
                {`g = ${l.g}`}
              </Label>
            </g>
          ))}
          <g opacity={acc * (1 - metal)}>
            <Label x={(D.x0 + D.x1) / 2} y={(yE(14) + yE(27)) / 2} size={34} color={C.muted}>
              ⋮
            </Label>
            <line x1={D.x0} y1={yE(27)} x2={D.x1} y2={yE(27)} stroke={C.violet} strokeWidth={5} />
            <Label x={D.x0 - 14} y={yE(27)} size={22} color={C.ink} anchor="end" font="mono">
              27E₀
            </Label>
            {Array.from({length: 4}, (_, k) => (
              <rect key={k} x={D.x1 + 24 + k * 28} y={yE(27) - 10} width={20} height={20} rx={4} fill={k < 3 ? C.violet : C.pink} />
            ))}
            <Label x={D.x1 + 152} y={yE(27)} size={22} color={C.violet} anchor="start" font="mono">
              g = 4
            </Label>
            <Label x={(D.x0 + D.x1) / 2} y={yE(27) - 22} size={18} color={C.muted} font="mono">
              3 × (1,1,5) + (3,3,3)
            </Label>
          </g>
          <g opacity={ev * (1 - metal)}>
            <Label x={D.x0 - 100} y={yE(3)} size={22} color={C.gold} anchor="end" font="mono" weight={700}>
              1,13 eV
            </Label>
            <Label x={D.x0 - 100} y={yE(6)} size={22} color={C.gold} anchor="end" font="mono" weight={700}>
              2,26 eV
            </Label>
          </g>
          {/* pita rapat untuk logam */}
          <g opacity={metal}>
            {Array.from({length: 60}, (_, k) => (
              <line key={k} x1={D.x0} y1={D.bot - k * 8.5} x2={D.x1} y2={D.bot - k * 8.5} stroke={C.cyan} strokeWidth={1.5} opacity={k < 38 ? 0.8 : 0.25} />
            ))}
            <Label x={D.x1 + 30} y={D.bot - 38 * 8.5} size={24} color={C.cyan} anchor="start" weight={600}>
              tingkat terisi teratas
            </Label>
          </g>
        </g>
      </Stage>
      <Formula x={1400} y={260} p={win(t, cue(1) - 0.2, cue(2) - 0.1, 0.7, 0.4) * ramp(t, cue(1) - 0.2, cue(1) + 0.6, BACK)} accent={C.gold} caption={<>kubus: <V>E</V> = <V>E</V><Sub>0</Sub>(<V>n</V><Sub>x</Sub><Sup>2</Sup> + <V>n</V><Sub>y</Sub><Sup>2</Sup> + <V>n</V><Sub>z</Sub><Sup>2</Sup>)</>}>
        <V color={C.gold}>E</V>&nbsp;=&nbsp;
        <Frac n={<><V>h</V><Sup>2</Sup></>} d={<>8<V>m</V></>} />
        (
        <Frac n={<><V>n</V><Sub>x</Sub><Sup>2</Sup></>} d={<><V>L</V><Sub>x</Sub><Sup>2</Sup></>} />
        +
        <Frac n={<><V>n</V><Sub>y</Sub><Sup>2</Sup></>} d={<><V>L</V><Sub>y</Sub><Sup>2</Sup></>} />
        +
        <Frac n={<><V>n</V><Sub>z</Sub><Sup>2</Sup></>} d={<><V>L</V><Sub>z</Sub><Sup>2</Sup></>} />)
      </Formula>
    </AbsoluteFill>
  );
};
