import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {DrawPath, Formula, Frac, Label, Part, Stage, Sup, V} from '../components/primitives';
import {Electron, plotPath} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const AX = {x0: 120, x1: 1800, y: 390};
const LAM = 240;
const PL = {x: 220, y: 840, w: 600, sy: 290};

const wavePath = (f: (x: number) => number, y0 = AX.y) =>
  Array.from({length: 281}, (_, i) => {
    const x = AX.x0 + ((AX.x1 - AX.x0) * i) / 280;
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${(y0 - f(x)).toFixed(1)}`;
  }).join(' ');

export const Free: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const axis = ramp(t, 0, 0.9);
  const lift = ramp(t, cue(2) + 0.5, cue(3) + 0.3, EASE_IN_OUT);
  const ay = mix(560, AX.y, lift);
  const ePart = ramp(t, 0.2, 0.8) * (1 - ramp(t, cue(3) - 0.2, cue(3) + 0.5));
  const vLine = ramp(t, cue(1), cue(1) + 0.6);
  const wave = ramp(t, cue(3), cue(3) + 1.2) * (1 - ramp(t, cue(7) - 0.2, cue(7) + 0.6));
  const lam = ramp(t, wordOf(4, 'panjang'), wordOf(4, 'panjang') + 0.6) * (1 - ramp(t, cue(7) - 0.2, cue(7) + 0.3));
  const band = win(t, cue(7) - 0.1, cue(8) - 0.3, 0.8, 0.6);
  const packet = ramp(t, cue(8), cue(8) + 1.4, EASE_IN_OUT);
  const plot = ramp(t, cue(5), cue(5) + 1.4, EASE_IN_OUT);
  const cont = ramp(t, wordOf(6, 'kontinu') - 0.4, wordOf(6, 'kontinu') + 0.6);
  const slide = ramp(t, cue(6), cue(6) + 4, EASE_IN_OUT);
  const kDot = -0.9 + 1.8 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * slide)) + 0.15 * Math.sin(t * 0.8) * cont;
  const ex = AX.x0 + ((t * 260) % (AX.x1 - AX.x0));
  const om = 2.4;
  const kk = (2 * Math.PI) / LAM;

  // paket: jumlah beberapa gelombang
  const comps = [-2, -1, 0, 1, 2].map((j) => ({k: kk * (1 + j * 0.12), a: Math.exp(-(j * j) / 2.2)}));
  const xc = 520 + 140 * Math.max(0, t - cue(8));
  const comp = (c: {k: number; a: number}) => (x: number) => 62 * c.a * Math.cos(c.k * (x - xc) - om * 0.2 * t);
  const sum = (x: number) => comps.reduce((s, c) => s + comp(c)(x), 0) / 2.6;

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={axis}>
          <line x1={AX.x0} y1={ay} x2={AX.x1} y2={ay} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" markerStart="url(#arrow-muted)" />
          <Label x={AX.x0 + 10} y={ay - 105} size={28} color={C.muted} anchor="start">
            −∞
          </Label>
          <Label x={AX.x1 - 10} y={ay - 105} size={28} color={C.muted} anchor="end">
            +∞
          </Label>
          <Label x={AX.x1 - 120} y={ay - 105} size={30} color={C.muted} font="serif" italic>
            x
          </Label>
        </g>
        <g opacity={vLine}>
          <rect x={AX.x0} y={ay + 110} width={AX.x1 - AX.x0} height={4} fill={C.violet} opacity={0.7} />
          <Label x={1400} y={ay + 140} size={28} color={C.violet} weight={600} opacity={1 - ramp(t, cue(2) - 0.4, cue(2))}>
            V(x) = 0 di seluruh ruang
          </Label>
        </g>
        <Electron x={ex} y={ay} r={16} opacity={ePart} />
        <g opacity={ePart}>
          <line x1={ex + 30} y1={ay - 50} x2={ex + 150} y2={ay - 50} stroke={C.gold} strokeWidth={4} markerEnd="url(#arrow-gold)" />
          <Label x={ex + 90} y={ay - 84} size={26} color={C.gold} font="serif" italic>
            p tetap
          </Label>
          <Label x={960} y={ay - 170} size={30} color={C.ink} weight={600}>
            tanpa gaya: F = 0
          </Label>
        </g>
        {/* gelombang bidang */}
        <path d={wavePath((x) => 70 * Math.cos(kk * x - om * t))} fill="none" stroke={C.cyan} strokeWidth={5} opacity={wave} filter="url(#glow)" />
        <g opacity={lam}>
          <line x1={960} y1={ay - 100} x2={960 + LAM} y2={ay - 100} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
          <Label x={960 + LAM / 2} y={ay - 132} size={30} color={C.gold} font="serif" italic>
            λ = h / p
          </Label>
        </g>
        {/* |ψ|² rata */}
        <g opacity={band}>
          <rect x={AX.x0} y={ay - 40} width={AX.x1 - AX.x0} height={80} fill={C.gold} opacity={0.22} />
          <rect x={AX.x0} y={ay - 40} width={AX.x1 - AX.x0} height={3} fill={C.gold} />
          {[300, 640, 980, 1320, 1660].map((x, i) => (
            <Label key={x} x={x} y={ay - 100 + 12 * Math.sin(t * 2 + i)} size={46} color={C.gold} weight={800} opacity={ramp(t, cue(7) + 1 + i * 0.2, cue(7) + 1.5 + i * 0.2)}>
              ?
            </Label>
          ))}
          <Label x={960} y={ay + 70} size={28} color={C.gold} weight={600}>
            |ψ|² sama di mana-mana
          </Label>
        </g>
        {/* paket gelombang */}
        <g opacity={packet}>
          {comps.map((c, i) => (
            <path key={i} d={wavePath(comp(c))} fill="none" stroke={C.violet} strokeWidth={1.6} opacity={0.35 * (1 - ramp(t, cue(8) + 1.5, cue(8) + 3.5))} />
          ))}
          <path d={wavePath(sum)} fill="none" stroke={C.mint} strokeWidth={5} opacity={ramp(t, cue(8) + 1, cue(8) + 2.5)} filter="url(#glow)" />
          <Label x={xc} y={ay - 140} size={28} color={C.mint} weight={700} opacity={ramp(t, cue(8) + 2, cue(8) + 2.6)}>
            paket gelombang
          </Label>
        </g>
        {/* E(k) */}
        <g opacity={plot}>
          <line x1={PL.x} y1={PL.y} x2={PL.x + PL.w + 20} y2={PL.y} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <line x1={PL.x + PL.w / 2} y1={PL.y + 10} x2={PL.x + PL.w / 2} y2={PL.y - PL.sy - 30} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={PL.x + PL.w + 40} y={PL.y} size={28} color={C.muted} font="serif" italic>
            k
          </Label>
          <Label x={PL.x + PL.w / 2 - 30} y={PL.y - PL.sy - 30} size={28} color={C.muted} font="serif" italic>
            E
          </Label>
          <DrawPath d={plotPath((k) => k * k, -1, 1, PL)} p={plot} stroke={C.gold} width={5} glow len={1600} />
          <rect x={PL.x + PL.w / 2 - 14} y={PL.y - PL.sy} width={28} height={PL.sy} fill="url(#rainbow-v)" opacity={0.5 * cont} rx={6} />
          <Label x={PL.x + PL.w / 2 + 30} y={PL.y - PL.sy + 20} size={26} color={C.gold} anchor="start" weight={700} opacity={cont}>
            semua E ≥ 0 boleh
          </Label>
          <circle cx={PL.x + ((kDot + 1) / 2) * PL.w} cy={PL.y - kDot * kDot * PL.sy} r={11} fill={C.cyan} opacity={cont} filter="url(#glow)" />
        </g>
      </Stage>
      <Formula x={1380} y={690} p={win(t, cue(2), cue(3) - 0.2, 0.7, 0.4)} accent={C.cyan} caption="persamaan Schrödinger, V = 0">
        −<Frac n={<><V>ħ</V><Sup>2</Sup></>} d={<>2<V>m</V></>} />
        <Frac n={<><V>d</V><Sup>2</Sup><V>ψ</V></>} d={<><V>dx</V><Sup>2</Sup></>} />
        &nbsp;=&nbsp;<V>Eψ</V>
      </Formula>
      <Formula x={1380} y={690} p={win(t, cue(3), cue(4) - 0.2, 0.7, 0.4)} accent={C.cyan} caption="gelombang bidang yang merambat">
        <V>ψ</V>(<V>x</V>)&nbsp;=&nbsp;<V>A</V>&thinsp;<V>e</V>
        <Sup>
          <V>ikx</V>
        </Sup>
      </Formula>
      <Formula x={1380} y={690} p={win(t, cue(4), cue(5) - 0.2, 0.7, 0.4)} accent={C.gold} caption="momentum & panjang gelombang de Broglie">
        <V>p</V>&nbsp;=&nbsp;<V>ħk</V>,&nbsp;&nbsp;<V>λ</V>&nbsp;=&nbsp;<Frac n={<V>h</V>} d={<V>p</V>} />
      </Formula>
      <Formula x={1380} y={690} p={win(t, cue(5), cue(8) - 0.3, 0.7, 0.5) * ramp(t, cue(5), cue(5) + 0.6, BACK)} accent={C.gold} caption="k sembarang → energi kontinu">
        <V color={C.gold}>E</V>&nbsp;=&nbsp;
        <Frac n={<><V>ħ</V><Sup>2</Sup><V>k</V><Sup>2</Sup></>} d={<>2<V>m</V></>} />
      </Formula>
      <Formula x={1380} y={690} p={ramp(t, cue(8) + 0.4, cue(8) + 1.2)} accent={C.mint} caption="superposisi banyak k → partikel terlokalisasi">
        <V>Ψ</V>&nbsp;=&nbsp;
        <Part p={1}>
          ∫&thinsp;<V>a</V>(<V>k</V>)&thinsp;<V>e</V>
          <Sup>
            <V>i</V>(<V>kx</V>−<V>ωt</V>)
          </Sup>
          <V>dk</V>
        </Part>
      </Formula>
    </AbsoluteFill>
  );
};
