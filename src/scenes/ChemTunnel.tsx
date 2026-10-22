import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Atom, Bond, Label, Stage} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Inversi amonia (sumur ganda) dan transfer hidrogen dalam enzim.
const AM = {x: 470, y: 520};
const DW = {x0: 1020, x1: 1760, bot: 800, h: 300};
const dwX = (q: number) => mix(DW.x0, DW.x1, (q + 1.6) / 3.2);
const dwY = (q: number) => DW.bot - DW.h * Math.min(1.25, (q * q - 1) ** 2);
const dwPath = Array.from({length: 161}, (_, i) => {
  const q = -1.6 + (3.2 * i) / 160;
  return `${i ? 'L' : 'M'}${dwX(q).toFixed(1)},${dwY(q).toFixed(1)}`;
}).join(' ');

const Ammonia: React.FC<{s: number; opacity?: number}> = ({s, opacity = 1}) => {
  const H = [
    [-165, 25],
    [75, 80],
    [110, -32],
  ];
  const nY = AM.y - 130 * s;
  return (
    <g opacity={opacity}>
      {H.map(([dx, dy], i) => (
        <Bond key={i} x1={AM.x} y1={nY} x2={AM.x + dx} y2={AM.y + dy} width={13} />
      ))}
      <ellipse cx={AM.x - 5} cy={AM.y + 20} rx={195} ry={70} fill="none" stroke={C.faint} strokeWidth={2} strokeDasharray="6 6" />
      {H.map(([dx, dy], i) => (
        <Atom key={i} x={AM.x + dx} y={AM.y + dy} el="H" r={34} />
      ))}
      <Atom x={AM.x} y={nY} el="N" r={52} />
    </g>
  );
};

export const ChemTunnel: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const A = 1 - ramp(t, cue(6) - 0.4, cue(6) + 0.3);
  const mol = ramp(t, cue(0) + 0.3, cue(0) + 1.2);
  const flipT = ramp(t, wordOf(1, 'membalik') - 0.3, wordOf(1, 'membalik') + 1.6, EASE_IN_OUT);
  const osc = t > cue(3) ? Math.cos(Math.PI * 0.55 * (t - cue(3))) : mix(1, -1, flipT) * (t < cue(2) ? 1 : 1);
  const s = t < cue(2) ? mix(1, -1, flipT) : t < cue(3) ? -1 + 2 * ramp(t, cue(2), cue(2) + 1.5, EASE_IN_OUT) : osc;
  const dw = ramp(t, cue(2), cue(2) + 1);
  const tun = win(t, cue(3), cue(6), 0.6, 0.6);
  const ghz = ramp(t, cue(4), cue(4) + 0.7, BACK);
  const nd3 = ramp(t, cue(5), cue(5) + 0.8);
  const B = ramp(t, cue(6) - 0.2, cue(6) + 0.8);
  const hT = ((t - cue(6)) * 0.5) % 1;
  const kie = ramp(t, cue(7), cue(7) + 0.8);
  const kieBar = ramp(t, wordOf(7, 'delapan') - 0.4, wordOf(7, 'delapan') + 1.2, EASE_IN_OUT);
  const clsBar = ramp(t, wordOf(7, 'tujuh') - 0.4, wordOf(7, 'tujuh') + 0.8, EASE_IN_OUT);
  const finger = ramp(t, cue(8), cue(8) + 0.8);
  const ballQ = Math.cos(Math.PI * 0.55 * (t - cue(3)));

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={A}>
          {/* amonia */}
          <Ammonia s={1} opacity={0.1 * dw} />
          <Ammonia s={-1} opacity={0.1 * dw} />
          <Ammonia s={s} opacity={mol} />
          <Label x={AM.x} y={AM.y - 250} size={30} color={C.ink} weight={600} opacity={mol}>
            NH₃ · piramida
          </Label>
          {/* sumur ganda */}
          <g opacity={dw}>
            <path d={dwPath} fill="none" stroke={C.ink} strokeWidth={4} />
            <line x1={dwX(0)} y1={DW.bot - 62} x2={dwX(0)} y2={dwY(0) + 8} stroke={C.red} strokeWidth={3} markerEnd="url(#arrow-red)" />
            <Label x={dwX(0)} y={dwY(0) - 30} size={24} color={C.red}>
              penghalang ≈ 24 kJ/mol (2020 cm⁻¹)
            </Label>
            {[-1, 1].map((q) => (
              <Label key={q} x={dwX(q)} y={DW.bot + 34} size={22} color={C.muted}>
                {q < 0 ? 'N di atas' : 'N di bawah'}
              </Label>
            ))}
            <line x1={dwX(-1.45)} y1={DW.bot - 46} x2={dwX(1.45)} y2={DW.bot - 46} stroke={C.gold} strokeWidth={3} />
            <line x1={dwX(-1.45)} y1={DW.bot - 56} x2={dwX(1.45)} y2={DW.bot - 56} stroke={C.gold} strokeWidth={3} />
            <Label x={DW.x0 - 14} y={DW.bot - 51} size={20} color={C.gold} anchor="end" opacity={1 - nd3}>
              dua tingkat, terpisah tipis
            </Label>
          </g>
          <g opacity={tun}>
            <circle cx={dwX(-ballQ)} cy={DW.bot - 51} r={14} fill={C.cyan} filter="url(#glow)" />
            <rect x={dwX(-0.45)} y={DW.bot - 70} width={dwX(0.45) - dwX(-0.45)} height={38} rx={10} fill={C.cyan} opacity={0.15} />
            <Label x={dwX(0)} y={DW.bot - 100} size={24} color={C.cyan} weight={700}>
              menerowong
            </Label>
          </g>
          <g opacity={ghz}>
            <rect x={1080} y={210} width={620} height={110} rx={16} fill="rgba(12,18,40,0.88)" stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} />
            <Label x={1390} y={248} size={32} color={C.gold} weight={700} font="mono">
              ≈ 24 GHz
            </Label>
            <Label x={1390} y={292} size={22} color={C.muted}>
              jam atom pertama (1949) · maser amonia (1954)
            </Label>
          </g>
          <g opacity={nd3}>
            {[
              ['NH₃', 23.7, C.cyan],
              ['ND₃', 1.6, C.violet],
            ].map(([nm, f, col], i) => (
              <g key={i}>
                <Label x={200} y={790 + i * 52 - 25} size={26} color={String(col)} anchor="start" weight={700}>
                  {String(nm)}
                </Label>
                <rect x={280} y={772 + i * 52 - 25} width={(Number(f) / 23.7) * 420} height={34} rx={6} fill={String(col)} opacity={0.75} />
                <Label x={290 + (Number(f) / 23.7) * 420} y={790 + i * 52 - 25} size={22} color={C.ink} anchor="start" font="mono">
                  {`${String(f).replace('.', ',')} GHz`}
                </Label>
              </g>
            ))}
          </g>
        </g>
        {/* enzim: transfer hidrogen */}
        <g opacity={B}>
          <Label x={960} y={220} size={30} color={C.ink} weight={600}>
            transfer hidrogen dalam enzim
          </Label>
          <circle cx={560} cy={420} r={90} fill={C.violet} opacity={0.25} stroke={C.violet} strokeWidth={3} />
          <Label x={560} y={420} size={30} color={C.violet} weight={700}>
            donor
          </Label>
          <circle cx={1360} cy={420} r={90} fill={C.mint} opacity={0.2} stroke={C.mint} strokeWidth={3} />
          <Label x={1360} y={420} size={30} color={C.mint} weight={700}>
            akseptor
          </Label>
          <path d={`M680,${560} Q960,${300} 1240,${560}`} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
          <Label x={960} y={400} size={22} color={C.red}>
            penghalang
          </Label>
          <Atom x={mix(680, 1240, hT)} y={500} el="H" r={22} opacity={0.9} />
          <rect x={680} y={480} width={560} height={40} rx={20} fill={C.cyan} opacity={0.1} />
          {/* efek isotop kinetik */}
          <g opacity={kie}>
            <Label x={300} y={630} size={24} color={C.ink} anchor="start" weight={600}>
              efek isotop kinetik k<tspan baselineShift="sub" fontSize={16}>H</tspan> / k<tspan baselineShift="sub" fontSize={16}>D</tspan>
            </Label>
            <rect x={300} y={660} width={(7 / 85) * 1300 * clsBar} height={44} rx={8} fill={C.muted} opacity={0.8} />
            <Label x={310 + (7 / 85) * 1300 * clsBar} y={682} size={24} color={C.ink} anchor="start" font="mono" opacity={clsBar}>
              ≲ 7 · batas klasik
            </Label>
            <rect x={300} y={724} width={(81 / 85) * 1300 * kieBar} height={44} rx={8} fill={C.gold} opacity={0.9} />
            <Label x={316 + (81 / 85) * 1300 * kieBar} y={746} size={26} color={C.gold} anchor="start" font="mono" weight={700} opacity={kieBar}>
              ≈ 80
            </Label>
            <Label x={300} y={800} size={20} color={C.muted} anchor="start" opacity={kieBar}>
              lipoksigenase-1 kedelai, suhu kamar (Knapp, Rickert &amp; Klinman, 2002)
            </Label>
          </g>
          <Label x={960} y={570} size={30} color={C.gold} weight={700} opacity={finger}>
            sidik jari penerowongan
          </Label>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
