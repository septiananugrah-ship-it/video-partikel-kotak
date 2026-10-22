import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp, win} from '../anim';
import {Formula, Frac, Label, Stage, Sub, Sup, V} from '../components/primitives';
import {E1_EV, Electron, PhotonPacket, areaPath, id, ncol, plotPath, psi, wlColor} from '../components/viz';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Kiri: tangga energi kotak 1 nm (eV). Kanan: spektrum, lalu integran momen dipol transisi.
const LD = {x0: 220, x1: 680, bot: 800, per: 95};
const yE = (e: number) => LD.bot - e * LD.per;
const En = (n: number) => E1_EV * n * n;
const SP = {x0: 1000, x1: 1780, y: 560, l0: 300, l1: 1300};
const sx = (nm: number) => mix(SP.x0, SP.x1, (nm - SP.l0) / (SP.l1 - SP.l0));
const PA = {x: 1010, w: 760};

const integrand = (nf: number) => (u: number) => psi(nf, u) * (u - 0.5) * 2 * psi(1, u);

const Panel: React.FC<{y: number; nf: number; ok: boolean; p: number; t: number}> = ({y, nf, ok, p}) => {
  const box = {x: PA.x, y, w: PA.w, sy: 100};
  const f = integrand(nf);
  return (
    <g opacity={p}>
      <rect x={PA.x - 30} y={y - 135} width={PA.w + 60} height={215} rx={16} fill="rgba(10,14,30,0.7)" stroke={ok ? C.mint : C.red} strokeOpacity={0.45} strokeWidth={2} />
      <line x1={PA.x} y1={y} x2={PA.x + PA.w} y2={y} stroke={C.muted} strokeWidth={1.5} />
      <line x1={PA.x + PA.w / 2} y1={y - 110} x2={PA.x + PA.w / 2} y2={y + 60} stroke={C.faint} strokeWidth={2} strokeDasharray="6 6" />
      <path d={plotPath((u) => psi(1, u), 0, 1, {...box, sy: 30})} fill="none" stroke={ncol(1)} strokeWidth={2} opacity={0.6} />
      <path d={plotPath((u) => psi(nf, u), 0, 1, {...box, sy: 30})} fill="none" stroke={ncol(nf)} strokeWidth={2} opacity={0.6} />
      <path d={areaPath((u) => Math.max(0, f(u)), 0, 1, box)} fill={C.gold} opacity={0.55} />
      <path d={areaPath((u) => Math.min(0, f(u)), 0, 1, box)} fill={C.cyan} opacity={0.55} />
      <path d={plotPath(f, 0, 1, box)} fill="none" stroke={C.ink} strokeWidth={3} />
      <Label x={PA.x} y={y - 110} size={28} color={C.ink} anchor="start" weight={700}>
        {`1 → ${nf}`}
      </Label>
      <Label x={PA.x + PA.w} y={y - 110} size={26} color={ok ? C.mint : C.red} anchor="end" weight={700}>
        {ok ? '∫ ≠ 0 → diizinkan ✓' : '∫ = 0 → terlarang ✗'}
      </Label>
      <Label x={PA.x + PA.w / 2} y={y + 72} size={20} color={C.muted}>
        integran ψ{nf === 2 ? '₂' : '₃'} · x · ψ₁ (emas +, biru −; x diukur dari tengah)
      </Label>
    </g>
  );
};

export const Absorb: React.FC = () => {
  const {t, cue} = useScene();
  const lad = ramp(t, -0.2, 0.9);
  const ph = ramp(t, cue(1) + 0.2, cue(1) + 2.2, EASE_IN_OUT);
  const jump = ramp(t, cue(1) + 2.1, cue(1) + 2.7, BACK);
  const strip = win(t, cue(4), cue(5) - 0.1, 0.7, 0.5);
  const m1099 = ramp(t, cue(4) + 1.2, cue(4) + 2);
  const pan3 = ramp(t, cue(7) - 0.2, cue(7) + 0.7);
  const pan2 = ramp(t, cue(8) - 0.2, cue(8) + 0.7);
  const a13 = ramp(t, cue(7), cue(7) + 0.6);
  const a12 = ramp(t, cue(8), cue(8) + 0.6);
  const evL = ramp(t, cue(4), cue(4) + 0.6);
  const ey = mix(yE(En(1)), yE(En(2)), jump);
  const reset = t > cue(5) ? 1 : 0;

  return (
    <AbsoluteFill>
      <Stage>
        <g opacity={lad}>
          <line x1={LD.x0 - 60} y1={LD.bot + 10} x2={LD.x0 - 60} y2={200} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={LD.x0 - 60} y={178} size={26} color={C.muted} font="serif" italic>
            E
          </Label>
          {[1, 2, 3, 4].map((n) => (
            <g key={n}>
              <line x1={LD.x0} y1={yE(En(n))} x2={LD.x1} y2={yE(En(n))} stroke={ncol(n)} strokeWidth={4} />
              <Label x={LD.x0 - 20} y={yE(En(n))} size={24} color={ncol(n)} anchor="end" font="serif" italic>
                n = {n}
              </Label>
              <Label x={LD.x1 + 18} y={yE(En(n))} size={22} color={ncol(n)} anchor="start" font="mono">
                {`${id(En(n), n === 1 ? 3 : 2)} eV`}
              </Label>
            </g>
          ))}
          <Label x={(LD.x0 + LD.x1) / 2} y={LD.bot + 40} size={22} color={C.muted}>
            elektron, kotak L = 1 nm
          </Label>
        </g>
        {/* foton diserap */}
        <PhotonPacket x={mix(1300, 520, ph)} y={mix(330, yE(En(1)) - 20, ph)} wavelength={60} color="#ff5050" amp={24} len={230} opacity={(1 - jump) * ramp(t, cue(1) + 0.2, cue(1) + 0.6)} angle={-20} phase={-t * 14} />
        <Electron x={450} y={reset ? yE(En(1)) : ey} r={12} opacity={ramp(t, 0.2, 0.8)} />
        <g opacity={jump * (1 - reset)}>
          <line x1={520} y1={yE(En(1)) - 8} x2={520} y2={yE(En(2)) + 12} stroke={C.gold} strokeWidth={4} markerEnd="url(#arrow-gold)" />
          <Label x={540} y={(yE(En(1)) + yE(En(2))) / 2} size={24} color={C.gold} anchor="start" weight={700} opacity={evL}>
            ΔE = 1,13 eV
          </Label>
        </g>
        {/* spektrum */}
        <g opacity={strip}>
          <rect x={SP.x0} y={SP.y - 30} width={SP.x1 - SP.x0} height={60} rx={8} fill="#141b33" />
          <rect x={sx(380)} y={SP.y - 30} width={sx(750) - sx(380)} height={60} fill="url(#rainbow-h)" opacity={0.85} />
          <rect x={sx(750)} y={SP.y - 30} width={SP.x1 - sx(750)} height={60} fill="#5a1010" opacity={0.6} />
          {[400, 700, 1000, 1300].map((nm) => (
            <Label key={nm} x={sx(nm)} y={SP.y + 54} size={20} color={C.muted} font="mono">
              {nm}
            </Label>
          ))}
          <Label x={(sx(380) + sx(750)) / 2} y={SP.y - 56} size={22} color={C.ink}>
            cahaya tampak
          </Label>
          <Label x={(sx(750) + SP.x1) / 2} y={SP.y - 56} size={22} color={wlColor(800)}>
            inframerah
          </Label>
          <g opacity={m1099}>
            <line x1={sx(1099)} y1={SP.y - 46} x2={sx(1099)} y2={SP.y + 36} stroke={C.gold} strokeWidth={5} />
            <Label x={sx(1099)} y={SP.y + 100} size={28} color={C.gold} weight={700} font="mono">
              λ ≈ 1099 nm
            </Label>
          </g>
        </g>
        {/* panah transisi pada tangga */}
        <g opacity={a13}>
          <line x1={330} y1={yE(En(1)) - 8} x2={330} y2={yE(En(3)) + 12} stroke={C.red} strokeWidth={4} strokeDasharray="10 7" markerEnd="url(#arrow-red)" />
          <Label x={300} y={(yE(En(1)) + yE(En(3))) / 2} size={30} color={C.red} anchor="end" weight={700}>
            ✗
          </Label>
        </g>
        <g opacity={a12}>
          <line x1={590} y1={yE(En(1)) - 8} x2={590} y2={yE(En(2)) + 12} stroke={C.mint} strokeWidth={5} markerEnd="url(#arrow-mint)" />
          <Label x={612} y={(yE(En(1)) + yE(En(2))) / 2} size={30} color={C.mint} anchor="start" weight={700}>
            ✓
          </Label>
        </g>
        <Panel y={480} nf={3} ok={false} p={pan3} t={t} />
        <Panel y={745} nf={2} ok p={pan2} t={t} />
      </Stage>
      <Formula x={1390} y={260} p={win(t, cue(2), cue(3) - 0.1, 0.7, 0.4) * ramp(t, cue(2), cue(2) + 0.7, BACK)} accent={C.gold} caption="energi foton = selisih dua tingkat">
        Δ<V color={C.gold}>E</V>&nbsp;=&nbsp;
        <Frac n={<>(<V>n</V><Sub>akhir</Sub><Sup>2</Sup> − <V>n</V><Sub>awal</Sub><Sup>2</Sup>)&thinsp;<V>h</V><Sup>2</Sup></>} d={<>8<V>mL</V><Sup>2</Sup></>} />
      </Formula>
      <Formula x={1390} y={260} p={win(t, cue(3), cue(6) - 0.1, 0.7, 0.4)} accent={C.gold} caption="panjang gelombang foton (bukan de Broglie)">
        <V>λ</V>&nbsp;=&nbsp;
        <Frac n={<><V>hc</V></>} d={<>Δ<V>E</V></>} />
        &nbsp;=&nbsp;
        <Frac n="1239,8 eV·nm" d="1,128 eV" />
      </Formula>
      <Formula x={1390} y={260} p={win(t, cue(6), cue(9) - 0.1, 0.7, 0.4)} accent={C.violet} caption="momen dipol transisi (pendekatan dipol listrik)">
        <V>μ</V>
        <Sub>fi</Sub>&nbsp;∝&nbsp;
        <span style={{fontSize: '1.2em'}}>∫</span>&thinsp;<V>ψ</V>
        <Sub>f</Sub>&thinsp;<V>x</V>&thinsp;<V>ψ</V>
        <Sub>i</Sub>&thinsp;<V>dx</V>
      </Formula>
      <Formula x={1390} y={260} p={ramp(t, cue(9), cue(9) + 0.7)} accent={C.mint} caption="1→2 ✓ · 1→3 ✗ · 1→4 ✓ · 2→3 ✓">
        <V>n</V>
        <Sub>awal</Sub>&nbsp;+&nbsp;<V>n</V>
        <Sub>akhir</Sub>&nbsp;=&nbsp;ganjil
      </Formula>
    </AbsoluteFill>
  );
};
