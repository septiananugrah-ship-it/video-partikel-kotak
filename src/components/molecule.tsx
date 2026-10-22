import React from 'react';
import {Atom, Bond} from './primitives';
import {C} from '../theme';

/** Rantai karbon zig-zag. bonds[i] = orde ikatan antara atom i dan i+1. */
export const chainPts = (n: number, cx: number, cy: number, dx = 130, dy = 36) =>
  Array.from({length: n}, (_, i) => [cx + (i - (n - 1) / 2) * dx, cy + (i % 2 ? -dy : dy)] as [number, number]);

export const Chain: React.FC<{
  n: number;
  cx: number;
  cy: number;
  bonds: number[];
  dx?: number;
  dy?: number;
  opacity?: number;
  sp3?: number[];
  r?: number;
  label?: (i: number) => string | null;
}> = ({n, cx, cy, bonds, dx = 130, dy = 36, opacity = 1, sp3 = [], r = 30, label}) => {
  const P = chainPts(n, cx, cy, dx, dy);
  return (
    <g opacity={opacity}>
      {P.slice(1).map((p, i) => (
        <Bond key={i} x1={P[i][0]} y1={P[i][1]} x2={p[0]} y2={p[1]} order={bonds[i] ?? 1} width={11} />
      ))}
      {P.map((p, i) => (
        <g key={i}>
          <Atom x={p[0]} y={p[1]} el="C" r={r} label={label ? label(i) : 'C'} />
          {sp3.includes(i) ? <circle cx={p[0]} cy={p[1]} r={r + 10} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="6 5" /> : null}
        </g>
      ))}
    </g>
  );
};
