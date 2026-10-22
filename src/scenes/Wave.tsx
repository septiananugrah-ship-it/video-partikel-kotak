import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, rand, ramp, win} from '../anim';
import {Badge, Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {areaPath, ncol, plotPath, psi} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Kiri: tiga keadaan bertumpuk. Kanan: panel besar rapat peluang + titik hasil ukur.
const LS = {x: 200, w: 640};
const ROWS = [790, 620, 450];
const BP = {x: 1080, w: 700, y: 820, sy: 95};
const STRIP = {y0: 420, y1: 480};
const rho = (n: number) => (u: number) => psi(n, u) ** 2;

const DOTS: Record<number, number[]> = {};
const dotsFor = (n: number) => {
  if (DOTS[n]) return DOTS[n];
  const out: number[] = [];
  let k = 0;
  while (out.length < 240 && k < 20000) {
    const u = rand(n * 31 + k * 1.37);
    const q = rand(n * 17 + k * 2.91 + 0.5);
    k++;
    if (q * 2 < rho(n)(u)) out.push(u);
  }
  DOTS[n] = out;
  return out;
};

export const Wave: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const rows = [1, 2, 3].map((n) => ramp(t, cue(0) + 0.3 + (n - 1) * 0.4, cue(0) + 1 + (n - 1) * 0.4));
  const toRho = ramp(t, cue(2), cue(2) + 1.2);
  const nodes = ramp(t, cue(5), cue(5) + 0.8);
  const dua = wordOf(6, 'dua', 1);
  const SEL = [
    {n: 1, a: cue(1) - 0.3, b: cue(4) - 0.1},
    {n: 2, a: cue(4), b: cue(5) - 0.1},
    {n: 3, a: cue(5), b: cue(6) - 0.1},
    {n: 1, a: cue(6), b: dua - 0.2},
    {n: 2, a: dua, b: cue(7) - 0.1},
    {n: 20, a: cue(7), b: 9999},
  ];
  const norm = win(t, cue(1), cue(2) - 0.1, 0.6, 0.4);
  const dotsOn = ramp(t, cue(2) + 0.6, cue(2) + 1.6);
  const node2 = win(t, wordOf(4, 'simpul') - 0.3, cue(5) - 0.1, 0.5, 0.4);
  const half = win(t, cue(6), cue(7) - 0.1, 0.6, 0.4);
  const p1 = ramp(t, wordOf(6, 'delapan') - 0.2, wordOf(6, 'delapan') + 0.4) * (1 - ramp(t, dua - 0.3, dua));
  const p2 = ramp(t, wordOf(6, 'lima') - 0.2, wordOf(6, 'lima') + 0.4);
  const uni = ramp(t, wordOf(7, 'seragam') - 0.4, wordOf(7, 'seragam') + 0.4);
  const ball = ramp(t, wordOf(7, 'bola') - 0.3, wordOf(7, 'bola') + 0.4);
  const corr = ramp(t, cue(8) + 0.2, cue(8) + 0.9, BACK);
  const saw = (t * 0.9) % 2;
  const bu = saw < 1 ? saw : 2 - saw;
  const highlight = (n: number) => SEL.reduce((m, s) => Math.max(m, s.n === n ? win(t, s.a, s.b, 0.5, 0.4) : 0), 0);

  return (
    <AbsoluteFill>
      <Stage>
        {/* tumpukan keadaan n = 1..3 */}
        {[1, 2, 3].map((n, i) => {
          const y = ROWS[i];
          const box = {x: LS.x, y, w: LS.w, sy: 52};
          const hl = highlight(n);
          return (
            <g key={n} opacity={rows[i] * (0.55 + 0.45 * Math.max(hl, t < cue(3) ? 1 : 0))}>
              <line x1={LS.x} y1={y} x2={LS.x + LS.w} y2={y} stroke={C.faint} strokeWidth={2} />
              <line x1={LS.x} y1={y - 120} x2={LS.x} y2={y + 30} stroke={C.ink} strokeWidth={4} />
              <line x1={LS.x + LS.w} y1={y - 120} x2={LS.x + LS.w} y2={y + 30} stroke={C.ink} strokeWidth={4} />
              <path d={areaPath(rho(n), 0, 1, {...box, sy: 52})} fill={ncol(n)} opacity={0.3 * toRho} />
              <path d={plotPath(rho(n), 0, 1, {...box, sy: 52})} fill="none" stroke={ncol(n)} strokeWidth={4} opacity={toRho} />
              <path d={plotPath((u) => psi(n, u), 0, 1, box)} fill="none" stroke={ncol(n)} strokeWidth={4} opacity={1 - 0.7 * toRho} strokeDasharray={toRho > 0.5 ? '8 7' : undefined} />
              <Label x={LS.x - 30} y={y - 40} size={28} color={ncol(n)} anchor="end" font="serif" italic>
                n = {n}
              </Label>
              {Array.from({length: n - 1}, (_, k) => (
                <circle key={k} cx={LS.x + ((k + 1) / n) * LS.w} cy={y} r={11} fill={C.red} opacity={nodes} filter="url(#glow)" />
              ))}
              <Label x={LS.x + LS.w + 30} y={y - 40} size={24} color={C.red} anchor="start" opacity={nodes} font="mono">
                {`${n - 1} simpul`}
              </Label>
            </g>
          );
        })}
        <Label x={LS.x + LS.w / 2} y={330} size={26} color={C.muted} opacity={rows[0] * (1 - toRho)}>
          garis: ψ
        </Label>
        <Label x={LS.x + LS.w / 2} y={330} size={26} color={C.muted} opacity={toRho}>
          isian: |ψ|² · garis putus: ψ
        </Label>
        {/* panel besar */}
        <g opacity={ramp(t, cue(1) - 0.3, cue(1) + 0.4)}>
          <line x1={BP.x} y1={BP.y} x2={BP.x + BP.w} y2={BP.y} stroke={C.muted} strokeWidth={2} />
          <line x1={BP.x} y1={BP.y - 230} x2={BP.x} y2={BP.y + 10} stroke={C.ink} strokeWidth={4} />
          <line x1={BP.x + BP.w} y1={BP.y - 230} x2={BP.x + BP.w} y2={BP.y + 10} stroke={C.ink} strokeWidth={4} />
          <Label x={BP.x} y={BP.y + 30} size={22} color={C.muted} font="mono">
            0
          </Label>
          <Label x={BP.x + BP.w} y={BP.y + 30} size={22} color={C.muted} font="mono">
            L
          </Label>
          <g opacity={half}>
            <rect x={BP.x + BP.w / 4} y={BP.y - 230} width={BP.w / 2} height={230} fill={C.gold} opacity={0.1} />
            <line x1={BP.x + BP.w / 4} y1={BP.y - 230} x2={BP.x + BP.w / 4} y2={BP.y} stroke={C.gold} strokeWidth={2} strokeDasharray="6 6" />
            <line x1={BP.x + (3 * BP.w) / 4} y1={BP.y - 230} x2={BP.x + (3 * BP.w) / 4} y2={BP.y} stroke={C.gold} strokeWidth={2} strokeDasharray="6 6" />
            <Label x={BP.x + BP.w / 2} y={BP.y + 30} size={22} color={C.gold} font="mono">
              L/4 … 3L/4
            </Label>
          </g>
          {SEL.map((s, i) => {
            const w = win(t, s.a, s.b, 0.5, 0.4);
            if (w <= 0) return null;
            const box = {x: BP.x, y: BP.y, w: BP.w, sy: BP.sy};
            const col = s.n > 3 ? C.mint : ncol(s.n);
            return (
              <g key={i} opacity={w}>
                <path d={areaPath(rho(s.n), 0, 1, box, s.n > 3 ? 600 : 200)} fill={col} opacity={0.3} />
                <path d={plotPath(rho(s.n), 0, 1, box, s.n > 3 ? 600 : 260)} fill="none" stroke={col} strokeWidth={s.n > 3 ? 2.5 : 4} />
                <g opacity={dotsOn}>
                  {dotsFor(s.n).map((u, k) => (
                    <circle key={k} cx={BP.x + u * BP.w} cy={STRIP.y0 + rand(k * 7.3) * (STRIP.y1 - STRIP.y0)} r={4} fill={col} opacity={0.75} />
                  ))}
                </g>
                <Label x={BP.x + BP.w - 20} y={STRIP.y0 - 40} size={28} color={col} anchor="end" font="serif" italic>
                  n = {s.n}
                </Label>
              </g>
            );
          })}
          <Label x={BP.x + 10} y={STRIP.y0 - 40} size={22} color={C.muted} anchor="start" opacity={dotsOn}>
            posisi hasil pengukuran
          </Label>
          <g opacity={norm}>
            <Label x={BP.x + BP.w / 2} y={BP.y - 60} size={30} color={C.gold} weight={700}>
              luas = 1
            </Label>
          </g>
          <g opacity={node2}>
            <line x1={BP.x + BP.w / 2} y1={BP.y - 215} x2={BP.x + BP.w / 2} y2={BP.y - 8} stroke={C.red} strokeWidth={3} markerEnd="url(#arrow-red)" />
            <Label x={BP.x + BP.w / 2} y={BP.y - 240} size={26} color={C.red} weight={700}>
              simpul: |ψ|² = 0
            </Label>
          </g>
          <Label x={BP.x + BP.w / 2} y={BP.y - 250} size={34} color={C.gold} weight={700} font="mono" opacity={p1}>
            P = 0,818
          </Label>
          <Label x={BP.x + BP.w / 2} y={BP.y - 250} size={34} color={C.cyan} weight={700} font="mono" opacity={p2 * half}>
            P = 0,500
          </Label>
          <g opacity={uni}>
            <line x1={BP.x} y1={BP.y - BP.sy} x2={BP.x + BP.w} y2={BP.y - BP.sy} stroke={C.ink} strokeWidth={3} strokeDasharray="12 8" />
            <Label x={BP.x + BP.w / 2} y={BP.y + 34} size={24} color={C.ink}>
              rata-rata ≈ seragam (klasik)
            </Label>
          </g>
          <g opacity={ball}>
            <circle cx={BP.x + 24 + bu * (BP.w - 48)} cy={STRIP.y0 - 90} r={18} fill={C.amber} filter="url(#glow)" />
            <line x1={BP.x} y1={STRIP.y0 - 66} x2={BP.x + BP.w} y2={STRIP.y0 - 66} stroke={C.faint} strokeWidth={2} />
          </g>
        </g>
      </Stage>
      <Formula x={1430} y={260} p={win(t, cue(0) + 0.2, cue(1) - 0.1, 0.7, 0.4) * ramp(t, cue(0), cue(0) + 0.7, BACK)} accent={C.gold} caption="fungsi gelombang ternormalisasi, 0 < x < L">
        <V>ψ</V>
        <Sub>n</Sub>(<V>x</V>)&nbsp;=&nbsp;
        <span style={{display: 'inline-flex', alignItems: 'center'}}>
          √<span style={{borderTop: '3px solid currentColor', paddingTop: 2}}>
            <Frac n="2" d={<V>L</V>} size={0.8} />
          </span>
        </span>
        &nbsp;sin&thinsp;
        <Frac n={<><V>nπx</V></>} d={<V>L</V>} />
      </Formula>
      <Formula x={1430} y={260} p={win(t, cue(1), cue(2) - 0.1, 0.7, 0.4)} accent={C.gold} caption="normalisasi: peluang total = 1">
        <span style={{fontSize: '1.2em'}}>∫</span>
        <Sub>0</Sub>
        <Sup>L</Sup>&nbsp;|<V>ψ</V>
        <Sub>n</Sub>|<Sup>2</Sup>&thinsp;<V>dx</V>&nbsp;=&nbsp;1
      </Formula>
      <Formula x={1430} y={260} p={win(t, cue(2), cue(6) - 0.1, 0.7, 0.4)} accent={C.cyan} caption="rapat peluang posisi">
        <V>ρ</V>
        <Sub>n</Sub>(<V>x</V>)&nbsp;=&nbsp;|<V>ψ</V>
        <Sub>n</Sub>|<Sup>2</Sup>&nbsp;=&nbsp;
        <Frac n="2" d={<V>L</V>} />
        &thinsp;sin<Sup>2</Sup>&thinsp;
        <Frac n={<V>nπx</V>} d={<V>L</V>} />
      </Formula>
      <Formula x={1430} y={260} p={win(t, cue(6), cue(7) - 0.1, 0.7, 0.4)} accent={C.gold} caption="peluang di setengah bagian tengah, n = 1">
        <V>P</V>
        <Sub>1</Sub>&nbsp;=&nbsp;
        <Frac n="1" d="2" />
        &nbsp;+&nbsp;
        <Frac n="1" d="π" />
        &nbsp;≈&nbsp;0,818
      </Formula>
      <Badge x={1430} y={260} text="PRINSIP KORESPONDENSI" color={C.mint} opacity={corr} scale={0.8 + 0.2 * corr} />
    </AbsoluteFill>
  );
};
