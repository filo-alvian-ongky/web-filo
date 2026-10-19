import * as THREE from "three";
import { CARD } from "./badgeTextures";

// Perangkat keras lanyard (koordinat lokal kartu, pusat kartu di 0,0,0):
// holder plastik bening ber-slot → snap hook melingkari batang atas holder →
// swivel → crimp logam tempat kedua ujung tali dijepit.

export const HOLDER = {
  w: CARD.w + 0.14,
  bottom: -CARD.h / 2 - 0.07,
  top: CARD.h / 2 + 0.26,
  r: 0.13,
  d: CARD.d + 0.034,
  slot: { w: 0.46, h: 0.085, y: CARD.h / 2 + 0.135 },
};

// Bagian bawah hook bertumpu di sisi atas slot (menahan berat kartu), lalu melingkari batang atas holder
export const HOOK = { bottom: 1.29, top: 1.52, tube: 0.014, turn: 0.45 };
export const SWIVEL = { y: 1.555, h: 0.07, r: 0.022 };
export const CRIMP = { y: 1.65, w: 0.3, h: 0.12, d: 0.045 };
// Titik ujung tali (tersembunyi di dalam crimp) & titik gantung joint fisika
export const STRAP_END_Y = 1.69;
export const HANG_Y = 1.72;

function roundedRectPath(path, x, y, w, h, r) {
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

/**
 * Holder kartu: lembar plastik membulat dengan slot di bagian atas.
 * `frame: true` → hanya bingkai (area di luar kartu) agar holder terlihat jelas
 * tanpa membuat desain kartu buram.
 */
export function createHolderGeometry({ frame = false } = {}) {
  const { w, bottom, top, r, d, slot } = HOLDER;
  const shape = roundedRectPath(new THREE.Shape(), -w / 2, bottom, w, top - bottom, r);
  const hole = roundedRectPath(new THREE.Path(), -slot.w / 2, slot.y - slot.h / 2, slot.w, slot.h, slot.h / 2);
  shape.holes.push(hole);
  if (frame) {
    const inset = 0.015; // bingkai sedikit menutup tepi kartu
    shape.holes.push(roundedRectPath(new THREE.Path(), -CARD.w / 2 + inset, -CARD.h / 2 + inset, CARD.w - inset * 2, CARD.h - inset * 2, CARD.r));
  }
  const bevel = 0.008;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 16,
  });
  geo.translate(0, 0, -(d - bevel * 2) / 2);
  return geo;
}

/** Snap hook berbentuk tetes air yang melingkari batang atas holder */
export function createHookGeometry() {
  const { bottom, top, tube } = HOOK;
  const pts = [
    [bottom, 0],
    [1.305, 0.045],
    [1.345, 0.062],
    [1.4, 0.05],
    [1.46, 0.024],
    [top, 0],
    [1.46, -0.024],
    [1.4, -0.05],
    [1.345, -0.062],
    [1.305, -0.045],
  ].map(([y, z]) => new THREE.Vector3(0, y, z));
  const path = new THREE.CatmullRomCurve3(pts, true, "centripetal");
  return new THREE.TubeGeometry(path, 64, tube, 10, true);
}
