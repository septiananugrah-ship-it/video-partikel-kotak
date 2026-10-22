import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, rand, ramp, win} from '../anim';
import {Label, Stage} from '../components/primitives';
import {Electron} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Penampang sel flash gerbang mengambang (skematis) + diagram pita penghalang oksida.
const X0 = 200;
const X1 = 1000;
const L = {cg: [430, 500], co: [500, 535], fg: [535, 605], to: [605, 640], sub: [640, 820]};
const GX0 = 380;
const GX1 = 820;
const BD = {x0: 1300, x1: 1800, ch: 1420, ox1: 1570, base: 620, top: 360, drop: 200};
const NE = 9;
const fgPos = (k: number, t: number): [number, number] => [GX0 + 40 + ((k + 0.5) / NE) * (GX1 - GX0 - 80) + 6 * Math.sin(t * 3 + k), (L.fg[0] + L.fg[1]) / 2 + 12 * Math.sin(t * 2.3 + k * 1.7)];

export const Flash: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const cell = ramp(t, cue(0) + 0.2, cue(0) + 1.2, BACK);
  const names = ramp(t, cue(1) + 0.3, cue(1) + 1.2);
  const held = win(t, cue(2), cue(3) + 0.3, 0.6, 0.5);
  const volt = win(t, cue(3), cue(5) - 0.2, 0.6, 0.4);
  const tilt = ramp(t, wordOf(3, 'memiringkan') - 0.3, wordOf(3, 'memiringkan') + 1.2, EASE_IN_OUT) * (1 - ramp(t, cue(6) - 0.3, cue(6) + 0.3));
  const fill = ramp(t, cue(4), cue(4) + 3, EASE_IN_OUT);
  const bit = ramp(t, cue(5), cue(5) + 0.7);
  const erase = ramp(t, cue(6) + 0.3, cue(7) - 0.3, EASE_IN_OUT);
  const ev = win(t, cue(6), cue(7) + 0.2, 0.5, 0.5);
  const thick = ramp(t, cue(7), cue(7) + 0.8);
  const band = ramp(t, cue(2), cue(2) + 0.8);
  // jumlah elektron di gerbang mengambang
  const nIn = t < cue(3) ? NE * held : t < cue(4) ? 0 : t < cue(6) ? Math.floor(NE * fill + 0.001) : Math.round(NE * (1 - erase));
  const movingIn = t >= cue(4) && t < cue(5) + 1;
  const movingOut = t >= cue(6) && t < cue(7);
  const by = (x: number) => {
    // tepi atas penghalang oksida pada diagram pita, miring saat tegangan tulis
    const f = (x - BD.ch) / (BD.ox1 - BD.ch);
    return mix(BD.top, mix(BD.top, BD.base + BD.drop, f), tilt);
  };

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={cell} transform="translate(600 590) scale(1.22) translate(-600 -640)">
          {/* substrat & sumber/cerat */}
          <rect x={X0} y={L.sub[0]} width={X1 - X0} height={L.sub[1] - L.sub[0]} fill="#3a4a6a" opacity={0.6} />
          <rect x={X0} y={L.sub[0]} width={170} height={70} rx={10} fill="#6a5acd" opacity={0.6} />
          <rect x={X1 - 170} y={L.sub[0]} width={170} height={70} rx={10} fill="#6a5acd" opacity={0.6} />
          <rect x={GX0} y={L.to[0]} width={GX1 - GX0} height={L.to[1] - L.to[0]} fill="#cfe0ff" opacity={0.35 + 0.4 * thick} />
          <rect x={GX0} y={L.fg[0]} width={GX1 - GX0} height={L.fg[1] - L.fg[0]} rx={6} fill={C.gold} opacity={0.35} stroke={C.gold} strokeWidth={3} />
          <rect x={GX0} y={L.co[0]} width={GX1 - GX0} height={L.co[1] - L.co[0]} fill="#cfe0ff" opacity={0.3} />
          <rect x={GX0} y={L.cg[0]} width={GX1 - GX0} height={L.cg[1] - L.cg[0]} rx={6} fill="#8ea0c8" opacity={0.85} />
          <g opacity={names}>
            <Label x={GX1 + 30} y={(L.cg[0] + L.cg[1]) / 2} size={24} color={C.ink} anchor="start">
              gerbang kontrol
            </Label>
            <Label x={GX1 + 30} y={(L.fg[0] + L.fg[1]) / 2} size={24} color={C.gold} anchor="start" weight={700}>
              gerbang mengambang
            </Label>
            <Label x={GX1 + 30} y={(L.to[0] + L.to[1]) / 2 + 4} size={22} color="#cfe0ff" anchor="start">
              oksida tipis
            </Label>
            <Label x={X0 + 85} y={L.sub[0] + 35} size={22} color={C.ink}>
              sumber
            </Label>
            <Label x={X1 - 85} y={L.sub[0] + 35} size={22} color={C.ink}>
              cerat
            </Label>
            <Label x={(X0 + X1) / 2} y={L.sub[1] - 30} size={22} color={C.muted}>
              silikon
            </Label>
          </g>
          {/* elektron di gerbang mengambang */}
          {Array.from({length: NE}, (_, k) => {
            const [x, y] = fgPos(k, t);
            return <Electron key={k} x={x} y={y} r={9} opacity={k < nIn ? 1 : 0} />;
          })}
          {/* elektron menerowong masuk/keluar */}
          {movingIn || movingOut
            ? Array.from({length: 5}, (_, k) => {
                const ph = (t * 0.9 + k / 5) % 1;
                const x = GX0 + 60 + rand(k * 3.3) * (GX1 - GX0 - 120);
                const yy = movingIn ? mix(L.sub[0] + 30, (L.fg[0] + L.fg[1]) / 2, ph) : mix((L.fg[0] + L.fg[1]) / 2, L.sub[0] + 30, ph);
                return <Electron key={k} x={x} y={yy} r={8} opacity={Math.sin(Math.PI * ph)} />;
              })
            : null}
          <g opacity={held}>
            <Label x={(GX0 + GX1) / 2} y={L.cg[0] - 40} size={26} color={C.mint} weight={700}>
              terperangkap, tahan bertahun-tahun
            </Label>
          </g>
          <g opacity={volt}>
            <Label x={(GX0 + GX1) / 2} y={L.cg[0] - 40} size={34} color={C.red} weight={700} font="mono">
              +20 V
            </Label>
          </g>
          <g opacity={ev}>
            <Label x={(GX0 + GX1) / 2} y={L.cg[0] - 40} size={34} color={C.violet} weight={700} font="mono">
              hapus: tegangan dibalik
            </Label>
          </g>
          <g opacity={bit}>
            <rect x={X0} y={335} width={360} height={100} rx={14} fill="rgba(12,18,40,0.88)" stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} />
            <Label x={X0 + 180} y={370} size={24} color={C.cyan} weight={600}>
              ada elektron → bit 0
            </Label>
            <Label x={X0 + 180} y={407} size={24} color={C.muted} weight={600}>
              kosong → bit 1
            </Label>
          </g>
          <g opacity={thick}>
            <line x1={GX0 - 30} y1={L.to[0]} x2={GX0 - 30} y2={L.to[1]} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
            <Label x={GX0 - 44} y={(L.to[0] + L.to[1]) / 2} size={24} color={C.gold} anchor="end" weight={700}>
              beberapa nm
            </Label>
          </g>
        </g>
        {/* diagram pita */}
        <g opacity={band}>
          <Label x={(BD.x0 + BD.x1) / 2} y={300} size={24} color={C.ink} weight={600} opacity={1}>
            penghalang oksida (diagram energi)
          </Label>
          <line x1={BD.x0} y1={BD.base} x2={BD.ch} y2={BD.base} stroke={C.cyan} strokeWidth={4} />
          <path d={`M${BD.ch},${BD.base} L${BD.ch},${by(BD.ch)} L${BD.ox1},${by(BD.ox1)} L${BD.ox1},${BD.base + BD.drop * tilt}`} fill={C.red} fillOpacity={0.15} stroke={C.red} strokeWidth={4} />
          <line x1={BD.ox1} y1={BD.base + BD.drop * tilt} x2={BD.x1} y2={BD.base + BD.drop * tilt} stroke={C.gold} strokeWidth={4} />
          <Label x={(BD.x0 + BD.ch) / 2} y={BD.base + 34} size={20} color={C.cyan}>
            kanal
          </Label>
          <Label x={(BD.ox1 + BD.x1) / 2} y={BD.base + BD.drop * tilt + 34} size={20} color={C.gold}>
            gerbang mengambang
          </Label>
          <Label x={(BD.ch + BD.ox1) / 2} y={BD.top - 26} size={20} color={C.red}>
            oksida
          </Label>
          <g opacity={tilt}>
            <line x1={BD.ch} y1={BD.base - 14} x2={BD.ch + (BD.ox1 - BD.ch) * mix(1, 0.565, tilt) - 8} y2={BD.base - 14} stroke={C.mint} strokeWidth={4} markerEnd="url(#arrow-mint)" />
            <Label x={BD.ch + 40} y={BD.base - 50} size={22} color={C.mint} weight={700} anchor="start">
              penghalang efektif menipis
            </Label>
          </g>
          <g opacity={ramp(t, wordOf(4, 'Fowler') - 0.3, wordOf(4, 'Fowler') + 0.4)}>
            <Label x={(BD.x0 + BD.x1) / 2} y={250} size={26} color={C.mint} weight={700}>
              penerowongan Fowler–Nordheim
            </Label>
          </g>
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
