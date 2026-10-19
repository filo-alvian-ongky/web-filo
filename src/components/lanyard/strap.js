import * as THREE from "three";

// Tali lanyard 3D: pita dengan lebar & ketebalan nyata (bukan garis datar),
// dibangun ulang tiap frame mengikuti kurva fisika.
export const STRAP = {
  width: 0.26,
  thickness: 0.014,
  samples: 56,
  spread: 0.3, // jarak kedua utas tali di bagian atas (loop leher)
};
// Panjang satu ulangan tekstur tali (tekstur 1024×128 → rasio 8:1)
const TILE = STRAP.width * 8;

const _t = new THREE.Vector3();
const _n = new THREE.Vector3();
const _b = new THREE.Vector3();
const _p = new THREE.Vector3();
const _q = new THREE.Vector3();

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Geometri pita: 8 verteks per titik sampel
 * (0-1 sisi depan, 2-3 sisi belakang, 4-5 tepi kiri, 6-7 tepi kanan)
 * dengan 3 grup material: depan, belakang, tepi.
 */
export function createStrapGeometry(samples = STRAP.samples) {
  const g = new THREE.BufferGeometry();
  const count = samples * 8;
  const attr = (size) => new THREE.BufferAttribute(new Float32Array(count * size), size).setUsage(THREE.DynamicDrawUsage);
  g.setAttribute("position", attr(3));
  g.setAttribute("normal", attr(3));
  g.setAttribute("uv", attr(2));

  const front = [];
  const back = [];
  const edge = [];
  for (let i = 0; i < samples - 1; i++) {
    const a = i * 8;
    const c = (i + 1) * 8;
    front.push(a, a + 1, c, a + 1, c + 1, c);
    back.push(a + 2, c + 2, a + 3, a + 3, c + 2, c + 3);
    edge.push(a + 4, c + 4, a + 5, a + 5, c + 4, c + 5);
    edge.push(a + 6, a + 7, c + 6, a + 7, c + 7, c + 6);
  }
  g.setIndex([...front, ...back, ...edge]);
  g.addGroup(0, front.length, 0);
  g.addGroup(front.length, back.length, 1);
  g.addGroup(front.length + back.length, edge.length, 2);
  return g;
}

/**
 * Tulis ulang posisi pita dari titik-titik kurva (urutan: pengait → atas).
 * @param side  -1 / +1 untuk dua utas tali yang menyatu di pengait
 * @param yaw   rotasi kartu; ujung bawah tali ikut berputar bersama kartu (twist alami)
 */
export function writeStrap(geometry, points, side, yaw) {
  const pos = geometry.attributes.position.array;
  const nor = geometry.attributes.normal.array;
  const uv = geometry.attributes.uv.array;
  const n = points.length;
  const hw = STRAP.width / 2;
  const ht = STRAP.thickness / 2;
  let length = 0;

  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    _t.subVectors(points[Math.min(i + 1, n - 1)], points[Math.max(i - 1, 0)]).normalize();

    // Arah muka pita: di dekat kartu mengikuti putaran kartu, makin ke atas makin menghadap kamera
    const a = yaw * (1 - smooth(0.02, 0.4, k));
    _n.set(Math.sin(a), 0, Math.cos(a));
    _n.addScaledVector(_t, -_t.dot(_n));
    if (_n.lengthSq() < 1e-6) _n.set(1, 0, 0).addScaledVector(_t, -_t.x);
    _n.normalize();
    _b.crossVectors(_t, _n).normalize();
    _n.crossVectors(_b, _t);

    // Dua utas: bertumpuk di pengait, lalu merenggang ke atas
    const s = smooth(0.04, 0.45, k);
    _p.copy(points[i]);
    _p.x += side * STRAP.spread * 0.5 * s;
    _p.addScaledVector(_n, side * STRAP.thickness * 0.6 * (1 - s));

    if (i > 0) length += points[i].distanceTo(points[i - 1]);
    const u = length / TILE;

    const base = i * 8;
    const put = (v, sx, sy, nx, ny, nz, uu, vv) => {
      _q.copy(_p).addScaledVector(_b, sx * hw).addScaledVector(_n, sy * ht);
      pos[(base + v) * 3] = _q.x;
      pos[(base + v) * 3 + 1] = _q.y;
      pos[(base + v) * 3 + 2] = _q.z;
      nor[(base + v) * 3] = nx;
      nor[(base + v) * 3 + 1] = ny;
      nor[(base + v) * 3 + 2] = nz;
      uv[(base + v) * 2] = uu;
      uv[(base + v) * 2 + 1] = vv;
    };
    // depan (v dibalik agar tulisan tidak tercermin)
    put(0, -1, 1, _n.x, _n.y, _n.z, u, 1);
    put(1, 1, 1, _n.x, _n.y, _n.z, u, 0);
    // belakang
    put(2, -1, -1, -_n.x, -_n.y, -_n.z, u, 0);
    put(3, 1, -1, -_n.x, -_n.y, -_n.z, u, 1);
    // tepi kiri & kanan
    put(4, -1, 1, -_b.x, -_b.y, -_b.z, u, 0);
    put(5, -1, -1, -_b.x, -_b.y, -_b.z, u, 0);
    put(6, 1, 1, _b.x, _b.y, _b.z, u, 1);
    put(7, 1, -1, _b.x, _b.y, _b.z, u, 1);
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.normal.needsUpdate = true;
  geometry.attributes.uv.needsUpdate = true;
}
