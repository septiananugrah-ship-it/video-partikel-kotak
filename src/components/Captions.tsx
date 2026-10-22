import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {EASE, ramp} from '../anim';
import {C, FONT} from '../theme';
import {ALL_LINES, type TWord} from '../timeline.ts';

type Page = {words: TWord[]; start: number; end: number};

const MAX_WORDS = 8;
const MAX_CHARS = 46;

// Pecah setiap baris narasi menjadi "halaman" subtitle maksimal satu-dua baris layar.
const PAGES: Page[] = (() => {
  const pages: Page[] = [];
  for (const line of ALL_LINES) {
    let cur: TWord[] = [];
    const flush = () => {
      if (cur.length) pages.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
      cur = [];
    };
    line.words.forEach((w, i) => {
      cur.push(w);
      const chars = cur.reduce((s, x) => s + x.text.length + 1, 0);
      const remaining = line.words.length - i - 1;
      const punct = /[,;:.]$/.test(w.text);
      if (remaining === 0) return;
      if (cur.length >= MAX_WORDS || chars >= MAX_CHARS || (punct && cur.length >= 3 && remaining >= 3)) flush();
    });
    flush();
  }
  // Setiap halaman bertahan sampai halaman berikutnya muncul (maks. 1,2 dtk setelah kata terakhir).
  return pages.map((p, i) => {
    const next = pages[i + 1];
    const hold = p.end + 1.2;
    return {...p, start: p.start - 0.12, end: next ? Math.min(hold, next.start - 0.12) : hold};
  });
})();

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const page = PAGES.find((p) => t >= p.start && t < p.end);
  if (!page) return null;
  const pin = ramp(t, page.start, page.start + 0.25);
  const pout = 1 - ramp(t, page.end - 0.2, page.end);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 78, pointerEvents: 'none'}}>
      <div
        style={{
          maxWidth: 1460,
          textAlign: 'center',
          fontFamily: FONT.sans,
          fontSize: 50,
          fontWeight: 500,
          lineHeight: 1.25,
          letterSpacing: -0.3,
          opacity: pin * pout,
          translate: `0px ${(1 - pin) * 14}px`,
          textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
        }}
      >
        {page.words.map((w, i) => {
          const spoken = ramp(t, w.start - 0.04, w.start + 0.14);
          // kata yang sedang diucapkan sedikit membesar, naik-turun halus (tanpa lompatan)
          const active = Math.min(ramp(t, w.start - 0.08, w.start + 0.06), 1 - ramp(t, w.end, w.end + 0.18));
          const appear = interpolate(t, [page.start + i * 0.025, page.start + i * 0.025 + 0.3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: EASE,
          });
          const base = 0.42 + 0.58 * spoken;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.28em',
                opacity: appear * base,
                translate: `0px ${(1 - appear) * 10}px`,
                scale: String(1 + 0.05 * active),
                color: w.hl ? interpolateColors(spoken, [0, 1], [C.ink, C.gold]) : C.ink,
                fontWeight: w.hl ? 700 : 500,
                textShadow: w.hl && spoken > 0 ? `0 0 ${18 * spoken}px rgba(255,194,74,0.55), 0 2px 18px rgba(0,0,0,0.85)` : undefined,
                position: 'relative',
              }}
            >
              {w.text}
              {w.hl ? (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: -4,
                    height: 4,
                    borderRadius: 2,
                    width: `${100 * ramp(t, w.start, w.end + 0.1)}%`,
                    background: C.gold,
                    boxShadow: `0 0 12px ${C.gold}`,
                  }}
                />
              ) : null}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
