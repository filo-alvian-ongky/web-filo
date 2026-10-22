"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { slideIn, stagger } from "@/lib/motion";

export const smallBtn =
  "pressable grid place-items-center w-9 h-9 rounded-full text-fg-2 hover:text-fg hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none";

// Layar sentuh: tahan baris sebentar lalu geser (seperti iOS / One UI).
// Jari yang langsung bergerak sebelum waktu tahan habis = scroll halaman biasa.
const HOLD_MS = 280;
const HOLD_TOLERANCE = 8; // px

function SortableRow({ value, index, count, onMove, onDrop, className, children }) {
  const controls = useDragControls();
  const rowRef = useRef(null);
  // Status tahan-sentuh (objek yang sama sepanjang umur baris; isinya yang diubah)
  const hold = useRef({ timer: null, down: false, active: false, x: 0, y: 0 });
  // Jari dilepas setelah baris terangkat → jangan dianggap ketukan tombol di bawah jari
  const swallowClick = useRef(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    const state = hold.current;
    // Selama baris terangkat, gerakan jari menggeser baris, bukan men-scroll halaman. Harus listener
    // native non-passive: listener sentuh React bersifat pasif sehingga preventDefault diabaikan.
    const blockScroll = (e) => {
      if (state.active && e.cancelable) e.preventDefault();
    };
    el.addEventListener("touchmove", blockScroll, { passive: false });
    return () => {
      el.removeEventListener("touchmove", blockScroll);
      clearTimeout(state.timer);
    };
  }, []);

  const startHold = (e) => {
    swallowClick.current = false;
    // Mouse & pena memakai pegangan di kiri; sentuhan cukup menahan baris di mana saja
    if (e.pointerType !== "touch" || !e.isPrimary) return;
    const state = hold.current;
    const origin = e.nativeEvent;
    clearTimeout(state.timer);
    Object.assign(state, { down: true, active: false, x: e.clientX, y: e.clientY });
    state.timer = setTimeout(() => {
      state.active = true;
      swallowClick.current = true;
      setLifted(true);
      navigator.vibrate?.(10);
      controls.start(origin);
    }, HOLD_MS);
  };

  const endHold = () => {
    const state = hold.current;
    clearTimeout(state.timer);
    state.down = false;
    if (!state.active) return;
    state.active = false;
    setLifted(false);
    setTimeout(() => (swallowClick.current = false), 400);
  };

  return (
    <Reorder.Item
      ref={rowRef}
      as="li"
      value={value}
      // Drag hanya dimulai lewat pegangan (mouse) atau setelah ditahan (sentuh), jadi halaman tetap bisa
      // di-scroll dan teks / tombol di baris tetap bisa diketuk
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setLifted(true)}
      onDragEnd={() => {
        setLifted(false);
        onDrop();
      }}
      onPointerDown={startHold}
      onPointerMove={(e) => {
        const state = hold.current;
        if (state.down && !state.active && (Math.abs(e.clientX - state.x) > HOLD_TOLERANCE || Math.abs(e.clientY - state.y) > HOLD_TOLERANCE)) endHold();
      }}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onContextMenu={(e) => hold.current.down && e.preventDefault()}
      onClickCapture={(e) => {
        if (!swallowClick.current) return;
        swallowClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
      variants={slideIn}
      className={`${className} select-none [-webkit-touch-callout:none] ${lifted ? "relative z-10 bg-surface shadow-float scale-[1.02]" : ""}`}
    >
      {/* Pegangan drag untuk mouse (desktop/tablet). Keyboard memakai tombol naik/turun di sebelahnya */}
      <span
        aria-hidden
        title="Geser untuk mengurutkan"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          controls.start(e);
        }}
        className="hidden sm:grid place-items-center w-6 h-11 -mr-1 shrink-0 rounded-lg text-fg-3 hover:text-fg-2 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={16} />
      </span>
      <div className="flex flex-col">
        <button type="button" className={`${smallBtn} w-8 h-7`} disabled={index === 0} onClick={() => onMove(index, -1)} aria-label="Naikkan">
          <ArrowUp size={15} />
        </button>
        <button type="button" className={`${smallBtn} w-8 h-7`} disabled={index === count - 1} onClick={() => onMove(index, 1)} aria-label="Turunkan">
          <ArrowDown size={15} />
        </button>
      </div>
      {children}
    </Reorder.Item>
  );
}

/**
 * Daftar yang bisa diurutkan (framer-motion Reorder): geser lewat pegangan (mouse), tahan lalu geser
 * baris (layar sentuh), atau tombol naik/turun (keyboard). Urutan baru dikirim ke onReorder(items) setelah
 * item dilepas / tombol ditekan — tidak di setiap pergeseran.
 * @param getKey        (item) => kunci unik
 * @param rowClassName  (item) => kelas <li>
 * @param renderRow     (item, index) => isi baris di kanan tombol urutan
 */
export default function SortableList({ items, getKey, onReorder, rowClassName, renderRow, className }) {
  // Urutan sementara selama item digeser
  const [dragOrder, setDragOrder] = useState(null);
  const pending = useRef(null);
  const list = dragOrder ?? items;

  const move = (index, delta) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onReorder(next);
  };

  const reorder = (keys) => {
    const byKey = new Map(list.map((item) => [getKey(item), item]));
    const next = keys.map((k) => byKey.get(k));
    pending.current = next;
    setDragOrder(next);
  };

  const drop = () => {
    const next = pending.current;
    pending.current = null;
    setDragOrder(null);
    if (next && next.some((item, i) => getKey(item) !== getKey(items[i]))) onReorder(next);
  };

  return (
    <>
      <Reorder.Group
        as="ol"
        axis="y"
        values={list.map(getKey)}
        onReorder={reorder}
        variants={stagger(0.04, 0.15)}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {list.map((item, i) => (
          <SortableRow key={getKey(item)} value={getKey(item)} index={i} count={list.length} onMove={move} onDrop={drop} className={rowClassName(item)}>
            {renderRow(item, i)}
          </SortableRow>
        ))}
      </Reorder.Group>
      {/* Petunjuk khusus layar sentuh (pegangan geser hanya untuk mouse) */}
      {list.length > 1 && <p className="hidden pointer-coarse:block px-3 pt-2 pb-1 text-xs text-fg-3">Tahan baris sebentar lalu geser untuk mengubah urutan.</p>}
    </>
  );
}
