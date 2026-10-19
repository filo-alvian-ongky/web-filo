"use client";

// Lanyard 3D interaktif — terinspirasi dari badge Vercel Ship / React Bits.
// Kartu dibuat secara prosedural (tanpa file .glb) sehingga foto, nama, dan
// warnanya mengikuti data profil serta tema terang/gelap.

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, events as createPointerEvents, extend, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { CARD, createBadgeTextures, createCardGeometries } from "./badgeTextures";

extend({ MeshLineGeometry, MeshLineMaterial });

const SEGMENT = { type: "dynamic", canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 };

// Vektor bantu yang dipakai ulang setiap frame (hanya ada satu lanyard per halaman)
const vec = new THREE.Vector3();
const ang = new THREE.Vector3();
const rot = new THREE.Vector3();
const dir = new THREE.Vector3();

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

function Band({ textures, onTap, cardRef, anchorX = 0, maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const tap = useRef(null);

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = "chordal";
    return c;
  });
  const geometries = useMemo(() => createCardGeometries(), []);
  const { width, height } = useThree((state) => state.size);
  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

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

    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2.current.lerped);
    curve.points[2].copy(j1.current.lerped);
    curve.points[3].copy(fixed.current.translation());
    // Saat titik-titik masih berimpit (frame awal), kurva bisa menghasilkan NaN — lewati dulu
    const points = curve.getPoints(32);
    if (Number.isFinite(points[1].x) && Number.isFinite(points[16].y)) band.current.geometry.setPoints(points);

    // Putar kartu perlahan kembali menghadap layar
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
  });

  const onPointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    tap.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setDragged(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
  };

  const onPointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    setDragged(false);
    const start = tap.current;
    tap.current = null;
    if (start && onTap) {
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (moved < 6 && performance.now() - start.t < 280) onTap();
    }
  };

  const metal = <meshStandardMaterial color="#d4d7dd" metalness={1} roughness={0.28} />;

  return (
    <>
      <group position={[anchorX, 4, 0]}>
        <RigidBody ref={fixed} {...SEGMENT} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...SEGMENT}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...SEGMENT} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[CARD.w / 2, CARD.h / 2, 0.01]} />
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
            {/* Penjepit logam */}
            <mesh position={[0, CARD.h / 2 + 0.03, 0]}>
              <boxGeometry args={[0.36, 0.17, 0.07]} />
              {metal}
            </mesh>
            <mesh position={[0, CARD.h / 2 + 0.16, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 16]} />
              {metal}
            </mesh>
            <mesh position={[0, 1.38, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.08, 0.022, 16, 40]} />
              {metal}
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={textures.band}
          repeat={[-3, 1]}
          lineWidth={1}
        />
      </mesh>
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

function Badge({ profile, dark, onTap, onReady, anchor }) {
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
      <Band key={anchorX} textures={textures} onTap={onTap} cardRef={cardRef} anchorX={anchorX} />
      <TouchGuard cardRef={cardRef} />
    </>
  );
}

export default function LanyardScene({ profile, dark = false, active = true, anchor = 0.5, eventSource, onTap, onReady, fallback = null }) {
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
        <Badge profile={profile} dark={dark} onTap={onTap} onReady={onReady} anchor={anchor} />
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
