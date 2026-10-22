import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {DrawPath, Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Sumur simetris −a < x < a dengan z₀ = a√(2mV₀)/ħ = 2 (Contoh 10 Modul 3).
const XL = 140;
const XR = 1780;
const SPAN = 3.2;
const px = (x: number) => mix(XL, XR, (x + SPAN) / (2 * SPAN));
const Y0 = 860;
const YV = 330;
const yE = (e: number) => mix(Y0, YV, e); // e = E/V₀
const Z0 = 2;
const ST = [
  {z: 1.02987, e: 0.26516, odd: false, col: C.gold},
  {z: 1.89549, e: 0.89822, odd: true, col: C.cyan},
].map((s) => ({...s, kap: Math.sqrt(Z0 * Z0 - s.z * s.z)}));
const AMP = [78, 46];

const psiF = (s: (typeof ST)[number], x: number) => {
  if (Math.abs(x) <= 1) return s.odd ? Math.sin(s.z * x) : Math.cos(s.z * x);
  const edge = s.odd ? Math.sin(s.z) : Math.cos(s.z);
  return (s.odd ? Math.sign(x) : 1) * edge * Math.exp(-s.kap * (Math.abs(x) - 1));
};
const path = (f: (x: number) => number, x0: number, x1: number, y: number, amp = AMP[0]) =>
  Array.from({length: 241}, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 240;
    return `${i ? 'L' : 'M'}${px(x).toFixed(1)},${(y - amp * f(x)).toFixed(1)}`;
  }).join(' ');

export const Finite: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const lower = ramp(t, cue(0) + 1.2, cue(0) + 3, EASE_IN_OUT);
  const wallTop = mix(170, YV, lower);
  const vlbl = ramp(t, wordOf(0, 'V') - 0.2, wordOf(0, 'V') + 0.5);
  const inner = ramp(t, cue(1), cue(1) + 1.2);
  const tails = ramp(t, cue(2) + 0.6, cue(2) + 2.6, EASE_IN_OUT);
  const forb = win(t, cue(3), cue(5) - 0.2, 0.7, 0.5);
  const inf = win(t, cue(4), cue(5) - 0.1, 0.7, 0.5);
  const odd = ramp(t, cue(5) + 0.6, cue(5) + 1.6);
  const vals = ramp(t, cue(6), cue(6) + 0.8);
  const len = win(t, cue(7), cue(8) - 0.1, 0.6, 0.4);
  const thin = ramp(t, cue(8) + 0.4, cue(8) + 2, EASE_IN_OUT);
  const xb = mix(SPAN, 1.8, thin); // tepi luar penghalang kanan
  const ph = t * 2.5;
  const reach = mix(1, SPAN, tails);

  return (
    <AbsoluteFill>
      <Stage>
        {/* potensial */}
        <path
          d={`M${XL},${YV} L${px(-1)},${YV} L${px(-1)},${Y0} L${px(1)},${Y0} L${px(1)},${wallTop} ${thin > 0 ? `L${px(1)},${YV} L${px(xb)},${YV} L${px(xb)},${mix(YV, Y0, thin)} L${XR},${mix(YV, Y0, thin)}` : `L${px(1)},${YV} L${XR},${YV}`}`}
          fill="none"
          stroke={C.ink}
          strokeWidth={5}
          opacity={lower}
        />
        <g opacity={1 - lower}>
          {[px(-1), px(1)].map((x) => (
            <line key={x} x1={x} y1={170} x2={x} y2={Y0} stroke={C.ink} strokeWidth={5} />
          ))}
          <line x1={px(-1)} y1={Y0} x2={px(1)} y2={Y0} stroke={C.ink} strokeWidth={5} />
        </g>
        <line x1={px(-1)} y1={wallTop} x2={px(-1)} y2={Y0} stroke={C.ink} strokeWidth={5} opacity={lower} />
        <g opacity={vlbl * lower}>
          <line x1={XL + 40} y1={Y0} x2={XL + 40} y2={YV + 6} stroke={C.red} strokeWidth={3} markerEnd="url(#arrow-red)" />
          <Label x={XL + 66} y={(Y0 + YV) / 2 + 40} size={32} color={C.red} anchor="start" font="serif" italic>
            V₀
          </Label>
        </g>
        <g opacity={forb}>
          <rect x={XL} y={YV} width={px(-1) - XL} height={Y0 - YV} fill={C.red} opacity={0.08} />
          <rect x={px(1)} y={YV} width={XR - px(1)} height={Y0 - YV} fill={C.red} opacity={0.08} />
          <Label x={(px(1) + XR) / 2} y={YV + 40} size={24} color={C.red} weight={600}>
            terlarang secara klasik
          </Label>
          <Label x={(XL + px(-1)) / 2} y={YV + 40} size={24} color={C.red} weight={600}>
            terlarang secara klasik
          </Label>
        </g>
        {/* tingkat & fungsi gelombang */}
        {ST.map((s, i) => {
          const y = yE(s.e);
          const show = i === 0 ? 1 : odd;
          const moving = (x: number) => psiF(s, x) * (0.75 + 0.25 * Math.cos(ph + i));
          const extended = thin > 0 && i === 1;
          return (
            <g key={i} opacity={show}>
              <line x1={XL} y1={y} x2={XR} y2={y} stroke={s.col} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.5} />
              <DrawPath d={path(moving, -1, 1, y, AMP[i])} p={inner} stroke={s.col} width={5} len={3000} />
              {tails > 0 && i === 0 ? (
                <g opacity={forb}>
                  {[
                    [-reach, -1],
                    [1, reach],
                  ].map(([a, b], k) => (
                    <path key={k} d={`${path(moving, a, b, y, AMP[i])} L${px(b)},${y} L${px(a)},${y} Z`} fill={C.red} opacity={0.35} />
                  ))}
                </g>
              ) : null}
              {tails > 0 ? (
                <>
                  <path d={path(moving, -reach, -1, y, AMP[i])} fill="none" stroke={s.col} strokeWidth={5} />
                  <path d={path(moving, 1, extended ? xb : reach, y, AMP[i])} fill="none" stroke={s.col} strokeWidth={5} />
                </>
              ) : null}
              {extended ? (
                <path
                  d={path((x) => psiF(s, xb) * Math.cos(1.9 * (x - xb) * 3 - ph), xb, SPAN, y, AMP[i])}
                  fill="none"
                  stroke={C.mint}
                  strokeWidth={5}
                  opacity={ramp(thin, 0.5, 1)}
                  filter="url(#glow)"
                />
              ) : null}
              <Label x={XL + 80} y={y - 30} size={26} color={s.col} anchor="start" font="mono" weight={600} opacity={vals}>
                {`E = ${s.e.toFixed(3).replace('.', ',')} V₀`}
              </Label>
            </g>
          );
        })}
        {/* pembanding kotak tak hingga */}
        <g opacity={inf}>
          <line x1={px(-1)} y1={yE(0.617)} x2={px(1)} y2={yE(0.617)} stroke={C.ink} strokeWidth={3} strokeDasharray="12 8" />
          <Label x={px(1) + 20} y={yE(0.617)} size={24} color={C.ink} anchor="start">
            kotak tak hingga: 0,617 V₀
          </Label>
          <line x1={px(0.35)} y1={yE(0.617) + 6} x2={px(0.35)} y2={yE(0.265) - 8} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" />
          <Label x={px(0.35) + 18} y={(yE(0.617) + yE(0.265)) / 2} size={24} color={C.gold} anchor="start" weight={700}>
            lebih rendah
          </Label>
        </g>
        {/* panjang ekor 1/κ */}
        <g opacity={len}>
          {ST.map((s, i) => {
            const y = yE(s.e) + 50;
            return (
              <g key={i}>
                <line x1={px(1)} y1={y} x2={px(1 + 1 / s.kap)} y2={y} stroke={s.col} strokeWidth={4} markerEnd={`url(#arrow-${i ? 'cyan' : 'gold'})`} />
                <Label x={px(1 + 1 / s.kap) + 14} y={y} size={24} color={s.col} anchor="start" font="mono">
                  {`1/κ = ${(1 / s.kap).toFixed(2).replace('.', ',')} a`}
                </Label>
              </g>
            );
          })}
        </g>
        <Label x={(px(-1) + px(1)) / 2} y={Y0 - 26} size={24} color={C.muted} font="mono" opacity={lower}>
          lebar L = 2a
        </Label>
      </Stage>
      <Formula x={1480} y={205} p={win(t, cue(1), cue(5) - 0.1, 0.7, 0.4)} accent={C.cyan} caption="di dalam: berosilasi · di luar: meluruh">
        <V>ψ</V>
        <Sub>luar</Sub>&nbsp;∝&nbsp;<V>e</V>
        <Sup>
          −<V>κ</V>|<V>x</V>|
        </Sup>
        ,&nbsp;&nbsp;<V>κ</V>&nbsp;=&nbsp;
        <Frac n={<>√<span style={{borderTop: '2px solid currentColor'}}>2<V>m</V>(<V>V</V><Sub>0</Sub> − <V>E</V>)</span></>} d={<V>ħ</V>} />
      </Formula>
      <Formula x={1480} y={205} p={win(t, cue(5), cue(6) - 0.1, 0.7, 0.4) * ramp(t, cue(5), cue(5) + 0.7, BACK)} accent={C.gold} caption="jumlah keadaan terikat (dibulatkan ke atas)">
        <V>N</V>
        <Sub>terikat</Sub>&nbsp;=&nbsp;⌈
        <Frac n={<>2<V>z</V><Sub>0</Sub></>} d="π" />⌉&nbsp;=&nbsp;2
      </Formula>
      <Formula x={1480} y={205} p={win(t, cue(6), cue(8) - 0.1, 0.7, 0.4)} accent={C.gold} caption="parameter tak berdimensi sumur">
        <V>z</V>
        <Sub>0</Sub>&nbsp;=&nbsp;
        <Frac n={<><V>a</V>√<span style={{borderTop: '2px solid currentColor'}}>2<V>mV</V><Sub>0</Sub></span></>} d={<V>ħ</V>} />
        &nbsp;=&nbsp;2
      </Formula>
    </AbsoluteFill>
  );
};
