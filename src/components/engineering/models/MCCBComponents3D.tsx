import React from 'react';
import * as THREE from 'three';
import type { ComponentState } from '../../../engineering/digital-twin/TwinState';

interface ModelProps {
  comp: ComponentState;
  color: THREE.Color;
  emissive: THREE.Color;
  isSelected: boolean;
  casingOpacity?: number;
}

// Helper: Common material parameters based on component status and selected state
function getMaterialProps(comp: ComponentState, color: THREE.Color, emissive: THREE.Color, defaultMetalness = 0.4, defaultRoughness = 0.3) {
  const isTerminal = comp.id.toLowerCase().includes('terminal');
  const isContacts = comp.id === 'mainContacts';
  const isArcChute = comp.id === 'arcChute';

  const metalness = isTerminal ? 0.9 : isContacts ? 0.95 : isArcChute ? 0.7 : defaultMetalness;
  const roughness = isTerminal ? 0.2 : isContacts ? 0.15 : defaultRoughness;

  return {
    color,
    emissive,
    emissiveIntensity: comp.status === 'testing' || comp.status === 'failure' ? 0.4 : 0.05,
    metalness,
    roughness,
  };
}

// ── 1. Moulded Casing & Frame ────────────────────────────────────────────────
export function Casing3D({ comp, color, emissive, isSelected, casingOpacity = 0.85 }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.2, 0.4);
  const isTransparent = casingOpacity < 0.95;

  return (
    <group>
      {/* Main Moulded Frame Base */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          {...matProps}
          transparent={isTransparent}
          opacity={casingOpacity}
          roughness={0.5}
        />
      </mesh>

      {/* Front Face Cover Rim */}
      <mesh position={[0, 0, d / 2 + 0.05]}>
        <boxGeometry args={[w - 0.4, h - 0.4, 0.1]} />
        <meshStandardMaterial
          color={color.clone().multiplyScalar(1.2)}
          emissive={emissive}
          transparent={isTransparent}
          opacity={casingOpacity * 0.9}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Phase Separator Ribs (Internal Dividers) */}
      <mesh position={[-w / 6, 0, 0]}>
        <boxGeometry args={[0.15, h - 0.6, d - 0.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      <mesh position={[w / 6, 0, 0]}>
        <boxGeometry args={[0.15, h - 0.6, d - 0.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* Arc Gas Exhaust Vents (Top & Bottom Slots) */}
      {[-1.8, 0, 1.8].map((x, idx) => (
        <React.Fragment key={idx}>
          {/* Top vents */}
          <mesh position={[x, h / 2 - 0.1, 0]}>
            <boxGeometry args={[1.0, 0.25, d - 0.8]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          {/* Bottom vents */}
          <mesh position={[x, -h / 2 + 0.1, 0]}>
            <boxGeometry args={[1.0, 0.25, d - 0.8]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Handle Aperture Cutout Bezel */}
      <mesh position={[0, 3.5, d / 2 + 0.08]}>
        <boxGeometry args={[2.8, 2.0, 0.15]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── 2. Line & Load Terminals ─────────────────────────────────────────────────
export function Terminal3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.9, 0.2);

  // Phase color indicator (R=Red, S=Yellow, T=Blue)
  const phaseAccent = comp.id.includes('R') ? '#ef4444' : comp.id.includes('S') ? '#eab308' : '#3b82f6';

  return (
    <group>
      {/* Heavy Copper/Brass Terminal Bar Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Cylindrical Terminal Screw Post */}
      <mesh position={[0, 0, d / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Hexagonal Screw Head Socket */}
      <mesh position={[0, 0, d / 2 + 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Cable Lug Chamfer Slot */}
      <mesh position={[0, -h / 4, 0]}>
        <cylinderGeometry args={[w / 3, w / 3, h / 2, 16]} />
        <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Phase Identification Ring */}
      <mesh position={[0, h / 2 - 0.15, 0]}>
        <boxGeometry args={[w + 0.05, 0.15, d + 0.05]} />
        <meshBasicMaterial color={phaseAccent} />
      </mesh>
    </group>
  );
}

// ── 3. Operating Handle ──────────────────────────────────────────────────────
export function Handle3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.1, 0.4);

  return (
    <group>
      {/* Pivot Housing Mount Base */}
      <mesh castShadow receiveShadow position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.5, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Ergonomic Toggle Switch Lever Bar */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0.2]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[w * 0.85, h * 1.1, d * 0.7]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Grip Ribs on Lever Front */}
      {[-0.3, 0, 0.3].map((y, idx) => (
        <mesh key={idx} position={[0, 0.4 + y, 0.2 + d * 0.35 + 0.04]}>
          <boxGeometry args={[w * 0.7, 0.1, 0.08]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>
      ))}

      {/* ON / OFF Position Indicator Stripe */}
      <mesh position={[0, h * 0.7, 0.2]}>
        <boxGeometry args={[w * 0.5, 0.12, 0.12]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

// ── 4. Operating Mechanism & Toggle Linkage ──────────────────────────────────
export function OperatingMechanism3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.8, 0.3);

  return (
    <group>
      {/* Galvanized Steel Frame Side Plates */}
      <mesh castShadow receiveShadow position={[-w / 2 + 0.15, 0, 0]}>
        <boxGeometry args={[0.2, h, d]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[w / 2 - 0.15, 0, 0]}>
        <boxGeometry args={[0.2, h, d]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Pivot Shaft Pins */}
      {[-0.6, 0.6].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, w + 0.1, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* Toggle Linkage Arm */}
      <mesh castShadow position={[0, 0.1, 0.2]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[w * 0.6, h * 0.45, 0.25]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Heavy Helical Opening Coil Spring */}
      <mesh position={[0, -0.2, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, h * 0.6, 12, 1, true]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} wireframe />
      </mesh>

      {/* Trip Latch Catch Hook */}
      <mesh position={[0, -h / 3, 0.3]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.2]} />
        <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── 5. Main Breaking Contacts ────────────────────────────────────────────────
export function MainContacts3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.95, 0.15);

  return (
    <group>
      {/* 3 Pole Sets (Phase R, S, T Contact Assemblies) */}
      {[-w / 3, 0, w / 3].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          {/* Stationary Contact Base Conductor Bar */}
          <mesh castShadow receiveShadow position={[0, -h / 4, -d / 4]}>
            <boxGeometry args={[0.6, h / 2, 0.3]} />
            <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Fixed Contact Silver Tip Button (AgW / AgNi Alloy) */}
          <mesh position={[0, 0.1, -d / 4 + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.05} />
          </mesh>

          {/* Moving Contact Arm (Pivoted Arm) */}
          <mesh castShadow position={[0, 0.2, d / 4]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.5, h * 0.65, 0.25]} />
            <meshStandardMaterial {...matProps} color="#d97706" />
          </mesh>

          {/* Moving Contact Silver Tip Button */}
          <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.05} />
          </mesh>

          {/* Flexible Copper Braided Shunt Wire */}
          <mesh position={[0, -0.4, d / 4]}>
            <cylinderGeometry args={[0.12, 0.12, 0.8, 8]} />
            <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.5} wireframe />
          </mesh>

          {/* Contact Compression Pressure Spring */}
          <mesh position={[0, 0, d / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 8, 1, true]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── 6. Arc Chute & De-ionization Plates ──────────────────────────────────────
export function ArcChute3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.7, 0.3);

  // Generate 7 parallel metallic splitter plates per phase
  const plateOffsets = [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6];

  return (
    <group>
      {/* Heat-Resistant Flame-Retardant Insulated Frame Outer Shell */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial {...matProps} transparent opacity={0.7} />
      </mesh>

      {/* Splitter Chamber Interiors for 3 Phases */}
      {[-w / 3, 0, w / 3].map((px, pIdx) => (
        <group key={pIdx} position={[px, 0, 0]}>
          {/* Upper & Lower Steel Arc Runners */}
          <mesh position={[0, h / 2 - 0.1, 0]}>
            <boxGeometry args={[1.2, 0.1, d - 0.2]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -h / 2 + 0.1, 0]}>
            <boxGeometry args={[1.2, 0.1, d - 0.2]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Stack of Metallic De-ionization Splitter Plates (Steel Fins with V-Notch) */}
          {plateOffsets.map((yOffset, fIdx) => (
            <mesh key={fIdx} position={[0, yOffset * (h * 0.6), 0]}>
              <boxGeometry args={[1.3, 0.08, d - 0.4]} />
              <meshStandardMaterial
                color="#cbd5e1"
                metalness={0.9}
                roughness={0.15}
                emissive={comp.status === 'testing' || comp.status === 'failure' ? '#f97316' : '#000000'}
                emissiveIntensity={comp.status === 'testing' ? 0.6 : 0.05}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ── 7. Bimetal Thermal Release Element ───────────────────────────────────────
export function BimetalRelease3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.8, 0.25);

  return (
    <group>
      {/* 3 Bimetallic Strip Assemblies for Phases R, S, T */}
      {[-w / 3, 0, w / 3].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          {/* Dual-Metal Strip (Bronze/Steel Composite with Deflection Curve) */}
          <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.3, h * 0.85, 0.15]} />
            <meshStandardMaterial {...matProps} color="#b45309" />
          </mesh>

          {/* High-Resistance Heating Wire Coil Wrapping */}
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, h * 0.45, 12, 1, true]} />
            <meshStandardMaterial
              color="#ea580c"
              metalness={0.7}
              wireframe
              emissive={comp.status === 'warning' || comp.status === 'failure' ? '#ef4444' : '#000000'}
              emissiveIntensity={comp.status === 'warning' ? 0.7 : 0.1}
            />
          </mesh>

          {/* Thermal Calibration Adjuster Screw Tip */}
          <mesh position={[0, h / 2 - 0.1, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Common Trip Shaft Bar */}
      <mesh position={[0, h / 2 - 0.2, 0.1]}>
        <boxGeometry args={[w * 0.85, 0.12, 0.12]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
    </group>
  );
}

// ── 8. Magnetic Instantaneous Release (Solenoid) ──────────────────────────────
export function MagneticRelease3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.85, 0.2);

  return (
    <group>
      {/* 3 Solenoid Coils for Phases R, S, T */}
      {[-w / 3, 0, w / 3].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          {/* U-Shaped Iron Yoke Frame */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.9, h * 0.9, d * 0.7]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
          </mesh>

          {/* Solenoid Copper Wire Coil Cylinder */}
          <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, h * 0.75, 20]} />
            <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Movable Iron Core Plunger Armature Pin */}
          <mesh position={[0, 0, d / 3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, d * 0.7, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Reset Compression Spring */}
          <mesh position={[0, 0, d / 3 + 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.4, 8, 1, true]} />
            <meshStandardMaterial color="#38bdf8" wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── 9. Electronic Trip Unit & Protection Module ──────────────────────────────
export function TripUnit3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.2, 0.5);

  return (
    <group>
      {/* Microprocessor Enclosure Block */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial {...matProps} color="#064e3b" roughness={0.4} />
      </mesh>

      {/* Dark Translucent Polycarbonate Control Fascia */}
      <mesh position={[0, 0, d / 2 + 0.04]}>
        <boxGeometry args={[w - 0.2, h - 0.4, 0.08]} />
        <meshStandardMaterial color="#022c22" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Rotary Current Adjustment Dials (Ir, Isd, Ii) */}
      {[-h / 3, 0, h / 3].map((y, idx) => (
        <group key={idx} position={[0, y, d / 2 + 0.1]}>
          {/* Dial Base Knob */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 16]} />
            <meshStandardMaterial color="#0f766e" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Indicator Notch Pointer */}
          <mesh position={[0, 0.18, 0.06]}>
            <boxGeometry args={[0.06, 0.15, 0.04]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Status LED Indicators (Power: Green, Alarm: Orange, Fault: Red) */}
      {[
        { y: h / 2 - 0.4, col: '#22c55e' },
        { y: h / 2 - 0.7, col: '#f59e0b' },
        { y: h / 2 - 1.0, col: '#ef4444' },
      ].map((led, idx) => (
        <mesh key={idx} position={[-w / 3, led.y, d / 2 + 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />
          <meshBasicMaterial color={led.col} />
        </mesh>
      ))}

      {/* Test Interface Port Connector */}
      <mesh position={[w / 3, -h / 3, d / 2 + 0.08]}>
        <boxGeometry args={[0.35, 0.6, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
    </group>
  );
}

// ── 10. Integrated Test Button ───────────────────────────────────────────────
export function TestButton3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;

  return (
    <group>
      {/* Button Collar Mount */}
      <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[w / 2, w / 2, d * 0.5, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} />
      </mesh>

      {/* Red Push Button Cap */}
      <mesh position={[0, 0, d * 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[w * 0.42, w * 0.42, d * 0.4, 16]} />
        <meshStandardMaterial
          color="#ef4444"
          roughness={0.2}
          emissive={comp.status === 'testing' ? '#ef4444' : '#000000'}
          emissiveIntensity={comp.status === 'testing' ? 0.8 : 0.1}
        />
      </mesh>

      {/* "TEST" Label Ring */}
      <mesh position={[0, 0, d * 0.56]}>
        <ringGeometry args={[w * 0.2, w * 0.38, 16]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── 11. Phase Isolation Barriers ──────────────────────────────────────────────
export function PhaseBarrier3D({ comp, color, emissive }: ModelProps) {
  const [w, h, d] = comp.dimensions;
  const matProps = getMaterialProps(comp, color, emissive, 0.1, 0.6);

  return (
    <group>
      {/* Two Insulating Shield Sheets between Phase R-S and S-T */}
      {[-w / 4, w / 4].map((x, idx) => (
        <mesh key={idx} castShadow receiveShadow position={[x, 0, 0]}>
          <boxGeometry args={[0.08, h, d]} />
          <meshStandardMaterial {...matProps} color="#475569" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ── 12. Dispatcher Component standard lookup ────────────────────────────────
export function CustomMCCBModel(props: ModelProps) {
  const { id } = props.comp;

  if (id === 'casing') return <Casing3D {...props} />;
  if (id.toLowerCase().includes('terminal')) return <Terminal3D {...props} />;
  if (id === 'handle') return <Handle3D {...props} />;
  if (id === 'operatingMechanism') return <OperatingMechanism3D {...props} />;
  if (id === 'mainContacts') return <MainContacts3D {...props} />;
  if (id === 'arcChute') return <ArcChute3D {...props} />;
  if (id === 'thermalElement') return <BimetalRelease3D {...props} />;
  if (id === 'magneticRelease') return <MagneticRelease3D {...props} />;
  if (id === 'tripUnit') return <TripUnit3D {...props} />;
  if (id === 'testButton') return <TestButton3D {...props} />;
  if (id === 'phaseBarriers') return <PhaseBarrier3D {...props} />;

  // Default fallback mesh with bevel box look
  const [w, h, d] = props.comp.dimensions;
  const matProps = getMaterialProps(props.comp, props.color, props.emissive);

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial {...matProps} />
    </mesh>
  );
}
