import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {E1_EV, id, ncol, plotPath, psi} from '../components/viz';
import {ScaleHud, ZoomGrid} from '../components/Zoom';
import {useScene} from '../SceneContext';
import {C} from '../theme';

const BOT = 830;
const UNIT = 35; // px per E₁ (kotak L = 1 nm)
const B1 = {x0: 360, x1: 760};
const B2 = {x0: 1000, x1: 1800};
const yE = (e: number) => BOT - e * UNIT;
// grafik E₁(L) = 0,376 eV / L² (L dalam nm) — Gambar 4 Modul 3
const PL = {x0: 1080, x1: 1760, y0: 820, y1: 470, l0: 0.5, l1: 3, e1: 1.6};
const plx = (L: number) => mix(PL.x0, PL.x1, (L - PL.l0) / (PL.l1 - PL.l0));
const ply = (e: number) => mix(PL.y0, PL.y1, e / PL.e1);

const Ladder: React.FC<{x0: number; x1: number; scale: number; t: number; lv: number[]; labels?: (n: number) => string; lblO?: number; nO?: number}> = ({x0, x1, scale, t, lv, labels, lblO = 0, nO = 1}) => (
  <g>
    {[x0, x1].map((x, i) => (
      <g key={i}>
        <line x1={x} y1={yE(16 * scale) - 70} x2={x} y2={BOT} stroke={C.ink} strokeWidth={10} opacity={0.15} />
        <line x1={x} y1={yE(16 * scale) - 70} x2={x} y2={BOT} stroke={C.ink} strokeWidth={5} />
      </g>
    ))}
    <line x1={x0} y1={BOT} x2={x1} y2={BOT} stroke={C.muted} strokeWidth={2} />
    {[1, 2, 3, 4].map((n, i) => {
      const y = yE(n * n * scale);
      const p = lv[i];
      const cx = (x0 + x1) / 2;
      const d = Array.from({length: 81}, (_, k) => `${k ? 'L' : 'M'}${(x0 + (k / 80) * (x1 - x0)).toFixed(1)},${(y - 18 * psi(n, k / 80) * Math.cos(t * 2 + n)).toFixed(1)}`).join(' ');
      return (
        <g key={n} opacity={p}>
          <line x1={mix(cx, x0, p)} y1={y} x2={mix(cx, x1, p)} y2={y} stroke={ncol(n)} strokeWidth={4} />
          <path d={d} fill="none" stroke={ncol(n)} strokeWidth={2} opacity={0.55} />
          <Label x={x0 - 24} y={y} size={26} color={ncol(n)} anchor="end" font="serif" italic opacity={nO}>
            n = {n}
          </Label>
          {labels ? (
            <Label x={x1 + 22} y={y} size={26} color={ncol(n)} anchor="start" font="mono" opacity={lblO}>
              {labels(n)}
            </Label>
          ) : null}
        </g>
      );
    })}
  </g>
);

export const Energy: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  // zoom keluar ke skala sehari-hari (baris 8)
  const zo = ramp(t, cue(8) - 0.2, cue(8) + 2.6, EASE_IN_OUT);
  const zs = Math.pow(1 / 40, zo);
  const A = 1 - ramp(zo, 0.55, 0.85);
  const box = ramp(t, -0.2, 0.8);
  const lv = [1, 2, 3, 4].map((n) => ramp(t, cue(1) + 0.6 + n * 0.4, cue(1) + 1.2 + n * 0.4, BACK));
  const band = win(t, cue(2) - 0.4, cue(3) - 0.2, 0.6, 0.6);
  const mult = ramp(t, cue(3), cue(3) + 0.6) * (1 - ramp(t, cue(4) - 0.2, cue(4) + 0.2));
  const gaps = win(t, wordOf(3, 'renggang'), cue(4) - 0.2, 0.6, 0.4);
  const ev = ramp(t, cue(4), cue(4) + 0.6);
  const plot = win(t, cue(6), cue(7) - 0.1, 0.7, 0.5);
  const plotDraw = ramp(t, cue(6) + 0.2, cue(6) + 2.2, EASE_IN_OUT);
  const box2 = ramp(t, cue(7) + 0.1, cue(7) + 0.9);
  const lv2 = [1, 2, 3, 4].map((n) => ramp(t, cue(7) + 0.6 + n * 0.3, cue(7) + 1.2 + n * 0.3, BACK));
  const macro = ramp(zo, 0.6, 1);
  const hud = win(t, cue(8) - 0.3, 9999, 0.5, 0.5);
  const evLabel = (n: number) => `${id(E1_EV * n * n, n === 1 ? 3 : 2)} eV`;

  return (
    <AbsoluteFill>
      <Stage>
        <ZoomGrid k={Math.pow(40, 1 - zo) * 1.2} alpha={hud * 0.9} />
        <g opacity={A} transform={`translate(960 560) scale(${zs}) translate(-960 -560)`}>
          <g opacity={box}>
            <line x1={B1.x0 - 110} y1={BOT} x2={B1.x0 - 110} y2={240} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <Label x={B1.x0 - 110} y={218} size={28} color={C.muted} font="serif" italic>
              E
            </Label>
            <Ladder x0={B1.x0} x1={B1.x1} scale={1} t={t} lv={lv} labels={(n) => (mult > 0.01 ? (n === 1 ? 'E₁' : `${n * n}E₁`) : evLabel(n))} lblO={Math.max(mult, ev)} />
            <line x1={B1.x0} y1={BOT + 34} x2={B1.x1} y2={BOT + 34} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" opacity={ev} />
            <Label x={(B1.x0 + B1.x1) / 2} y={BOT + 34} size={26} color={C.gold} font="mono" opacity={ev}>
              L = 1 nm
            </Label>
          </g>
          {/* selisih antartingkat */}
          <g opacity={gaps}>
            {[1, 2, 3].map((n) => {
              const ya = yE(n * n);
              const yb = yE((n + 1) * (n + 1));
              return (
                <g key={n}>
                  <line x1={B1.x1 + 150} y1={ya - 6} x2={B1.x1 + 150} y2={yb + 6} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
                  <Label x={B1.x1 + 170} y={(ya + yb) / 2} size={26} color={C.gold} anchor="start" font="mono" weight={600}>
                    {`${2 * n + 1}E₁`}
                  </Label>
                </g>
              );
            })}
          </g>
          {/* partikel bebas (kontinu) → kotak (diskret) */}
          <g opacity={band}>
            <rect x={897} y={yE(16)} width={46} height={BOT - yE(16)} rx={8} fill="url(#rainbow-v)" opacity={0.65 * (1 - ramp(t, cue(2) + 0.8, cue(2) + 2))} />
            {[1, 4, 9, 16].map((e) => (
              <rect key={e} x={880} y={yE(e) - 3} width={80} height={6} fill={C.gold} opacity={ramp(t, cue(2) + 0.8, cue(2) + 1.6)} />
            ))}
            <Label x={990} y={yE(9)} size={26} color={C.muted} anchor="start">
              partikel bebas: kontinu
            </Label>
            <Label x={990} y={yE(9) + 40} size={26} color={C.gold} anchor="start" opacity={ramp(t, cue(2) + 0.8, cue(2) + 1.6)}>
              di dalam kotak: diskret
            </Label>
          </g>
          {/* grafik E₁ terhadap L */}
          <g opacity={plot}>
            <line x1={PL.x0} y1={PL.y0} x2={PL.x1 + 20} y2={PL.y0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <line x1={PL.x0} y1={PL.y0} x2={PL.x0} y2={PL.y1 - 20} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <Label x={PL.x1} y={PL.y0 + 34} size={22} color={C.muted}>
              L (nm)
            </Label>
            <Label x={PL.x0 + 14} y={PL.y1 - 26} size={22} color={C.muted} anchor="start">
              E₁ elektron (eV)
            </Label>
            {[1, 2, 3].map((L) => (
              <Label key={L} x={plx(L)} y={PL.y0 + 24} size={20} color={C.muted} font="mono">
                {L}
              </Label>
            ))}
            <path
              d={plotPath((L) => Math.min(PL.e1, E1_EV / (L * L)), PL.l0, PL.l1, {x: PL.x0, y: PL.y0, w: PL.x1 - PL.x0, sy: (PL.y0 - PL.y1) / PL.e1})}
              fill="none"
              stroke={C.gold}
              strokeWidth={4}
              strokeDasharray="1400 1400"
              strokeDashoffset={1400 * (1 - plotDraw)}
            />
            {[
              [1, E1_EV],
              [2, E1_EV / 4],
            ].map(([L, e]) => (
              <g key={L} opacity={ramp(plotDraw, 0.6, 1)}>
                <circle cx={plx(L)} cy={ply(e)} r={8} fill={C.cyan} />
                <Label x={plx(L) + 16} y={ply(e) - 22} size={22} color={C.cyan} anchor="start" font="mono">
                  {`${id(e, 3)} eV`}
                </Label>
              </g>
            ))}
            <Label x={1420} y={PL.y1 + 30} size={24} color={C.gold} font="serif" italic>
              E₁ ∝ 1/L²
            </Label>
          </g>
          {/* kotak 2L: tingkat turun menjadi seperempat */}
          <g opacity={box2}>
            <Ladder x0={B2.x0} x1={B2.x1} scale={0.25} t={t} lv={lv2} labels={(n) => ['¼ E₁', '1 E₁', '2,25 E₁', '4 E₁'][n - 1]} lblO={0} nO={0} />
            {[1, 2, 3, 4].map((n, i) => (
              <line key={n} x1={B1.x1 + 8} y1={yE(n * n)} x2={B2.x0 - 8} y2={yE((n * n) / 4)} stroke={ncol(n)} strokeWidth={2} strokeDasharray="7 7" opacity={0.6 * lv2[i]} />
            ))}
            <line x1={B2.x0} y1={BOT + 34} x2={B2.x1} y2={BOT + 34} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
            <Label x={(B2.x0 + B2.x1) / 2} y={BOT + 34} size={26} color={C.gold} font="mono">
              2L = 2 nm
            </Label>
            {[2, 4].map((n) => (
              <Label key={n} x={B2.x1 - 14} y={yE((n * n) / 4) - 22} size={24} color={ncol(n)} anchor="end" font="mono" opacity={lv2[n - 1]}>
                {`${id((E1_EV * n * n) / 4, 3)} eV`}
              </Label>
            ))}
          </g>
        </g>
        {/* skala sehari-hari */}
        <g opacity={macro}>
          <rect x={560} y={300} width={800} height={500} rx={10} fill="#3a2a16" opacity={0.45} stroke="#c9a36a" strokeWidth={5} />
          <rect x={560} y={300} width={800} height={500} rx={10} fill="url(#rainbow-v)" opacity={0.08} />
          {Array.from({length: 160}, (_, k) => (
            <line key={k} x1={575} y1={790 - k * 3} x2={1345} y2={790 - k * 3} stroke={C.gold} strokeWidth={1} opacity={0.18} />
          ))}
          <circle cx={960 + 330 * Math.sin(t * 1.6)} cy={760 - 220 * Math.abs(Math.sin(t * 2.6))} r={34} fill={C.amber} filter="url(#glow)" />
          <Label x={960} y={260} size={30} color={C.ink} weight={600}>
            bola 50 g di dalam kardus 30 cm
          </Label>
          <Label x={1400} y={520} size={30} color={C.gold} anchor="start" font="mono">
            E₁ ≈ 1 × 10⁻⁶⁵ J
          </Label>
          <Label x={1400} y={570} size={24} color={C.muted} anchor="start">
            anak tangga menyatu → tampak kontinu
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
      <Formula x={1450} y={300} p={win(t, cue(7), cue(8) - 0.3, 0.7, 0.4)} accent={C.mint} caption="semua tingkat turun menjadi seperempatnya">
        <V>L</V>&nbsp;→&nbsp;2<V>L</V>&nbsp;&nbsp;⇒&nbsp;&nbsp;<V>E</V>
        <Sub>n</Sub>&nbsp;→&nbsp;
        <Frac n={<><V>E</V><Sub>n</Sub></>} d="4" />
      </Formula>
      <ScaleHud level={zo} exps={[-9, -1]} names={['KOTAK 1 nm', 'KARDUS 30 cm']} colors={[C.cyan, C.amber]} alpha={hud} />
    </AbsoluteFill>
  );
};
