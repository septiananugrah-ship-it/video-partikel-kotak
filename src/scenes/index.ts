import type React from 'react';
import {Box2D} from './Box2D';
import {Box3D} from './Box3D';
import {Energy} from './Energy';
import {Free} from './Free';
import {Hook} from './Hook';
import {Roadmap} from './Roadmap';
import {Title} from './Title';
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
};
