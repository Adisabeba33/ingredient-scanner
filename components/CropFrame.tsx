"use client";

/**
 * The draggable rectangle — drag the body to move it, drag a corner to resize.
 *
 * It exists on its own because it is now used twice, over two different things:
 * over the live camera while aiming, and over the photograph afterwards to trim
 * what the aim caught anyway. Both need the same mask, the same corner handles
 * and the same thumb-sized hit areas, and a rectangle that behaved differently
 * before and after the shutter would be its own small cruelty.
 *
 * Everything is fractions of this box (0–1), so it never needs to know a pixel,
 * a resolution, or which of the two it is drawn over. What those fractions MEAN
 * is the caller's business: over an object-cover video they are on-screen
 * fractions that still have to be inverted to source coordinates; over a
 * contained photo they are the source coordinates already.
 *
 * Children render behind it. They can carry their own z-index — the mask sits
 * at z-10 and the frame at z-20, so a control at z-30 stays on top of both
 * regardless of where it appears in the markup.
 */

import { useCallback, useEffect, useRef } from "react";
import { Move } from "lucide-react";
import type { NormalizedRect } from "@/lib/image";

// Don't let the frame collapse to nothing.
const MIN_W = 0.14;
const MIN_H = 0.08;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// Which edges a corner handle controls.
const CORNERS: { id: string; left: boolean; top: boolean }[] = [
  { id: "tl", left: true, top: true },
  { id: "tr", left: false, top: true },
  { id: "bl", left: true, top: false },
  { id: "br", left: false, top: false },
];

interface DragState {
  mode: "move" | "resize";
  corner?: { left: boolean; top: boolean };
  startFx: number;
  startFy: number;
  startRect: NormalizedRect;
}

export function CropFrame({
  rect,
  onChange,
  className = "",
  style,
  children,
}: {
  rect: NormalizedRect;
  onChange: (rect: NormalizedRect) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // The live handler reads these from a ref: the listeners are attached once,
  // and a drag started with one rectangle must finish against that rectangle.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const pointerFraction = useCallback((clientX: number, clientY: number) => {
    const area = areaRef.current;
    if (!area) return { fx: 0, fy: 0 };
    const b = area.getBoundingClientRect();
    return {
      fx: b.width ? (clientX - b.left) / b.width : 0,
      fy: b.height ? (clientY - b.top) / b.height : 0,
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      e.preventDefault();
      const { fx, fy } = pointerFraction(e.clientX, e.clientY);
      const dfx = fx - d.startFx;
      const dfy = fy - d.startFy;
      const s = d.startRect;

      if (d.mode === "move") {
        onChangeRef.current({
          ...s,
          x: clamp(s.x + dfx, 0, 1 - s.w),
          y: clamp(s.y + dfy, 0, 1 - s.h),
        });
        return;
      }
      // resize from a corner
      const c = d.corner!;
      let { x, y, w, h } = s;
      if (c.left) {
        x = clamp(s.x + dfx, 0, s.x + s.w - MIN_W);
        w = s.w - (x - s.x);
      } else {
        w = clamp(s.w + dfx, MIN_W, 1 - s.x);
      }
      if (c.top) {
        y = clamp(s.y + dfy, 0, s.y + s.h - MIN_H);
        h = s.h - (y - s.y);
      } else {
        h = clamp(s.h + dfy, MIN_H, 1 - s.y);
      }
      onChangeRef.current({ x, y, w, h });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [pointerFraction]);

  const beginMove = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const { fx, fy } = pointerFraction(e.clientX, e.clientY);
      dragRef.current = { mode: "move", startFx: fx, startFy: fy, startRect: rect };
    },
    [pointerFraction, rect]
  );

  const beginResize = useCallback(
    (e: React.PointerEvent, corner: { left: boolean; top: boolean }) => {
      e.stopPropagation();
      const { fx, fy } = pointerFraction(e.clientX, e.clientY);
      dragRef.current = {
        mode: "resize",
        corner,
        startFx: fx,
        startFy: fy,
        startRect: rect,
      };
    },
    [pointerFraction, rect]
  );

  return (
    <div ref={areaRef} style={style} className={`relative ${className}`}>
      {children}

      {/* Dark mask outside the frame (four bands, so the frame stays clear). */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className="absolute inset-x-0 top-0 bg-ink/55"
          style={{ height: `${rect.y * 100}%` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 bg-ink/55"
          style={{ height: `${(1 - rect.y - rect.h) * 100}%` }}
        />
        <div
          className="absolute left-0 bg-ink/55"
          style={{
            top: `${rect.y * 100}%`,
            height: `${rect.h * 100}%`,
            width: `${rect.x * 100}%`,
          }}
        />
        <div
          className="absolute right-0 bg-ink/55"
          style={{
            top: `${rect.y * 100}%`,
            height: `${rect.h * 100}%`,
            width: `${(1 - rect.x - rect.w) * 100}%`,
          }}
        />
      </div>

      <div
        onPointerDown={beginMove}
        data-testid="crop-frame"
        className="absolute z-20 touch-none rounded-2xl border-[3px] border-amber"
        style={{
          left: `${rect.x * 100}%`,
          top: `${rect.y * 100}%`,
          width: `${rect.w * 100}%`,
          height: `${rect.h * 100}%`,
        }}
      >
        {/* move affordance */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Move size={22} strokeWidth={1.6} className="text-white/70" aria-hidden="true" />
        </div>
        {/* corner handles */}
        {CORNERS.map((c) => (
          <button
            key={c.id}
            aria-label={`Resize ${c.id}`}
            onPointerDown={(e) => beginResize(e, { left: c.left, top: c.top })}
            className="absolute h-10 w-10 touch-none"
            style={{
              left: c.left ? -20 : undefined,
              right: c.left ? undefined : -20,
              top: c.top ? -20 : undefined,
              bottom: c.top ? undefined : -20,
            }}
          >
            <span
              className={`absolute h-6 w-6 rounded-full border-[3px] border-amber bg-ink/60 ${
                c.left ? "left-2" : "right-2"
              } ${c.top ? "top-2" : "bottom-2"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
