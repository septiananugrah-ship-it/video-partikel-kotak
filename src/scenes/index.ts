import type React from 'react';
import {Absorb} from './Absorb';
import {Box2D} from './Box2D';
import {Box3D} from './Box3D';
import {ChemTunnel} from './ChemTunnel';
import {Dyes} from './Dyes';
import {Energy} from './Energy';
import {Finite} from './Finite';
import {Flash} from './Flash';
import {Free} from './Free';
import {Hook} from './Hook';
import {Outro} from './Outro';
import {Pi} from './Pi';
import {QDot} from './QDot';
import {Recap} from './Recap';
import {Roadmap} from './Roadmap';
import {STM} from './STM';
import {Title} from './Title';
import {Tunnel} from './Tunnel';
import {Walls} from './Walls';
import {Wave} from './Wave';
import {Zero} from './Zero';

// Pemetaan id scene di naskah → komponen visual.
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  title: Title,
  roadmap: Roadmap,
  free: Free,
  walls: Walls,
  energy: Energy,
  wave: Wave,
  zero: Zero,
  box2d: Box2D,
  box3d: Box3D,
  finite: Finite,
  tunnel: Tunnel,
  absorb: Absorb,
  pi: Pi,
  dyes: Dyes,
  chemtunnel: ChemTunnel,
  qdot: QDot,
  stm: STM,
  flash: Flash,
  recap: Recap,
  outro: Outro,
};
