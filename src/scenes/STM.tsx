import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {Label, Stage} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

const SURF = {x0: 160, x1: 1240, y: 720, dx: 90, r: 40};
const ATOMS = Array.from({length: Math.floor((SURF.x1 - SURF.x0) / SURF.dx) + 1}, (_, i) => SURF.x0 + i * SURF.dx);
// tinggi permukaan (puncak atom) di posisi x
const topo = (x: number) => {
  let best = 0;
  for (const ax of ATOMS) {
    const d = Math.abs(x - ax);
    if (d < SURF.r) best = Math.max(best, Math.sqrt(SURF.r * SURF.r - d * d));
  }
  return SURF.y - best;
};
const GAP = 46;
const TR = {x0: 1360, x1: 1780, y: 790, h: 110};
const IP = {x0: 1380, x1: 1760, y0: 300, y1: 560};

export const STM: React.FC = () => {
  const {t, cue} = useScene();
  const A = 1 - ramp(t, cue(6) - 0.4, cue(6) + 0.3);
  const surf = ramp(t, cue(0), cue(0) + 1);
  const tip = ramp(t, cue(1), cue(1) + 1.2, EASE_IN_OUT);
  const cur = ramp(t, cue(2), cue(2) + 0.8);
  const iplot = ramp(t, cue(3), cue(3) + 0.8) * (1 - ramp(t, cue(5) - 0.2, cue(5) + 0.4));
  const scan = t > cue(4) ? (t - cue(4)) * 120 : 0;
  const tipX = 300 + (scan % 880);
  const apex = mix(220, topo(tipX) - GAP, tip);
  const trace = ramp(t, cue(4), cue(4) + 0.6);
  const nob = ramp(t, cue(5), cue(5) + 0.7, BACK) * (1 - ramp(t, cue(6) - 0.6, cue(6) - 0.1));
  const B = ramp(t, cue(6) - 0.2, cue(6) + 1);
  const ring = (k: number) => ramp(t, cue(6) + 0.3 + k * 0.035, cue(6) + 0.6 + k * 0.035);
  const wave = ramp(t, cue(7), cue(7) + 1.5);
  const sweep = scan % 880;
  const tracePts = Array.from({length: 90}, (_, i) => {
    const xx = 300 + (sweep * i) / 89;
    return `${i ? 'L' : 'M'}${mix(TR.x0, TR.x1, (xx - 300) / 880).toFixed(1)},${(TR.y - (SURF.y - topo(xx)) * (TR.h / 40)).toFixed(1)}`;
  }).join(' ');

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={A}>
          {/* permukaan atom */}
          <g opacity={surf}>
            <rect x={SURF.x0 - 60} y={SURF.y} width={SURF.x1 - SURF.x0 + 120} height={90} fill="#5d6a86" opacity={0.25} />
            {ATOMS.map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={SURF.y} r={SURF.r} fill="url(#atom-C)" />
              </g>
            ))}
            <Label x={(SURF.x0 + SURF.x1) / 2} y={SURF.y + 70} size={24} color={C.muted}>
              permukaan sampel (atom)
            </Label>
          </g>
          {/* jarum */}
          <g opacity={tip}>
            <path d={`M${tipX - 120},${apex - 330} L${tipX + 120},${apex - 330} L${tipX + 14},${apex - 10} Q${tipX},${apex + 4} ${tipX - 14},${apex - 10} Z`} fill="url(#spring-metal)" opacity={0.9} />
            <circle cx={tipX} cy={apex - 4} r={10} fill="#fff6dc" />
            <Label x={tipX + 150} y={apex - 250} size={24} color={C.gold} anchor="start">
              jarum logam
            </Label>
          </g>
          <g opacity={cur * tip}>
            {Array.from({length: 6}, (_, k) => {
              const ph = (t * 1.5 + k / 6) % 1;
              return <circle key={k} cx={tipX + 8 * Math.sin(k * 2.1)} cy={apex + ph * (GAP - 6)} r={5} fill={C.cyan} opacity={1 - ph * 0.6} filter="url(#glow)" />;
            })}
            <line x1={tipX + 34} y1={apex} x2={tipX + 34} y2={topo(tipX)} stroke={C.cyan} strokeWidth={2} />
            <Label x={tipX + 60} y={apex - 70} size={24} color={C.cyan} anchor="start" weight={600}>
              celah &lt; 1 nm
            </Label>
          </g>
          {/* arus terhadap jarak */}
          <g opacity={iplot}>
            <rect x={IP.x0 - 50} y={IP.y0 - 50} width={IP.x1 - IP.x0 + 80} height={IP.y1 - IP.y0 + 110} rx={16} fill="rgba(10,14,30,0.85)" stroke={C.faint} strokeWidth={2} />
            <line x1={IP.x0} y1={IP.y1} x2={IP.x1} y2={IP.y1} stroke={C.muted} strokeWidth={2} />
            <line x1={IP.x0} y1={IP.y1} x2={IP.x0} y2={IP.y0} stroke={C.muted} strokeWidth={2} />
            <Label x={(IP.x0 + IP.x1) / 2} y={IP.y0 - 24} size={22} color={C.ink} weight={600}>
              arus (skala log) terhadap jarak
            </Label>
            <path d={`M${IP.x0},${IP.y0 + 10} L${IP.x1},${IP.y1 - 10}`} stroke={C.gold} strokeWidth={4} />
            {[0, 1, 2, 3].map((k) => (
              <g key={k}>
                <circle cx={mix(IP.x0, IP.x1, k / 3)} cy={mix(IP.y0 + 10, IP.y1 - 10, k / 3)} r={7} fill={C.gold} />
                <Label x={mix(IP.x0, IP.x1, k / 3) + 14} y={mix(IP.y0 + 10, IP.y1 - 10, k / 3) - 18} size={18} color={C.gold} anchor="start" font="mono">
                  {['I', 'I/10', 'I/100', 'I/1000'][k]}
                </Label>
              </g>
            ))}
            <Label x={(IP.x0 + IP.x1) / 2} y={IP.y1 + 30} size={20} color={C.muted}>
              tiap +0,1 nm → arus ÷ ~10
            </Label>
          </g>
          {/* rekaman tinggi jarum */}
          <g opacity={trace}>
            <rect x={TR.x0 - 30} y={TR.y - TR.h - 50} width={TR.x1 - TR.x0 + 60} height={TR.h + 80} rx={14} fill="rgba(10,14,30,0.85)" stroke={C.faint} strokeWidth={2} />
            <Label x={(TR.x0 + TR.x1) / 2} y={TR.y - TR.h - 26} size={20} color={C.ink}>
              tinggi jarum → peta atom
            </Label>
            <path d={tracePts} fill="none" stroke={C.mint} strokeWidth={3} />
          </g>
        </g>
        {/* pagar kuantum */}
        <g opacity={B}>
          <ellipse cx={960} cy={540} rx={600} ry={250} fill="#c97a3a" opacity={0.12} />
          <g opacity={wave}>
            {Array.from({length: 9}, (_, k) => {
              const rr = (k + 0.5) / 9;
              const amp = (1 / Math.sqrt(k + 1)) * (0.6 + 0.4 * Math.sin(t * 2 - k));
              return <ellipse key={k} cx={960} cy={540 - 10 * amp} rx={500 * rr} ry={205 * rr} fill="none" stroke={C.gold} strokeWidth={6 + 8 * amp} opacity={0.15 + 0.4 * amp} filter="url(#glow)" />;
            })}
            <ellipse cx={960} cy={535} rx={36} ry={16} fill={C.gold} opacity={0.8} filter="url(#glow)" />
          </g>
          {Array.from({length: 48}, (_, k) => {
            const a = (2 * Math.PI * k) / 48;
            const x = 960 + 540 * Math.cos(a);
            const y = 540 + 225 * Math.sin(a);
            const s = 0.75 + 0.25 * Math.sin(a);
            return (
              <g key={k} opacity={ring(k)}>
                <ellipse cx={x} cy={y - 14 * s} rx={20 * s} ry={24 * s} fill="#9fb4e8" opacity={0.9} />
                <ellipse cx={x - 5 * s} cy={y - 22 * s} rx={7 * s} ry={6 * s} fill="#fff" opacity={0.6} />
              </g>
            );
          })}
          <Label x={960} y={235} size={30} color={C.ink} weight={600}>
            48 atom besi di atas tembaga · IBM, 1993
          </Label>
          <Label x={960} y={828} size={26} color={C.gold} opacity={wave}>
            gelombang berdiri elektron di dalam “kotak melingkar”
          </Label>
          <Label x={1640} y={300} size={20} color={C.muted} anchor="end" opacity={wave}>
            ilustrasi skematis
          </Label>
        </g>
      </Stage>
      <div
        style={{
          position: 'absolute',
          left: 1570,
          top: 300,
          transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * nob})`,
          opacity: nob,
          padding: '24px 36px',
          borderRadius: 20,
          background: 'linear-gradient(160deg, rgba(40,32,10,0.95), rgba(12,10,4,0.95))',
          border: `2px solid ${C.gold}`,
          boxShadow: `0 0 50px ${C.gold}44`,
          textAlign: 'center',
          fontFamily: FONT.sans,
          color: C.ink,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 4, color: C.gold}}>HADIAH NOBEL FISIKA 1986</div>
        <div style={{fontSize: 34, fontWeight: 700, marginTop: 8}}>Gerd Binnig · Heinrich Rohrer</div>
        <div style={{fontSize: 22, color: C.muted, marginTop: 6}}>IBM Zürich · mikroskop penerowongan (STM)</div>
      </div>
    </AbsoluteFill>
  );
};
