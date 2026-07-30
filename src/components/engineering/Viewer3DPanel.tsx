import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEngineering } from '../../context/EngineeringContext';
import { getExplodedPosition } from '../../engineering/viewer3d/ExplodedView';
import type { ComponentState } from '../../engineering/digital-twin/TwinState';
import { STATUS_COLORS, EMISSIVE_COLORS } from '../../engineering/viewer3d/HighlightEngine';
import { CustomMCCBModel } from './models/MCCBComponents3D';
import {
  Camera, Layers, Eye, EyeOff
} from 'lucide-react';

// ── Component Mesh ────────────────────────────────────────────────────────────
interface ComponentMeshProps {
  comp: ComponentState;
  explosionFactor: number;
  onClick: (id: string) => void;
  isSelected: boolean;
  casingOpacity: number;
}

function ComponentMesh({ comp, explosionFactor, onClick, isSelected, casingOpacity }: ComponentMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const pos = getExplodedPosition(comp.id, explosionFactor);

  // Use per-component colorByStatus for accurate part identification in the viewer.
  // Fall back to the global palette for statuses not overridden in the registry.
  const effectiveStatus = hovered ? 'hovered' : comp.status;
  const hexColor = (comp.colorByStatus?.[effectiveStatus]) ?? (STATUS_COLORS[effectiveStatus] || STATUS_COLORS.normal);
  const emissiveHex = isSelected ? '#004455' : (EMISSIVE_COLORS[effectiveStatus] || '#000000');

  const color = useMemo(() => new THREE.Color(hexColor), [hexColor]);
  const emissive = useMemo(() => new THREE.Color(emissiveHex), [emissiveHex]);

  const [w, h, d] = comp.dimensions;

  return (
    <group
      ref={groupRef}
      position={pos}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(comp.id); }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <CustomMCCBModel
        comp={comp}
        color={color}
        emissive={emissive}
        isSelected={isSelected}
        casingOpacity={comp.id === 'casing' ? casingOpacity : 1.0}
      />

      {/* Selection wireframe bounding ring */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[w + 0.2, h + 0.2, d + 0.2]} />
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.6} />
        </mesh>
      )}

      {/* Interactive label on hover or selection */}
      {(hovered || isSelected) && (
        <Html
          position={[0, h / 2 + 0.6, 0]}
          center
          distanceFactor={20}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-surface-900/95 border border-surface-600 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white whitespace-nowrap shadow-xl flex items-center gap-1.5 backdrop-blur">
            <span>{comp.shortName}</span>
            {comp.status === 'failure' && <span className="text-red-400">● FAIL</span>}
            {comp.status === 'testing' && <span className="text-blue-400">● TEST</span>}
            {comp.status === 'warning' && <span className="text-amber-400">● WARN</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── MCCB Scene ────────────────────────────────────────────────────────────────
function MCCBScene({
  explosionFactor,
  casingOpacity,
  onComponentClick,
}: {
  explosionFactor: number;
  casingOpacity: number;
  onComponentClick: (id: string) => void;
}) {
  const { twinState, selectedComponentId } = useEngineering();
  const components = Object.values(twinState);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[12, 22, 12]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-12, 8, -12]} intensity={0.5} color="#38bdf8" />
      <pointLight position={[0, 15, 8]} intensity={0.6} color="#e0f2fe" />

      <Environment preset="city" />

      {/* Shadow Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.2} />
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
          casingOpacity={casingOpacity}
          onClick={onComponentClick}
          isSelected={selectedComponentId === comp.id}
        />
      ))}
    </>
  );
}

// ── Viewer Toolbar ────────────────────────────────────────────────────────────
function ViewerToolbar({
  explosionFactor, setExplosionFactor, viewMode, setViewMode, casingOpacity, setCasingOpacity,
}: {
  explosionFactor: number;
  setExplosionFactor: (v: number) => void;
  viewMode: 'perspective' | 'orthographic';
  setViewMode: (m: 'perspective' | 'orthographic') => void;
  casingOpacity: number;
  setCasingOpacity: (v: number) => void;
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

        <div className="w-px h-4 bg-surface-700" />

        {/* X-Ray / Casing Opacity Toggle */}
        <button
          onClick={() => setCasingOpacity(casingOpacity < 0.8 ? 0.95 : 0.25)}
          title={casingOpacity < 0.8 ? 'Disable X-Ray Casing' : 'Enable X-Ray Transparent Casing'}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            casingOpacity < 0.8 ? 'text-emerald-400 bg-emerald-500/20' : 'text-surface-400 hover:text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          {casingOpacity < 0.8 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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

      {/* Right: Camera & X-Ray Mode Badge */}
      <div className="flex items-center gap-2 bg-surface-900/90 backdrop-blur rounded-lg border border-surface-700 px-2.5 py-1 pointer-events-auto">
        {casingOpacity < 0.8 && <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase">X-RAY</span>}
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
  const [casingOpacity, setCasingOpacity] = useState(0.85);

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
        casingOpacity={casingOpacity}
        setCasingOpacity={setCasingOpacity}
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

        <MCCBScene
          explosionFactor={explosionFactor}
          casingOpacity={casingOpacity}
          onComponentClick={handleComponentClick}
        />

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

