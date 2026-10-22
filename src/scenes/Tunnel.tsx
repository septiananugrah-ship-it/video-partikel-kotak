import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {Electron} from '../components/viz';
import {PacketSim} from '../components/PacketSim';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Elektron E = 1 eV pada penghalang V₀ = 5 eV (Contoh 11 Modul 3). x dalam nm.
const XL = 120;
const XR = 1800;
const XMIN = -2;
const XMAX = 2;
const px = (x: number) => mix(XL, XR, (x - XMIN) / (XMAX - XMIN));
const Y0 = 780;
const PER_EV = 90;
const yEv = (e: number) => Y0 - e * PER_EV;
const E = 1;
const V0 = 5;
const K = 5.12317 * Math.sqrt(E);
const KAP = 5.12317 * Math.sqrt(V0 - E);
const AMP = 42;

type Cx = [number, number];
const add = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const div = (a: Cx, b: Cx): Cx => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cis = (p: number): Cx => [Math.cos(p), Math.sin(p)];
const sc = (a: Cx, s: number): Cx => [a[0] * s, a[1] * s];

/** Koefisien transmisi eksak. */
export const transT = (d: number, e = E, v = V0) => {
  const kap = 5.12317 * Math.sqrt(v - e);
  return 1 / (1 + (v * v * Math.sinh(kap * d) ** 2) / (4 * e * (v - e)));
};

/** Fungsi gelombang hamburan (A = 1) untuk lebar d. */
const solve = (d: number) => {
  const den: Cx = [Math.cosh(KAP * d), ((KAP * KAP - K * K) / (2 * K * KAP)) * Math.sinh(KAP * d)];
  const F = div(cis(-K * d), den);
  const Fe = mul(F, cis(K * d));
  const Cc = sc(mul(Fe, [1, K / KAP]), 0.5 * Math.exp(-KAP * d));
  const Dc = sc(mul(Fe, [1, -K / KAP]), 0.5 * Math.exp(KAP * d));
  const B = add(add(Cc, Dc), [-1, 0]);
  return (x: number): Cx => {
    if (x < 0) return add(cis(K * x), mul(B, cis(-K * x)));
    if (x <= d) return add(sc(Cc, Math.exp(KAP * x)), sc(Dc, Math.exp(-KAP * x)));
    return mul(F, cis(K * x));
  };
};

const fmtT = (v: number) => {
  if (v >= 0.01) return v.toFixed(3).replace('.', ',');
  const ex = Math.floor(Math.log10(v));
  const m = v / 10 ** ex;
  const sup = String(ex).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]);
  return `${m.toFixed(1).replace('.', ',')} × 10${sup}`;
};

// Inset: T terhadap d (skala log).
const IN = {x: 150, y: 235, w: 470, h: 230};
const inX = (d: number) => IN.x + (d / 1) * IN.w;
const inY = (T: number) => IN.y + IN.h * (-Math.log10(T) / 9);

export const Tunnel: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const sim = win(t, cue(2) - 0.3, cue(4) - 0.5, 0.8, 0.6);
  const simP = ramp(t, cue(2) + 0.4, cue(4) - 0.9, (x) => x);
  const base = 1 - sim;
  const rise = ramp(t, cue(0), cue(0) + 1.2, BACK);
  const eLbl = ramp(t, wordOf(0, 'satu') - 0.2, wordOf(0, 'satu') + 0.5);
  const dot = win(t, cue(0) + 0.3, cue(1) - 0.2, 0.5, 0.4);
  const cls = win(t, cue(1), cue(2) - 0.1, 0.5, 0.5);
  const wave = ramp(t, cue(2), cue(2) + 1.2);
  const trans = ramp(t, cue(3), cue(3) + 0.8);
  const grow = ramp(t, cue(6) + 0.3, cue(6) + 3, EASE_IN_OUT);
  const d = mix(0.2, 0.5, grow);
  const T = transT(d);
  const tLbl = ramp(t, cue(5), cue(5) + 0.6) * (1 - ramp(t, cue(9), cue(9) + 0.5));
  const inset = ramp(t, cue(5) + 0.4, cue(5) + 1.2);
  const same = ramp(t, cue(8) + 1.4, cue(8) + 2.2);
  const cmp = ramp(t, cue(9) + 0.3, cue(9) + 1.1, BACK);
  const w = solve(d);
  const om = 3.2;
  const ph = cis(-om * t);
  const N = 420;
  const wavePts: string[] = [];
  const magPts: string[] = [];
  const MAG = Math.min(12, 0.6 / Math.sqrt(T));
  const env: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = XMIN + ((XMAX - XMIN) * i) / N;
    const v = w(x);
    const re = mul(v, ph)[0];
    wavePts.push(`${i ? 'L' : 'M'}${px(x).toFixed(1)},${(yEv(E) - AMP * re).toFixed(1)}`);
    if (x > d) magPts.push(`${magPts.length ? 'L' : 'M'}${px(x).toFixed(1)},${(yEv(E) - AMP * MAG * re).toFixed(1)}`);
    env.push(`${i ? 'L' : 'M'}${px(x).toFixed(1)},${(yEv(E) - AMP * Math.hypot(v[0], v[1])).toFixed(1)}`);
  }
  // bola klasik
  const ct = t - cue(1);
  const bx = ct < 1.6 ? mix(-1.8, -0.06, ct / 1.6) : mix(-0.06, -1.8, Math.min(1, (ct - 1.6) / 1.6));
  const insetPath = Array.from({length: 101}, (_, i) => {
    const dd = 0.005 + (0.995 * i) / 100;
    return `${i ? 'L' : 'M'}${inX(dd).toFixed(1)},${inY(transT(dd)).toFixed(1)}`;
  }).join(' ');

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={base}>
        {/* potensial */}
        <g opacity={ramp(t, -0.2, 0.6)}>
          <line x1={XL} y1={Y0} x2={XR} y2={Y0} stroke={C.muted} strokeWidth={2} />
          <rect x={px(0)} y={mix(Y0, yEv(V0), rise)} width={px(d) - px(0)} height={Y0 - mix(Y0, yEv(V0), rise)} fill={C.red} opacity={0.25} stroke={C.red} strokeWidth={3} />
          <Label x={px(d) + 20} y={yEv(V0) + 4} size={28} color={C.red} anchor="start" opacity={rise}>
            V₀ = 5 eV
          </Label>
          <line x1={px(0)} y1={Y0 + 30} x2={px(d)} y2={Y0 + 30} stroke={C.red} strokeWidth={3} opacity={rise} />
          <Label x={(px(0) + px(d)) / 2} y={Y0 + 58} size={24} color={C.red} font="mono" opacity={rise}>
            {`d = ${d.toFixed(2).replace('.', ',')} nm`}
          </Label>
        </g>
        <g opacity={eLbl}>
          <line x1={XL} y1={yEv(E)} x2={XR} y2={yEv(E)} stroke={C.gold} strokeWidth={2} strokeDasharray="10 8" opacity={0.6} />
          <Label x={XL + 10} y={yEv(E) - 100} size={28} color={C.gold} anchor="start" weight={600}>
            E = 1 eV
          </Label>
        </g>
        <Electron x={px(mix(-1.8, -0.4, ramp(t, cue(0) + 0.3, cue(1) - 0.2)))} y={yEv(E)} r={13} opacity={dot} />
        {/* klasik: terpantul */}
        <g opacity={cls}>
          <circle cx={px(bx)} cy={yEv(E)} r={20} fill={C.amber} filter="url(#glow)" />
          <Label x={px(-1)} y={yEv(E) - 110} size={30} color={C.amber} weight={700}>
            klasik: selalu terpantul
          </Label>
          <Label x={px(1)} y={yEv(E) - 40} size={30} color={C.red} weight={700}>
            ✗
          </Label>
        </g>
        {/* gelombang kuantum */}
        <g opacity={wave}>
          <path d={env.join(' ')} fill="none" stroke={C.cyan} strokeWidth={1.5} opacity={0.35} strokeDasharray="5 6" />
          <path d={wavePts.join(' ')} fill="none" stroke={C.cyan} strokeWidth={4.5} filter="url(#glow)" />
          <Label x={px(-1)} y={yEv(E) - 115} size={26} color={C.cyan} opacity={ramp(t, cue(2) + 0.8, cue(2) + 1.4)}>
            datang + terpantul
          </Label>
          <Label x={(px(0) + px(d)) / 2} y={yEv(V0) - 40} size={26} color={C.red} opacity={ramp(t, wordOf(2, 'meluruh') - 0.2, wordOf(2, 'meluruh') + 0.4) * (1 - inset)}>
            meluruh
          </Label>
        </g>
        <g opacity={trans}>
          <rect x={px(d) + 10} y={yEv(E) - 60} width={XR - px(d) - 20} height={120} rx={14} fill={C.mint} opacity={0.06} />
          <path d={magPts.join(' ')} fill="none" stroke={C.mint} strokeWidth={4} opacity={0.9} filter="url(#glow)" />
          <Label x={px(1.2)} y={yEv(E) - 90} size={28} color={C.mint} weight={700}>
            tembus →
          </Label>
          <Label x={px(1.2)} y={yEv(E) + 125} size={22} color={C.mint}>
            {`hijau: diperbesar ${Math.round(MAG)}×`}
          </Label>
        </g>
        <g opacity={tLbl}>
          <Label x={px(1.2)} y={yEv(V0) + 70} size={34} color={C.gold} weight={700} font="mono">
            {`T ≈ ${fmtT(T)}`}
          </Label>
        </g>
        <g opacity={same}>
          <Label x={px(-1)} y={yEv(E) + 70} size={26} color={C.gold} weight={600}>
            E masuk = 1 eV
          </Label>
          <Label x={px(1.2)} y={yEv(E) + 70} size={26} color={C.gold} weight={600}>
            E keluar = 1 eV
          </Label>
        </g>
        {/* inset log T(d) */}
        <g opacity={inset}>
          <rect x={IN.x - 70} y={IN.y - 50} width={IN.w + 110} height={IN.h + 110} rx={16} fill="rgba(10,14,30,0.85)" stroke={C.faint} strokeWidth={2} />
          <line x1={IN.x} y1={IN.y + IN.h} x2={IN.x + IN.w} y2={IN.y + IN.h} stroke={C.muted} strokeWidth={2} />
          <line x1={IN.x} y1={IN.y} x2={IN.x} y2={IN.y + IN.h} stroke={C.muted} strokeWidth={2} />
          {[0, 3, 6, 9].map((k) => (
            <Label key={k} x={IN.x - 12} y={IN.y + (IN.h * k) / 9} size={18} color={C.muted} anchor="end" font="mono">
              {k ? `10⁻${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]}` : '1'}
            </Label>
          ))}
          {[0, 0.5, 1].map((k) => (
            <Label key={k} x={inX(k)} y={IN.y + IN.h + 22} size={18} color={C.muted} font="mono">
              {String(k).replace('.', ',')}
            </Label>
          ))}
          <Label x={IN.x + IN.w / 2} y={IN.y - 26} size={22} color={C.ink} weight={600}>
            T terhadap tebal d (nm), skala log
          </Label>
          <path d={insetPath} fill="none" stroke={C.gold} strokeWidth={3.5} />
          <circle cx={inX(d)} cy={inY(T)} r={9} fill={C.mint} filter="url(#glow)" />
        </g>
        {/* elektron vs proton */}
        <g opacity={cmp}>
          <rect x={1250} y={380} width={520} height={150} rx={18} fill="rgba(12,18,40,0.88)" stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} />
          <Label x={1280} y={420} size={26} color={C.cyan} anchor="start" weight={600}>
            elektron, d = 0,2 nm:
          </Label>
          <Label x={1740} y={420} size={26} color={C.cyan} anchor="end" font="mono">
            T ≈ 0,04
          </Label>
          <Label x={1280} y={480} size={26} color={C.red} anchor="start" weight={600}>
            proton, d = 0,2 nm:
          </Label>
          <Label x={1740} y={480} size={26} color={C.red} anchor="end" font="mono">
            T ≈ 10⁻⁷⁶
          </Label>
        </g>
        </g>
        <PacketSim p={simP} x={150} y={700} w={1620} h={400} opacity={sim} />
      </Stage>
      <Formula x={1450} y={215} p={win(t, cue(4), cue(7) - 0.1, 0.7, 0.4) * ramp(t, cue(4), cue(4) + 0.7, BACK)} accent={C.gold} caption="koefisien transmisi eksak (E < V₀)">
        <V color={C.gold}>T</V>&nbsp;=&nbsp;
        <span style={{fontSize: '1.3em'}}>[</span>1 +&nbsp;
        <Frac n={<><V>V</V><Sub>0</Sub><Sup>2</Sup>&thinsp;sinh<Sup>2</Sup>(<V>κd</V>)</>} d={<>4<V>E</V>(<V>V</V><Sub>0</Sub> − <V>E</V>)</>} />
        <span style={{fontSize: '1.3em'}}>]</span>
        <Sup>−1</Sup>
      </Formula>
      <Formula x={1450} y={215} p={win(t, cue(7), cue(9) - 0.1, 0.7, 0.4)} accent={C.violet} caption="penghalang tebal: meluruh eksponensial, κ ∝ √m">
        <V color={C.gold}>T</V>&nbsp;≈&nbsp;16
        <Frac n={<V>E</V>} d={<><V>V</V><Sub>0</Sub></>} />
        (1 −&nbsp;
        <Frac n={<V>E</V>} d={<><V>V</V><Sub>0</Sub></>} />)&thinsp;<V>e</V>
        <Sup>
          −2<V>κd</V>
        </Sup>
      </Formula>
    </AbsoluteFill>
  );
};
