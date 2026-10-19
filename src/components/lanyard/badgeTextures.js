import * as THREE from "three";

// Ukuran kartu dalam satuan dunia 3D (rasio kartu ID 1.6 : 2.25)
export const CARD = { w: 1.6, h: 2.25, r: 0.12, d: 0.024 };

const W = 1024;
const H = 1440;

const PALETTE = {
  light: { bg: "#ffffff", fg: "#0b0b0d", fg2: "#5f6470", line: "#e7e9ee", slot: "#e4e7ec", photoBg: "#eef2f7", accent: "#0a6cf5" },
  dark: { bg: "#18181b", fg: "#f5f5f7", fg2: "#a1a4ab", line: "#2a2a2f", slot: "#2c2c31", photoBg: "#232328", accent: "#5aa2ff" },
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth, weight, size, family) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && s > 12) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

function makeCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext("2d")];
}

// Logo (public/logo.svg) diwarnai ulang sesuai tema kartu
export const LOGO_SRC = "/logo.svg";

function tintedLogo(logo, size, color) {
  const [canvas, ctx] = makeCanvas(size, size);
  ctx.drawImage(logo, 0, 0, size, size);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

function drawFront({ img, logo, profile, c, font }) {
  const [canvas, ctx] = makeCanvas(W, H);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  // Header: logo + domain
  const pad = 72;
  ctx.drawImage(tintedLogo(logo, 168, c.fg), pad - 4, 128, 88, 88);

  ctx.fillStyle = c.fg;
  ctx.font = `700 36px ${font}`;
  ctx.fillText(profile.domain, pad + 108, 166);
  ctx.fillStyle = c.fg2;
  ctx.font = `500 26px ${font}`;
  ctx.fillText("Portfolio ID", pad + 108, 202);

  // Pill tahun
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 3;
  roundRect(ctx, W - pad - 128, 146, 128, 52, 26);
  ctx.stroke();
  ctx.fillStyle = c.fg2;
  ctx.font = `700 26px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText(String(new Date().getFullYear()), W - pad - 64, 181);
  ctx.textAlign = "left";

  // Foto profil (squircle, crop fokus ke wajah)
  const px = pad;
  const py = 256;
  const pw = W - pad * 2;
  const ph = 740;
  ctx.save();
  roundRect(ctx, px, py, pw, ph, 64);
  ctx.clip();
  ctx.fillStyle = c.photoBg;
  ctx.fillRect(px, py, pw, ph);
  const scale = Math.max(pw / img.width, ph / img.height) * 1.14;
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, px + (pw - dw) / 2, py - dh * 0.05, dw, dh);
  ctx.restore();

  // Nama & peran
  const nameSize = fitText(ctx, profile.name, pw, 800, 78, font);
  ctx.fillStyle = c.fg;
  ctx.font = `800 ${nameSize}px ${font}`;
  ctx.fillText(profile.name, pad, 1098);
  ctx.fillStyle = c.fg2;
  ctx.font = `500 36px ${font}`;
  ctx.fillText(profile.role, pad, 1156);
  ctx.fillStyle = c.accent;
  ctx.font = `700 36px ${font}`;
  ctx.fillText(profile.campus, pad, 1206);

  // Garis pemisah
  ctx.fillStyle = c.line;
  ctx.fillRect(pad, 1252, pw, 3);

  // Tag keahlian
  ctx.fillStyle = c.fg2;
  ctx.font = `600 28px ${font}`;
  ctx.fillText("UI/UX  ·  Web  ·  IoT", pad, 1336);

  // Barcode dekoratif (deterministik)
  ctx.fillStyle = c.fg;
  let x = W - pad - 236;
  let seed = 7;
  while (x < W - pad) {
    seed = (seed * 9301 + 49297) % 233280;
    const bw = 3 + Math.floor((seed / 233280) * 7);
    ctx.fillRect(x, 1294, bw, 64);
    x += bw + 5;
  }

  return canvas;
}

function drawBack({ logo, profile, font }) {
  const [canvas, ctx] = makeCanvas(W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#2f86ff");
  g.addColorStop(1, "#0646c8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Lingkaran lembut ala wallpaper One UI
  const blobs = [
    [W * 0.92, H * 0.18, 420, "rgba(255,255,255,0.14)"],
    [W * 0.05, H * 0.62, 360, "rgba(255,255,255,0.10)"],
    [W * 0.75, H * 0.95, 300, "rgba(0,0,0,0.12)"],
  ];
  for (const [bx, by, br, col] of blobs) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }


  // Logo besar di tengah
  const logoSize = 420;
  ctx.drawImage(tintedLogo(logo, logoSize, "#ffffff"), (W - logoSize) / 2, 250, logoSize, logoSize);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  const nameSize = fitText(ctx, profile.name, W - 168, 800, 70, font);
  ctx.font = `800 ${nameSize}px ${font}`;
  ctx.fillText(profile.name, W / 2, 820);
  ctx.font = `600 42px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(profile.tagline ?? "", W / 2, 892);
  ctx.textAlign = "left";

  const pad = 84;
  ctx.font = `500 32px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText(profile.email, pad, 1240);
  ctx.font = `700 34px ${font}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(profile.domain, pad, 1300);

  return canvas;
}

function drawBand({ logo, profile, font }) {
  const [canvas, ctx] = makeCanvas(1024, 128);
  ctx.fillStyle = "#0a6cf5";
  ctx.fillRect(0, 0, 1024, 128);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(0, 10, 1024, 3);
  ctx.fillRect(0, 115, 1024, 3);
  // Nama + logo, ditengahkan
  const text = profile.name.toUpperCase();
  const logoSize = 76;
  ctx.font = `800 52px ${font}`;
  const total = ctx.measureText(text).width + 28 + logoSize;
  const start = (1024 - total) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, start, 66);
  ctx.drawImage(tintedLogo(logo, logoSize * 2, "#ffffff"), start + total - logoSize, 26, logoSize, logoSize);
  return canvas;
}

function toTexture(canvas, anisotropy) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

export async function createBadgeTextures({ profile, dark, anisotropy = 8 }) {
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";
  if (document.fonts) {
    await Promise.all(["500", "600", "700", "800"].map((w) => document.fonts.load(`${w} 40px ${font}`).catch(() => null)));
  }
  const [img, logo] = await Promise.all([loadImage(profile.photo), loadImage(LOGO_SRC)]);
  const c = dark ? PALETTE.dark : PALETTE.light;

  const front = toTexture(drawFront({ img, logo, profile, c, font }), anisotropy);
  const back = toTexture(drawBack({ logo, profile, font }), anisotropy);
  const band = toTexture(drawBand({ logo, profile, font }), anisotropy);
  band.wrapS = band.wrapT = THREE.RepeatWrapping;

  return { front, back, band, edge: c.bg, dark };
}

// Bentuk persegi panjang membulat + UV yang dinormalisasi 0..1
export function createCardGeometries() {
  const { w, h, r, d } = CARD;
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const face = new THREE.ShapeGeometry(shape, 12);
  const pos = face.attributes.position;
  const uv = face.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
  uv.needsUpdate = true;

  const body = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 12 });
  body.translate(0, 0, -d / 2);

  return { face, body };
}
