import React from 'react';
import {mix} from '../anim';
import {Label} from './primitives';
import PACKET from '../data/packet.json';
import {C, FONT} from '../theme';

// Paket gelombang elektron (E₀ = 1 eV) menumbuk penghalang 5 eV setebal 0,20 nm.
// Data: scripts/sim-packet.py (persamaan Schrödinger bergantung waktu, metode split-operator).
type Pk = {x0: number; x1: number; n: number; dtFs: number; rho: number[][]; Re: number[][]; P: number[]};
const D = PACKET as Pk;
const FRAMES = D.rho.length;

const frameAt = (arr: number[][], f: number) => {
  const i = Math.max(0, Math.min(FRAMES - 1, Math.floor(f)));
  const j = Math.min(FRAMES - 1, i + 1);
  const a = f - i;
  return arr[i].map((v, k) => v + (arr[j][k] - v) * a);
};

export const PacketSim: React.FC<{
  /** 0..1 jalannya simulasi */
  p: number;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
  mag?: number;
}> = ({p, x, y, w, h, opacity = 1, mag = 10}) => {
  if (opacity <= 0) return null;
  const f = Math.max(0, Math.min(1, p)) * (FRAMES - 1);
  const rho = frameAt(D.rho, f);
  const re = frameAt(D.Re, f);
  const Pt = D.P[Math.min(FRAMES - 1, Math.round(f))];
  const px = (xn: number) => mix(x, x + w, (xn - D.x0) / (D.x1 - D.x0));
  const xs = rho.map((_, k) => D.x0 + ((D.x1 - D.x0) * k) / (D.n - 1));
  const sy = h / 0.42;
  const area = (vals: number[], from: number, to: number, scale: number) => {
    const pts: string[] = [];
    xs.forEach((xn, k) => {
      if (xn < from || xn > to) return;
      pts.push(`${px(xn).toFixed(1)},${(y - vals[k] * scale).toFixed(1)}`);
    });
    if (!pts.length) return '';
    return `M${px(Math.max(from, D.x0)).toFixed(1)},${y} L${pts.join(' L')} L${px(Math.min(to, D.x1)).toFixed(1)},${y} Z`;
  };
  const reLine = xs.map((xn, k) => `${k ? 'L' : 'M'}${px(xn).toFixed(1)},${(y - h * 0.42 - re[k] * h * 0.5).toFixed(1)}`).join(' ');
  const bx0 = px(0);
  const bx1 = Math.max(bx0 + 6, px(0.2));
  return (
    <g opacity={opacity}>
      <rect x={x - 30} y={y - h - 70} width={w + 60} height={h + 120} rx={18} fill="rgba(8,12,28,0.72)" stroke={C.faint} strokeWidth={2} />
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.muted} strokeWidth={2} />
      {/* penghalang */}
      <rect x={bx0 - 2} y={y - h - 20} width={bx1 - bx0 + 4} height={h + 20} fill={C.red} opacity={0.25} />
      <rect x={bx0} y={y - h - 20} width={bx1 - bx0} height={h + 20} fill={C.red} opacity={0.85} />
      <Label x={bx0} y={y - h - 44} size={22} color={C.red} weight={700}>
        penghalang 5 eV · 0,20 nm
      </Label>
      <defs>
        <clipPath id="packet-clip">
          <rect x={x - 30} y={y - h - 10} width={w + 60} height={h + 10} />
        </clipPath>
      </defs>
      <g clipPath="url(#packet-clip)">
      {/* bagian riil ψ (garis tipis) */}
      <path d={reLine} fill="none" stroke={C.cyan} strokeWidth={1.6} opacity={0.45} />
      {/* |ψ|² */}
      <path d={area(rho, D.x0, 0, sy)} fill={C.gold} opacity={0.55} />
      <path d={area(rho, 0.2, D.x1, sy)} fill={C.gold} opacity={0.55} />
      <path d={area(rho, 0.2, D.x1, sy * mag)} fill={C.mint} opacity={0.35} stroke={C.mint} strokeWidth={2} />
      </g>
      {[-20, -10, 0, 10, 20].map((v) => (
        <text key={v} x={px(v)} y={y + 24} textAnchor="middle" fontFamily={FONT.mono} fontSize={18} fill={C.muted}>
          {v}
        </text>
      ))}
      <text x={x + w} y={y + 24} textAnchor="end" fontFamily={FONT.mono} fontSize={18} fill={C.muted} dx={40}>
        nm
      </text>
      <Label x={x + 10} y={y - h - 40} size={22} color={C.ink} anchor="start" weight={600}>
        {`simulasi |ψ|² · t = ${(f * D.dtFs).toFixed(0)} fs`}
      </Label>
      <Label x={x + w - 10} y={y - h - 40} size={24} color={C.mint} anchor="end" weight={700} font="mono">
        {`tembus: ${(Pt * 100).toFixed(1).replace('.', ',')} %`}
      </Label>
      <Label x={px(12)} y={y - h * 0.55} size={20} color={C.mint} opacity={Pt > 0.005 ? 1 : 0}>
        {`hijau: diperbesar ${mag}×`}
      </Label>
    </g>
  );
};
