"use client";

import { useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { slideIn, stagger } from "@/lib/motion";

export const smallBtn =
  "pressable grid place-items-center w-9 h-9 rounded-full text-fg-2 hover:text-fg hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none";

function SortableRow({ value, index, count, onMove, onDrop, className, children }) {
  const controls = useDragControls();
  const [lifted, setLifted] = useState(false);
  return (
    <Reorder.Item
      as="li"
      value={value}
      // Hanya pegangan yang memulai drag → teks & tombol di baris tetap bisa diklik / dipilih
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setLifted(true)}
      onDragEnd={() => {
        setLifted(false);
        onDrop();
      }}
      variants={slideIn}
      className={`${className} ${lifted ? "relative z-10 bg-surface shadow-float" : ""}`}
    >
      {/* Pegangan drag (desktop/tablet). Keyboard & HP memakai tombol naik/turun di sebelahnya */}
      <span
        aria-hidden
        title="Geser untuk mengurutkan"
        onPointerDown={(e) => {
          e.preventDefault();
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
 * Daftar yang bisa diurutkan: geser lewat pegangan (drag-and-drop, framer-motion Reorder)
 * atau tombol naik/turun (keyboard & HP). Urutan baru dikirim ke onReorder(items) setelah
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
  );
}
