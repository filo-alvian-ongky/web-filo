"use client";

// Lanyard 3D interaktif — bentuk mengikuti lanyard sungguhan (tali pita dua utas,
// crimp logam, swivel, snap hook, holder plastik bening ber-slot).
// Semua dibuat secara prosedural (tanpa file .glb) sehingga foto, nama, dan
// warnanya mengikuti data profil serta tema terang/gelap.

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, events as createPointerEvents, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from "@react-three/rapier";
import { CARD, createBadgeTextures, createCardGeometries } from "./badgeTextures";
import { STRAP, createStrapGeometry, writeStrap } from "./strap";
import { CRIMP, HANG_Y, HOLDER, HOOK, STRAP_END_Y, SWIVEL, createHolderGeometry, createHookGeometry } from "./hardware";

const SEGMENT = { type: "dynamic", canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 };

// Vektor bantu yang dipakai ulang setiap frame (hanya ada satu lanyard per halaman)
const vec = new THREE.Vector3();
const ang = new THREE.Vector3();
const dir = new THREE.Vector3();
const quat = new THREE.Quaternion();
const euler = new THREE.Euler();

// Ujung tali di dalam crimp (koordinat lokal kartu) & panjang tiap ruas tali fisika
const STRAP_END = new THREE.Vector3(0, STRAP_END_Y, 0);
const strapEnd = new THREE.Vector3();
const ROPE = 0.9;
const HOLDER_MID = (HOLDER.top + HOLDER.bottom) / 2;

// Selisih sudut putar (yaw) kartu terhadap arah yang dituju, dibungkus ke -π…π
function bodyYaw(body) {
  const r = body.rotation();
  quat.set(r.x, r.y, r.z, r.w);
  euler.setFromQuaternion(quat, "YXZ");
  return euler.y;
}

function yawError(body, target) {
  const d = bodyYaw(body) - target;
  return Math.atan2(Math.sin(d), Math.cos(d));
}

const disposeTextures = (t) => [t.front, t.back, t.band].forEach((x) => x.dispose());

const CAMERA = { fov: 25, near: 9.6, far: 13 };
const cameraZ = (width) => (width < 640 ? CAMERA.near : CAMERA.far);

// Event pointer dihitung dari posisi kanvas di layar, sehingga kanvas boleh
// menerima event dari elemen induk (eventSource) tanpa menghalangi klik tombol.
function canvasRelativeEvents(store) {
  const base = createPointerEvents(store);
  return {
    ...base,
    compute(event, state) {
      const rect = state.gl.domElement.getBoundingClientRect();
      state.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },
  };
}

function Band({ textures, onTap, cardRef, anchorX = 0, flipped = false, maxSpeed = 50, minSpeed = 10 }) {
  const strapA = useRef();
  const strapB = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const tap = useRef(null);
  // Sisi kartu yang dituju: 0 = depan, π = belakang
  const facing = useRef(flipped ? Math.PI : 0);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3(Array.from({ length: 5 }, () => new THREE.Vector3()));
    c.curveType = "chordal";
    return c;
  });
  const geometries = useMemo(
    () => ({
      ...createCardGeometries(),
      holder: createHolderGeometry(),
      holderFrame: createHolderGeometry({ frame: true }),
      hook: createHookGeometry(),
      strapA: createStrapGeometry(),
      strapB: createStrapGeometry(),
    }),
    []
  );
  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ROPE]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ROPE]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ROPE]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, HANG_Y, 0]]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

  // Tombol "Balik kartu": ganti sisi tujuan lalu beri dorongan putar agar kartu berputar dengan fisika
  useEffect(() => {
    const target = flipped ? Math.PI : 0;
    if (facing.current === target || !card.current) return;
    facing.current = target;
    [card, j1, j2, j3].forEach((ref) => ref.current?.wakeUp());
    const err = yawError(card.current, target);
    const a = card.current.angvel();
    card.current.setAngvel({ x: a.x, y: a.y - Math.sign(err || -1) * 7, z: a.z }, true);
  }, [flipped]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (!fixed.current) return;

    // Haluskan ruas tali agar tidak bergetar saat ditarik terlalu jauh
    [j1, j2].forEach((ref) => {
      if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
      const clamped = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
      ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clamped * (maxSpeed - minSpeed)));
    });

    // Ujung tali mengikuti posisi & rotasi kartu, jadi selalu tepat di dalam crimp
    const r = card.current.rotation();
    quat.set(r.x, r.y, r.z, r.w);
    strapEnd.copy(STRAP_END).applyQuaternion(quat).add(card.current.translation());
    curve.points[0].copy(strapEnd);
    curve.points[1].copy(j3.current.translation());
    curve.points[2].copy(j2.current.lerped);
    curve.points[3].copy(j1.current.lerped);
    curve.points[4].copy(fixed.current.translation());
    // Kurva "chordal" gagal (NaN) bila dua titik berimpit — misalnya saat kartu ditarik sangat cepat
    for (let i = 1; i < curve.points.length; i++) {
      const p = curve.points[i];
      if (p.distanceToSquared(curve.points[i - 1]) < 1e-8) p.setY(p.y + 0.001);
    }
    // Saat titik-titik masih berimpit (frame awal), kurva bisa menghasilkan NaN — lewati dulu
    const points = curve.getSpacedPoints(STRAP.samples - 1);
    if (Number.isFinite(points[1].x) && Number.isFinite(points[STRAP.samples >> 1].y)) {
      const yaw = bodyYaw(card.current);
      writeStrap(strapA.current.geometry, points, -1, yaw);
      writeStrap(strapB.current.geometry, points, 1, yaw);
    }

    // Putar kartu perlahan kembali menghadap sisi yang dipilih (depan / belakang)
    ang.copy(card.current.angvel());
    card.current.setAngvel({ x: ang.x, y: ang.y - yawError(card.current, facing.current) * 0.125, z: ang.z });
  });

  const onPointerDown = (e) => {
    e.stopPropagation();
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {
      // Beberapa browser menolak capture untuk pointer tertentu — drag tetap jalan tanpa capture
    }
    tap.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setDragged(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
  };

  const onPointerUp = (e) => {
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {
      // abaikan
    }
    setDragged(false);
    const start = tap.current;
    tap.current = null;
    if (start && onTap) {
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (moved < 6 && performance.now() - start.t < 280) onTap();
    }
  };

  const metal = <meshStandardMaterial color="#d4d7dd" metalness={1} roughness={0.28} />;
  const strapMaterials = useMemo(() => {
    // Warna tekstur diredam (color) karena lampu ambient + environment membuat kain terlalu terang
    const face = new THREE.MeshStandardMaterial({ map: textures.band, color: "#8c8c8c", roughness: 0.85, metalness: 0, envMapIntensity: 0.5 });
    const edge = new THREE.MeshStandardMaterial({ color: "#06338a", roughness: 0.9, metalness: 0, envMapIntensity: 0.5 });
    return [face, face, edge];
  }, [textures.band]);
  useEffect(() => () => strapMaterials.forEach((m) => m.dispose()), [strapMaterials]);

  return (
    <>
      <group position={[anchorX, 4, 0]}>
        <RigidBody ref={fixed} {...SEGMENT} type="fixed" />
        <RigidBody position={[0.45, 0, 0]} ref={j1} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.9, 0, 0]} ref={j2} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.35, 0, 0]} ref={j3} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.8, 0, 0]} ref={card} {...SEGMENT} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[HOLDER.w / 2, (HOLDER.top - HOLDER.bottom) / 2, 0.02]} position={[0, HOLDER_MID, 0]} />
          <group
            ref={cardRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <mesh geometry={geometries.body}>
              <meshStandardMaterial color={textures.dark ? "#2a2a2f" : "#d9dce2"} roughness={0.6} />
            </mesh>
            <mesh geometry={geometries.face} position={[0, 0, CARD.d / 2 + 0.001]}>
              {/* Warna kartu dari emissive (tidak "terbakar" cahaya) + clearcoat untuk kilau saat berayun */}
              <meshPhysicalMaterial
                color="black"
                emissive="white"
                emissiveMap={textures.front}
                toneMapped={false}
                clearcoat={1}
                clearcoatRoughness={0.12}
                roughness={0.35}
              />
            </mesh>
            <mesh geometry={geometries.face} position={[0, 0, -(CARD.d / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
              <meshPhysicalMaterial
                color="black"
                emissive="white"
                emissiveMap={textures.back}
                toneMapped={false}
                clearcoat={1}
                clearcoatRoughness={0.12}
                roughness={0.35}
              />
            </mesh>
            {/* Holder plastik ber-slot: lapisan bening tipis di atas kartu (kilau) + bingkai yang sedikit berwarna */}
            <mesh geometry={geometries.holder} renderOrder={1}>
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.05}
                roughness={0.05}
                metalness={0}
                clearcoat={1}
                clearcoatRoughness={0.03}
                envMapIntensity={1.6}
                depthWrite={false}
              />
            </mesh>
            <mesh geometry={geometries.holderFrame} renderOrder={2}>
              <meshPhysicalMaterial
                color={textures.dark ? "#ffffff" : "#9aa7bb"}
                transparent
                opacity={textures.dark ? 0.18 : 0.42}
                roughness={0.08}
                metalness={0}
                clearcoat={1}
                clearcoatRoughness={0.04}
                envMapIntensity={1.2}
                depthWrite={false}
              />
            </mesh>
            {/* Snap hook melingkari batang atas holder (lewat slot) */}
            <mesh geometry={geometries.hook} rotation={[0, HOOK.turn, 0]}>
              {metal}
            </mesh>
            {/* Swivel: penghubung hook & crimp yang bisa berputar */}
            <mesh position={[0, SWIVEL.y, 0]}>
              <cylinderGeometry args={[SWIVEL.r, SWIVEL.r * 0.8, SWIVEL.h, 16]} />
              {metal}
            </mesh>
            <mesh position={[0, SWIVEL.y + SWIVEL.h * 0.15, 0]}>
              <cylinderGeometry args={[SWIVEL.r * 1.45, SWIVEL.r * 1.45, SWIVEL.h * 0.35, 20]} />
              {metal}
            </mesh>
            {/* Crimp logam tempat kedua ujung tali dijepit */}
            <RoundedBox args={[CRIMP.w, CRIMP.h, CRIMP.d]} radius={0.018} smoothness={4} position={[0, CRIMP.y, 0]}>
              {metal}
            </RoundedBox>
          </group>
        </RigidBody>
      </group>
      {/* Dua utas tali (loop leher). frustumCulled dimatikan karena geometrinya berubah tiap frame */}
      <mesh ref={strapA} geometry={geometries.strapA} material={strapMaterials} frustumCulled={false} />
      <mesh ref={strapB} geometry={geometries.strapB} material={strapMaterials} frustumCulled={false} />
    </>
  );
}

// Kamera sedikit lebih dekat di layar sempit supaya kartu tetap terbaca
function ResponsiveCamera() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  useEffect(() => {
    camera.position.set(0, 0, cameraZ(width));
    camera.updateProjectionMatrix();
  }, [camera, width]);
  return null;
}

// Di layar sentuh, gulir halaman tetap berjalan normal kecuali jari tepat menyentuh kartu
function TouchGuard({ cardRef }) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const source = useThree((state) => state.events.connected);
  useEffect(() => {
    const target = source ?? gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (!t || !cardRef.current) return;
      const rect = gl.domElement.getBoundingClientRect();
      if (t.clientX < rect.left || t.clientX > rect.right || t.clientY < rect.top || t.clientY > rect.bottom) return;
      ndc.set(((t.clientX - rect.left) / rect.width) * 2 - 1, -((t.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.intersectObject(cardRef.current, true).length > 0) e.preventDefault();
    };
    target.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => target.removeEventListener("touchstart", onTouchStart);
  }, [gl, camera, source, cardRef]);
  return null;
}

function Badge({ profile, dark, onTap, onReady, anchor, flipped }) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const cardRef = useRef(null);
  const readyRef = useRef(onReady);
  const [textures, setTextures] = useState(null);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let cancelled = false;
    createBadgeTextures({ profile, dark, anisotropy: gl.capabilities.getMaxAnisotropy() })
      .then((t) => {
        if (cancelled) return disposeTextures(t);
        setTextures(t);
        readyRef.current?.();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profile, dark, gl]);

  // Bebaskan tekstur lama setiap kali diganti (mis. saat ganti tema)
  useEffect(() => () => textures && disposeTextures(textures), [textures]);

  // Titik gantung lanyard (dalam satuan dunia) mengikuti posisi kolom di layout
  const visibleWidth = 2 * cameraZ(size.width) * Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2)) * (size.width / size.height);
  const anchorX = Math.round((anchor - 0.5) * visibleWidth * 100) / 100;

  if (!textures) return null;
  return (
    <>
      <Band key={anchorX} textures={textures} onTap={onTap} cardRef={cardRef} anchorX={anchorX} flipped={flipped} />
      <TouchGuard cardRef={cardRef} />
    </>
  );
}

export default function LanyardScene({ profile, dark = false, active = true, anchor = 0.5, flipped = false, eventSource, onTap, onReady, fallback = null }) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA.far], fov: CAMERA.fov }}
      eventSource={eventSource}
      events={canvasRelativeEvents}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      fallback={fallback}
      aria-label={`${profile.name} — ${profile.label ?? ""}`}
    >
      <ResponsiveCamera />
      <ambientLight intensity={Math.PI} />
      <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60} paused={!active}>
        <Badge profile={profile} dark={dark} onTap={onTap} onReady={onReady} anchor={anchor} flipped={flipped} />
      </Physics>
      <Environment blur={0.75} resolution={256}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}
