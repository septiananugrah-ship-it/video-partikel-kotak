import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, rand, ramp, win} from '../anim';
import {Badge, Formula, Frac, Glow, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {Electron, Vial, wlColor} from '../components/viz';
import {QD} from './Hook';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Celah optik skematis: E ≈ 1,74 eV + c/d² (CdSe; hanya untuk tren warna).
const eOpt = (d: number) => 1.74 + 3.84 / (d * d);
const lam = (d: number) => 1239.8 / eOpt(d);
const SPH = {x: 1300, y: 580, r: 210};
const LATT = (() => {
  const pts: {x: number; y: number; cd: boolean}[] = [];
  const a = 40;
  for (let i = -7; i <= 7; i++)
    for (let j = -7; j <= 7; j++) {
      const x = i * a + (j % 2 ? a / 2 : 0);
      const y = j * a * 0.866;
      if (Math.hypot(x, y) < SPH.r - 12) pts.push({x, y, cd: (i + j) % 2 === 0});
    }
  return pts;
})();
const SIZES = [2, 2.6, 3.3, 4.3, 6];

export const QDot: React.FC = () => {
  const {t, cue} = useScene();
  const A = 1 - ramp(t, cue(4) - 0.4, cue(4) + 0.3);
  const vials = ramp(t, cue(0) - 0.2, cue(0) + 0.8);
  const sph = ramp(t, cue(1), cue(1) + 1, BACK);
  const eh = ramp(t, cue(2), cue(2) + 0.8);
  const Bp = win(t, cue(4) - 0.2, cue(6) - 0.2, 0.7, 0.6);
  const row = (i: number) => ramp(t, cue(4) + i * 0.35, cue(4) + 0.6 + i * 0.35, BACK);
  const flask = ramp(t, cue(5), cue(5) + 0.8);
  const grow = ramp(t, cue(5) + 0.8, cue(6) - 0.6, EASE_IN_OUT);
  const dNow = mix(2, 6, grow);
  const Cp = ramp(t, cue(6) - 0.2, cue(6) + 0.8);
  const nob = ramp(t, cue(8), cue(8) + 0.8, BACK);
  const inp = ramp(t, cue(7), cue(7) + 0.7, BACK) * (1 - nob);
  const flow = (t * 0.6) % 1;

  return (
    <AbsoluteFill>
      <Stage>
        {/* A: botol & satu butir */}
        <g opacity={A}>
          {QD.map((q, i) => (
            <Vial key={i} x={230 + i * 200} y={520} w={130} h={280} color={q.color} glow={vials} opacity={vials} />
          ))}
          <g opacity={sph}>
            <line x1={430} y1={420} x2={SPH.x - SPH.r} y2={SPH.y - 40} stroke={QD[0].color} strokeWidth={2} strokeDasharray="6 8" opacity={0.6} />
            <Glow x={SPH.x} y={SPH.y} r={SPH.r * 1.5} color="cyan" opacity={0.25} />
            {LATT.map((a, i) => (
              <circle key={i} cx={SPH.x + a.x} cy={SPH.y + a.y} r={a.cd ? 12 : 15} fill={a.cd ? '#e8c46a' : '#ff8f3a'} opacity={0.4 + 0.2 * rand(i)} />
            ))}
            <circle cx={SPH.x} cy={SPH.y} r={SPH.r} fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="10 8" />
            <Label x={SPH.x} y={SPH.y + SPH.r + 40} size={26} color={C.muted}>
              titik kuantum CdSe · beberapa nm
            </Label>
            <g opacity={eh}>
              <Electron x={SPH.x + 140 * Math.sin(t * 2.1)} y={SPH.y + 110 * Math.sin(t * 1.4 + 1)} r={15} />
              <g transform={`translate(${SPH.x + 130 * Math.sin(t * 1.6 + 2)} ${SPH.y + 120 * Math.cos(t * 1.9)})`}>
                <circle r={15} fill="none" stroke={C.red} strokeWidth={4} />
                <text textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={700} fontSize={16} fill={C.red}>
                  h⁺
                </text>
              </g>
              <Label x={SPH.x + SPH.r + 30} y={SPH.y - 60} size={24} color={C.cyan} anchor="start">
                elektron
              </Label>
              <Label x={SPH.x + SPH.r + 30} y={SPH.y - 20} size={24} color={C.red} anchor="start">
                hole (h⁺)
              </Label>
            </g>
          </g>
        </g>
        {/* B: ukuran → warna */}
        <g opacity={Bp}>
          {SIZES.map((d, i) => {
            const x = 300 + i * 240;
            const col = wlColor(lam(d));
            const p = row(i);
            const gapH = (eOpt(d) / 3) * 220;
            return (
              <g key={i} opacity={p}>
                <Glow x={x} y={330} r={d * 26} color="white" opacity={0.15} />
                <circle cx={x} cy={330} r={d * 14} fill={col} opacity={0.9} filter="url(#glow)" />
                <Label x={x} y={330 + d * 14 + 32} size={24} color={C.ink} font="mono">
                  {`${String(d).replace('.', ',')} nm`}
                </Label>
                <rect x={x - 40} y={780 - gapH} width={80} height={gapH} rx={8} fill={col} opacity={0.35} stroke={col} strokeWidth={2} />
                <Label x={x} y={780 - gapH - 22} size={22} color={col} font="mono" weight={700}>
                  {`${Math.round(lam(d))} nm`}
                </Label>
              </g>
            );
          })}
          <Label x={150} y={690} size={22} color={C.muted} anchor="start" opacity={row(0)}>
            celah
          </Label>
          <Label x={960} y={830} size={22} color={C.muted} opacity={row(4)}>
            kecil → pengurungan kuat → biru · besar → pengurungan lemah → merah (skematis)
          </Label>
          <g opacity={flask * (1 - ramp(t, cue(6) - 0.6, cue(6) - 0.2))}>
            <rect x={0} y={180} width={1920} height={680} fill="#04060c" opacity={0.75} />
            <path d="M860,330 L860,450 L740,700 Q730,740 770,740 L1150,740 Q1190,740 1180,700 L1060,450 L1060,330 Z" fill={wlColor(lam(dNow))} opacity={0.75} stroke="#c8d6ff" strokeWidth={4} />
            <rect x={840} y={310} width={240} height={30} rx={8} fill="#2a3352" />
            <Glow x={960} y={640} r={300} color="white" opacity={0.1} />
            <Label x={960} y={260} size={30} color={C.ink} weight={600}>
              waktu pertumbuhan kristal →
            </Label>
            <rect x={1260} y={520} width={400} height={18} rx={9} fill={C.faint} />
            <rect x={1260} y={520} width={400 * grow} height={18} rx={9} fill={C.gold} />
            <Label x={1460} y={580} size={28} color={C.gold} font="mono" weight={700}>
              {`Ø ≈ ${dNow.toFixed(1).replace('.', ',')} nm`}
            </Label>
          </g>
        </g>
        {/* C: layar QLED */}
        <g opacity={Cp * (1 - 0.6 * nob)}>
          <rect x={300} y={720} width={760} height={50} rx={10} fill="#3050ff" opacity={0.85} filter="url(#glow)" />
          <Label x={680} y={745} size={24} color="#fff" weight={700}>
            LED biru
          </Label>
          <rect x={300} y={520} width={760} height={60} rx={10} fill="rgba(200,215,255,0.08)" stroke="#c8d6ff" strokeWidth={2} />
          {Array.from({length: 40}, (_, k) => (
            <circle key={k} cx={320 + k * 18.5} cy={550 + 10 * Math.sin(k * 2.3)} r={7} fill={k % 2 ? '#ff3020' : '#2fe060'} opacity={0.9} />
          ))}
          <Label x={1080} y={550} size={24} color={C.ink} anchor="start" weight={600}>
            lapisan titik kuantum
          </Label>
          {[0, 1, 2, 3, 4].map((k) => (
            <line key={k} x1={360 + k * 160} y1={712 - flow * 100} x2={360 + k * 160} y2={672 - flow * 100} stroke="#3050ff" strokeWidth={6} opacity={0.8} />
          ))}
          {[
            ['#ff3020', 400],
            ['#2fe060', 680],
            ['#3b6cff', 960],
          ].map(([col, x], k) => (
            <g key={k}>
              <line x1={Number(x)} y1={500} x2={Number(x)} y2={330} stroke={String(col)} strokeWidth={8} markerEnd="url(#arrow-ink)" opacity={0.9} />
            </g>
          ))}
          {/* spektrum sempit */}
          <line x1={1240} y1={760} x2={1760} y2={760} stroke={C.muted} strokeWidth={2} />
          {[
            [460, '#3b6cff'],
            [530, '#2fe060'],
            [630, '#ff3020'],
          ].map(([nm, col], k) => (
            <path
              key={k}
              d={Array.from({length: 121}, (_, i) => {
                const l = 400 + (300 * i) / 120;
                return `${i ? 'L' : 'M'}${(1240 + (520 * (l - 400)) / 300).toFixed(1)},${(760 - 300 * Math.exp(-(((l - Number(nm)) / 13) ** 2))).toFixed(1)}`;
              }).join(' ')}
              fill="none"
              stroke={String(col)}
              strokeWidth={4}
            />
          ))}
          <Label x={1500} y={420} size={24} color={C.ink} weight={600}>
            pita emisi sempit → warna murni
          </Label>
          {[400, 500, 600, 700].map((nm) => (
            <Label key={nm} x={1240 + (520 * (nm - 400)) / 300} y={786} size={18} color={C.muted} font="mono">
              {nm}
            </Label>
          ))}
        </g>
      </Stage>
      <Formula x={1300} y={240} p={win(t, cue(3), cue(4) - 0.2, 0.7, 0.4) * ramp(t, cue(3), cue(3) + 0.7, BACK)} accent={C.cyan} caption={<>kubus sisi <V>L</V>, massa efektif <V>m</V><Sub>e</Sub>* &amp; <V>m</V><Sub>h</Sub>* (perkiraan sederhana)</>}>
        <V color={C.gold}>E</V>
        <Sub>foton</Sub>&nbsp;≈&nbsp;<V>E</V>
        <Sub>g</Sub>&nbsp;+&nbsp;
        <Frac n={<>3<V>h</V><Sup>2</Sup></>} d={<>8<V>L</V><Sup>2</Sup></>} />
        (
        <Frac n="1" d={<><V>m</V><Sub>e</Sub>*</>} />
        +
        <Frac n="1" d={<><V>m</V><Sub>h</Sub>*</>} />)
      </Formula>
      <Badge x={1300} y={300} text="InP · BEBAS KADMIUM" color={C.mint} opacity={inp} scale={0.85 + 0.15 * inp} />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 470,
          transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * nob})`,
          opacity: nob,
          padding: '30px 50px',
          borderRadius: 22,
          background: 'linear-gradient(160deg, rgba(40,32,10,0.92), rgba(12,10,4,0.92))',
          border: `2px solid ${C.gold}`,
          boxShadow: `0 0 60px ${C.gold}44`,
          textAlign: 'center',
          fontFamily: FONT.sans,
          color: C.ink,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: 4, color: C.gold}}>HADIAH NOBEL KIMIA 2023</div>
        <div style={{fontSize: 44, fontWeight: 700, marginTop: 10}}>Alexei Ekimov · Louis Brus · Moungi Bawendi</div>
        <div style={{fontSize: 26, color: C.muted, marginTop: 8}}>penemuan &amp; sintesis titik kuantum</div>
      </div>
    </AbsoluteFill>
  );
};
