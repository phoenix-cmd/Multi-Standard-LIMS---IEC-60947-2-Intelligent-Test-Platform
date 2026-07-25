import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEngineering } from '../../context/EngineeringContext';
import { getExplodedPosition } from '../../engineering/viewer3d/ExplodedView';
import { COMPONENT_KNOWLEDGE } from '../../engineering/knowledge/ComponentDatabase';
import type { ComponentState } from '../../engineering/digital-twin/TwinState';
import { STATUS_COLORS, EMISSIVE_COLORS } from '../../engineering/viewer3d/HighlightEngine';
import {
  Maximize2, Minimize2, RotateCcw, Layers, Camera, Box,
  ZoomIn, ZoomOut, Eye
} from 'lucide-react';

// ── Component Mesh ────────────────────────────────────────────────────────────
interface ComponentMeshProps {
  comp: ComponentState;
  explosionFactor: number;
  onClick: (id: string) => void;
  isSelected: boolean;
}

function ComponentMesh({ comp, explosionFactor, onClick, isSelected }: ComponentMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const pos = getExplodedPosition(comp.id, explosionFactor);

  const status = hovered ? 'hovered' : comp.status;
  const hexColor = STATUS_COLORS[status] || STATUS_COLORS.normal;
  const emissiveHex = isSelected ? '#004455' : (EMISSIVE_COLORS[status] || '#000000');

  const color = useMemo(() => new THREE.Color(hexColor), [hexColor]);
  const emissive = useMemo(() => new THREE.Color(emissiveHex), [emissiveHex]);

  // Pulse animation for testing / failure states
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    if (comp.status === 'testing') {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + 0.3 * Math.sin(t * 3);
    } else if (comp.status === 'failure') {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + 0.7 * Math.abs(Math.sin(t * 4));
    } else {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isSelected ? 0.4 : 0.05;
    }
  });

  const [w, h, d] = comp.dimensions;

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(comp.id); }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.1}
          roughness={0.4}
          metalness={comp.id.includes('terminal') ? 0.8 : comp.id === 'mainContacts' ? 0.9 : 0.2}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[w + 0.15, h + 0.15, d + 0.15]} />
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.6} />
        </mesh>
      )}

      {/* Label on hover or selection */}
      {(hovered || isSelected) && (
        <Html
          position={[0, h / 2 + 0.5, 0]}
          center
          distanceFactor={20}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-surface-900/95 border border-surface-600 rounded-lg px-2 py-1 text-[10px] font-bold text-white whitespace-nowrap shadow-xl">
            {comp.shortName}
            {comp.status === 'failure' && <span className="ml-1.5 text-red-400">● FAIL</span>}
            {comp.status === 'testing' && <span className="ml-1.5 text-blue-400">● TEST</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── MCCB Scene ────────────────────────────────────────────────────────────────
function MCCBScene({ explosionFactor, onComponentClick }: { explosionFactor: number; onComponentClick: (id: string) => void }) {
  const { twinState, selectedComponentId } = useEngineering();
  const components = Object.values(twinState);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-10, 5, -10]} intensity={0.4} color="#4488ff" />
      <pointLight position={[0, 15, 5]} intensity={0.5} color="#aaccff" />

      <Environment preset="city" />

      {/* Shadow floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.15} />
      </mesh>

      <Grid
        position={[0, -9.5, 0]}
        args={[50, 50]}
        cellSize={2}
        cellThickness={0.3}
        cellColor="#1e3a5f"
        sectionSize={10}
        sectionThickness={0.5}
        sectionColor="#0284c7"
        fadeDistance={60}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Component meshes */}
      {components.map((comp) => (
        <ComponentMesh
          key={comp.id}
          comp={comp}
          explosionFactor={explosionFactor}
          onClick={onComponentClick}
          isSelected={selectedComponentId === comp.id}
        />
      ))}
    </>
  );
}

// ── Viewer Toolbar ────────────────────────────────────────────────────────────
function ViewerToolbar({
  explosionFactor, setExplosionFactor, viewMode, setViewMode,
}: {
  explosionFactor: number;
  setExplosionFactor: (v: number) => void;
  viewMode: 'perspective' | 'orthographic';
  setViewMode: (m: 'perspective' | 'orthographic') => void;
}) {
  return (
    <div className="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none z-10">
      {/* Left toolbar */}
      <div className="flex items-center gap-1.5 bg-surface-900/90 backdrop-blur rounded-xl border border-surface-700 p-1.5 pointer-events-auto">
        <button
          onClick={() => setViewMode(viewMode === 'perspective' ? 'orthographic' : 'perspective')}
          title={viewMode === 'perspective' ? 'Switch to Orthographic' : 'Switch to Perspective'}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-brand-400 hover:bg-brand-600/20 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-surface-700" />
        <button
          onClick={() => setExplosionFactor(explosionFactor > 0 ? 0 : 1)}
          title="Toggle Exploded View"
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            explosionFactor > 0 ? 'text-cyan-400 bg-cyan-500/20' : 'text-surface-400 hover:text-cyan-400 hover:bg-cyan-500/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Centre: Explosion slider */}
      {explosionFactor > 0 && (
        <div className="flex items-center gap-2 bg-surface-900/90 backdrop-blur rounded-xl border border-surface-700 px-3 py-1.5 pointer-events-auto">
          <Layers className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <input
            type="range" min={0} max={1} step={0.01}
            value={explosionFactor}
            onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
            className="w-24 h-1 accent-cyan-400"
          />
          <span className="text-[10px] text-cyan-400 font-mono w-6">{Math.round(explosionFactor * 100)}%</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Right: Camera mode badge */}
      <div className="bg-surface-900/90 backdrop-blur rounded-lg border border-surface-700 px-2.5 py-1 pointer-events-auto">
        <p className="text-[10px] text-surface-400 font-semibold">{viewMode === 'perspective' ? 'PERSP' : 'ORTHO'}</p>
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function StatusLegend() {
  const entries = [
    { color: '#22c55e', label: 'Normal' },
    { color: '#3b82f6', label: 'Testing' },
    { color: '#f59e0b', label: 'Warning' },
    { color: '#ef4444', label: 'Failure' },
    { color: '#06b6d4', label: 'Selected' },
  ];
  return (
    <div className="absolute bottom-3 left-3 bg-surface-900/90 backdrop-blur rounded-xl border border-surface-700 p-2.5 z-10">
      <p className="text-[9px] font-bold text-surface-500 uppercase tracking-wide mb-1.5">Component Status</p>
      <div className="space-y-1">
        {entries.map((e) => (
          <div key={e.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: e.color }} />
            <span className="text-[9px] text-surface-400">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Viewer Panel ─────────────────────────────────────────────────────────
export function Viewer3DPanel() {
  const { explosionFactor, setExplosionFactor, viewMode, setViewMode, selectedComponentId, setSelectedComponentId } = useEngineering();

  const handleComponentClick = (id: string) => {
    setSelectedComponentId(selectedComponentId === id ? null : id);
  };

  return (
    <div className="relative w-full h-full bg-surface-950 rounded-xl overflow-hidden border border-surface-800">
      {/* Viewport Label */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <p className="text-[10px] font-bold text-surface-600 tracking-widest uppercase">IEC 60947-2 MCCB · 3-Pole · 250A Frame</p>
      </div>

      <ViewerToolbar
        explosionFactor={explosionFactor}
        setExplosionFactor={setExplosionFactor}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <StatusLegend />

      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'transparent' }}
        onPointerMissed={() => setSelectedComponentId(null)}
      >
        {viewMode === 'perspective' ? (
          <PerspectiveCamera makeDefault position={[16, 12, 20]} fov={45} near={0.1} far={500} />
        ) : (
          <OrthographicCamera makeDefault position={[0, 0, 30]} zoom={20} near={0.1} far={500} />
        )}

        <color attach="background" args={['#020817']} />
        <fog attach="fog" args={['#020817', 40, 100]} />

        <MCCBScene explosionFactor={explosionFactor} onComponentClick={handleComponentClick} />

        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          minDistance={8}
          maxDistance={60}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>

      {/* Click hint when nothing selected */}
      {!selectedComponentId && (
        <div className="absolute bottom-3 right-3 z-10">
          <div className="bg-surface-900/80 backdrop-blur rounded-lg border border-surface-700 px-2.5 py-1.5">
            <p className="text-[9px] text-surface-500">Click a component to inspect</p>
          </div>
        </div>
      )}
    </div>
  );
}
