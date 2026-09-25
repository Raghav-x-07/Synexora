import React, { useRef, useEffect } from 'react';
import { TopicVisual } from './AIVideoVisualizerCard';

interface LiveMotionSimulationProps {
  visual: TopicVisual;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate?: (time: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

export const LiveMotionSimulation: React.FC<LiveMotionSimulationProps> = ({
  visual,
  currentTime,
  isPlaying,
  width = 800,
  height = 450,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = currentTime; // 0 to 10 seconds
    const progress = Math.min(Math.max(t / (visual.duration || 10), 0), 1); // 0.0 to 1.0
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // 1. Clear background with deep dark slate cinematic gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.8);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.6, '#020617');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle background engineering grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Determine simulation type with smart keyword fallback
    const rawTopic = (visual.topic + ' ' + (visual.caption || '') + ' ' + (visual.simulationType || '')).toLowerCase();
    let simType = visual.simulationType || 'particles';

    if (rawTopic.includes('dna') || rawTopic.includes('helix') || rawTopic.includes('crispr') || rawTopic.includes('replicat') || rawTopic.includes('genetic')) {
      simType = 'dna';
    } else if (rawTopic.includes('tree') || rawTopic.includes('avl') || rawTopic.includes('bst') || rawTopic.includes('graph') || rawTopic.includes('heap')) {
      simType = 'binary-tree';
    } else if (rawTopic.includes('sort') || rawTopic.includes('search') || rawTopic.includes('algorithm') || rawTopic.includes('quicksort') || rawTopic.includes('mergesort')) {
      simType = 'sorting-algorithm';
    } else if (rawTopic.includes('neural') || rawTopic.includes('network') || rawTopic.includes('packet') || rawTopic.includes('ai') || rawTopic.includes('tcp')) {
      simType = 'neural-network';
    } else if (rawTopic.includes('circuit') || rawTopic.includes('ohm') || rawTopic.includes('gate') || rawTopic.includes('transistor') || rawTopic.includes('voltage') || rawTopic.includes('logic')) {
      simType = 'circuit-electronics';
    } else if (rawTopic.includes('orbit') || rawTopic.includes('planet') || rawTopic.includes('solar') || rawTopic.includes('gravity') || rawTopic.includes('kepler') || rawTopic.includes('satellite')) {
      simType = 'orbital-physics';
    } else if (rawTopic.includes('wave') || rawTopic.includes('interfer') || rawTopic.includes('optics') || rawTopic.includes('light') || rawTopic.includes('photon') || rawTopic.includes('quantum') || rawTopic.includes('sound')) {
      simType = 'quantum-wave';
    } else if (rawTopic.includes('atom') || rawTopic.includes('bond') || rawTopic.includes('covalent') || rawTopic.includes('ionic') || rawTopic.includes('bohr') || rawTopic.includes('electron') || rawTopic.includes('molecule')) {
      simType = 'atomic-bonding';
    } else if (rawTopic.includes('mitosis') || rawTopic.includes('cell') || rawTopic.includes('membrane') || rawTopic.includes('bacteria') || rawTopic.includes('organelle') || rawTopic.includes('meiosis')) {
      simType = 'cellular';
    } else if (rawTopic.includes('calculus') || rawTopic.includes('derivative') || rawTopic.includes('integral') || rawTopic.includes('math') || rawTopic.includes('curve') || rawTopic.includes('geometry')) {
      simType = 'flowchart-math';
    }

    // =========================================================================
    // 🧬 SIMULATION 1: DNA DOUBLE HELIX & REPLICATION (Molecular Biology)
    // =========================================================================
    if (simType === 'dna') {
      const numRungs = 24;
      const rungSpacing = (w * 0.75) / numRungs;
      const startX = cx - (w * 0.38);
      const amp = 70;
      const unzippingProgress = Math.min(Math.max((progress - 0.25) / 0.5, 0), 1); // unzips from 2.5s to 7.5s

      // Base pairs colors: Adenine (Blue), Thymine (Green), Cytosine (Pink), Guanine (Yellow)
      const baseColors = [
        { top: '#38bdf8', bot: '#34d399', topName: 'Adenine (A)', botName: 'Thymine (T)' },
        { top: '#f43f5e', bot: '#fbbf24', topName: 'Cytosine (C)', botName: 'Guanine (G)' },
        { top: '#34d399', bot: '#38bdf8', topName: 'Thymine (T)', botName: 'Adenine (A)' },
        { top: '#fbbf24', bot: '#f43f5e', topName: 'Guanine (G)', botName: 'Cytosine (C)' },
      ];

      for (let i = 0; i < numRungs; i++) {
        const x = startX + i * rungSpacing;
        const phaseOffset = i * 0.45 + t * 2.5;
        const sinVal = Math.sin(phaseOffset);
        const cosVal = Math.cos(phaseOffset);

        // Unzipping split effect for replication fork
        const splitFactor = i > numRungs * (1 - unzippingProgress) ? (i - numRungs * (1 - unzippingProgress)) * 5.5 : 0;

        const y1 = cy + sinVal * amp - splitFactor;
        const y2 = cy - sinVal * amp + splitFactor;
        const depth = cosVal; // -1 (back) to +1 (front)

        const pair = baseColors[i % 4];

        // Draw Base Pair Rung
        if (splitFactor < 15) {
          ctx.strokeStyle = depth > 0 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, (y1 + y2) / 2);
          ctx.strokeStyle = pair.top;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x, (y1 + y2) / 2);
          ctx.lineTo(x, y2);
          ctx.strokeStyle = pair.bot;
          ctx.stroke();

          // Hydrogen bond center dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, (y1 + y2) / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Unzipped strands with newly forming daughter base pairs
          ctx.strokeStyle = pair.top;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y1 + 14);
          ctx.stroke();

          ctx.strokeStyle = pair.bot;
          ctx.beginPath();
          ctx.moveTo(x, y2);
          ctx.lineTo(x, y2 - 14);
          ctx.stroke();

          // Synthesized complementary daughter strand pulse
          if (progress > 0.6) {
            ctx.strokeStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(x, y1 + 18, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Backbone sugar-phosphate nodes
        const nodeRadius = 5 + depth * 2.5;
        // Strand 1 (5' to 3')
        ctx.fillStyle = depth > 0 ? '#06b6d4' : '#0e7490';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = depth > 0 ? 10 : 2;
        ctx.beginPath();
        ctx.arc(x, y1, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Strand 2 (3' to 5')
        ctx.fillStyle = depth < 0 ? '#ec4899' : '#be185d';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = depth < 0 ? 10 : 2;
        ctx.beginPath();
        ctx.arc(x, y2, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Helicase Enzyme Callout at the replication fork
      if (unzippingProgress > 0 && unzippingProgress < 0.95) {
        const forkX = startX + numRungs * (1 - unzippingProgress) * rungSpacing;
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(forkX, cy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HELICASE', forkX, cy - 26);
      }

      // Strand labels
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#06b6d4';
      ctx.textAlign = 'left';
      ctx.fillText("5' ── Leading Template Strand ── 3'", startX, cy - amp - 25);
      ctx.fillStyle = '#ec4899';
      ctx.fillText("3' ── Lagging Template Strand (Okazaki) ── 5'", startX, cy + amp + 38);
    }

    // =========================================================================
    // 🌳 SIMULATION 2: BINARY SEARCH TREE & AVL ROTATION (Computer Science)
    // =========================================================================
    else if (simType === 'binary-tree') {

      interface TreeNode {
        id: string;
        val: number;
        x: number;
        y: number;
        left?: string;
        right?: string;
        highlight?: boolean;
      }

      const nodes: Record<string, TreeNode> = {
        root: { id: 'root', val: 50, x: cx, y: cy - 100, left: 'n2', right: 'n3' },
        n2: { id: 'n2', val: 25, x: cx - 140, y: cy - 20, left: 'n4', right: 'n5' },
        n3: { id: 'n3', val: 75, x: cx + 140, y: cy - 20, left: 'n6', right: 'n7' },
        n4: { id: 'n4', val: 12, x: cx - 200, y: cy + 60 },
        n5: { id: 'n5', val: 37, x: cx - 80, y: cy + 60 },
        n6: { id: 'n6', val: 62, x: cx + 80, y: cy + 60 },
        n7: { id: 'n7', val: 88, x: cx + 200, y: cy + 60 },
      };

      // Traversal search pulse based on time
      const searchPath = ['root', 'n3', 'n7'];
      const activeNodeId = searchPath[Math.min(Math.floor(progress * searchPath.length * 1.5), searchPath.length - 1)];

      // Draw Edges
      Object.values(nodes).forEach((n) => {
        [n.left, n.right].forEach((childId) => {
          if (!childId || !nodes[childId]) return;
          const child = nodes[childId];
          const isTraversed = searchPath.includes(n.id) && searchPath.includes(childId) && progress > 0.2;

          ctx.strokeStyle = isTraversed ? '#10b981' : 'rgba(100, 116, 139, 0.6)';
          ctx.lineWidth = isTraversed ? 3.5 : 2;
          ctx.shadowColor = isTraversed ? '#10b981' : 'transparent';
          ctx.shadowBlur = isTraversed ? 12 : 0;

          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(child.x, child.y);
          ctx.stroke();
        });
      });

      // Draw Nodes
      Object.values(nodes).forEach((n) => {
        const isCurrent = n.id === activeNodeId;
        const isTarget = n.val === 88 && progress > 0.65;

        const nodeGrad = ctx.createRadialGradient(n.x, n.y, 2, n.x, n.y, 24);
        if (isTarget) {
          nodeGrad.addColorStop(0, '#34d399');
          nodeGrad.addColorStop(1, '#059669');
        } else if (isCurrent) {
          nodeGrad.addColorStop(0, '#60a5fa');
          nodeGrad.addColorStop(1, '#2563eb');
        } else {
          nodeGrad.addColorStop(0, '#334155');
          nodeGrad.addColorStop(1, '#1e293b');
        }

        ctx.fillStyle = nodeGrad;
        ctx.shadowColor = isTarget ? '#10b981' : isCurrent ? '#38bdf8' : 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = isTarget || isCurrent ? 16 : 4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isTarget ? '#a7f3d0' : isCurrent ? '#93c5fd' : '#475569';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Node Value
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(n.val.toString(), n.x, n.y);

        // Height / Balance factor tag
        ctx.font = '9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('BF:0', n.x, n.y + 32);
      });

      // Status readout
      ctx.textAlign = 'left';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = progress > 0.65 ? '#10b981' : '#38bdf8';
      ctx.fillText(
        progress > 0.65 ? '✓ TARGET NODE [88] FOUND • BST Search O(log n)' : '⚡ EVALUATING BST BRANCH: root(50) ➔ right(75) ➔ target(88)',
        cx - 200,
        cy - 145
      );
    }

    // =========================================================================
    // 📊 SIMULATION 3: SORTING ALGORITHM & COMPLEXITY (Algorithms)
    // =========================================================================
    else if (simType === 'sorting-algorithm') {
      const bars = [45, 18, 72, 33, 89, 21, 64, 50, 95, 12, 58];
      const barWidth = 46;
      const startX = cx - (bars.length * (barWidth + 8)) / 2;

      // Sorting progress animation simulation
      const pivotIdx = Math.min(Math.floor(progress * bars.length), bars.length - 1);

      bars.forEach((val, idx) => {
        const bx = startX + idx * (barWidth + 8);
        const barHeight = val * 2.2;
        const by = cy + 90 - barHeight;

        const isPivot = idx === pivotIdx;
        const isSorted = idx <= Math.floor(progress * bars.length);

        ctx.fillStyle = isPivot ? '#f59e0b' : isSorted ? 'rgba(16, 185, 129, 0.85)' : 'rgba(56, 189, 248, 0.75)';
        ctx.shadowColor = isPivot ? '#f59e0b' : isSorted ? '#10b981' : '#38bdf8';
        ctx.shadowBlur = isPivot || isSorted ? 12 : 2;

        ctx.fillRect(bx, by, barWidth, barHeight);
        ctx.strokeStyle = isPivot ? '#ffffff' : '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, barWidth, barHeight);

        // Value text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(val.toString(), bx + barWidth / 2, by - 8);

        // Index
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(`[${idx}]`, bx + barWidth / 2, cy + 106);
      });

      // Pointer Arrow for Current Partition Comparison
      const activeX = startX + pivotIdx * (barWidth + 8) + barWidth / 2;
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('▲ ACTIVE PIVOT', activeX, cy + 126);

      ctx.textAlign = 'left';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`⚡ QUICKSORT PARTITIONING: Partition Pivot [${bars[pivotIdx]}] • O(n log n)`, startX, cy - 130);
    }

    // =========================================================================
    // 🧠 SIMULATION 4: NEURAL NETWORK & SYNAPSE FORWARD PROP (AI / Networks)
    // =========================================================================
    else if (simType === 'neural-network') {
      const layers = [
        { name: 'Input Layer', count: 4, x: cx - 220, color: '#38bdf8' },
        { name: 'Hidden Layer 1', count: 5, x: cx - 70, color: '#818cf8' },
        { name: 'Hidden Layer 2', count: 5, x: cx + 70, color: '#c084fc' },
        { name: 'Output Layer', count: 3, x: cx + 220, color: '#34d399' },
      ];

      // Draw Synapses
      for (let l = 0; l < layers.length - 1; l++) {
        const l1 = layers[l];
        const l2 = layers[l + 1];

        for (let i = 0; i < l1.count; i++) {
          const y1 = cy - ((l1.count - 1) * 45) / 2 + i * 45;
          for (let j = 0; j < l2.count; j++) {
            const y2 = cy - ((l2.count - 1) * 45) / 2 + j * 45;

            // Signal pulse timing
            const pulsePhase = (t * 3 + l * 0.8 + (i + j) * 0.2) % 3;
            const isFiring = pulsePhase < 0.6;

            ctx.strokeStyle = isFiring ? 'rgba(56, 189, 248, 0.75)' : 'rgba(71, 85, 105, 0.25)';
            ctx.lineWidth = isFiring ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(l1.x, y1);
            ctx.lineTo(l2.x, y2);
            ctx.stroke();

            if (isFiring) {
              const px = l1.x + (l2.x - l1.x) * (pulsePhase / 0.6);
              const py = y1 + (y2 - y1) * (pulsePhase / 0.6);
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw Neurons
      layers.forEach((layer) => {
        for (let i = 0; i < layer.count; i++) {
          const ny = cy - ((layer.count - 1) * 45) / 2 + i * 45;
          const isActivated = Math.sin(t * 4 + layer.x * 0.05 + i) > 0.1;

          ctx.fillStyle = isActivated ? layer.color : '#1e293b';
          ctx.shadowColor = layer.color;
          ctx.shadowBlur = isActivated ? 14 : 2;
          ctx.beginPath();
          ctx.arc(layer.x, ny, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Layer labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(layer.name, layer.x, cy + 135);
      });
    }

    // =========================================================================
    // ⚡ SIMULATION 5: CIRCUIT SCHEMATICS & CURRENT FLOW (Electrical / Logic)
    // =========================================================================
    else if (simType === 'circuit-electronics') {
      const rx = cx - 180;
      const ry = cy - 80;
      const rw = 360;
      const rh = 160;

      // Circuit Wire Loop
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.strokeRect(rx, ry, rw, rh);

      // Voltage Source Battery (Left)
      ctx.fillStyle = '#020617';
      ctx.fillRect(rx - 15, cy - 30, 30, 60);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      // Long line (+V)
      ctx.beginPath();
      ctx.moveTo(rx - 20, cy - 18);
      ctx.lineTo(rx + 20, cy - 18);
      ctx.stroke();
      // Short line (-V)
      ctx.beginPath();
      ctx.moveTo(rx - 10, cy + 18);
      ctx.lineTo(rx + 10, cy + 18);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('+12V DC', rx - 55, cy);

      // Resistor (Top)
      ctx.fillStyle = '#020617';
      ctx.fillRect(cx - 40, ry - 15, 80, 30);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 35, ry);
      ctx.lineTo(cx - 25, ry - 12);
      ctx.lineTo(cx - 10, ry + 12);
      ctx.lineTo(cx + 5, ry - 12);
      ctx.lineTo(cx + 20, ry + 12);
      ctx.lineTo(cx + 35, ry);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px monospace';
      ctx.fillText('R = 220Ω', cx, ry - 24);

      // LED / Diode (Right)
      ctx.fillStyle = '#020617';
      ctx.fillRect(rx + rw - 20, cy - 25, 40, 50);
      const isLedOn = progress > 0.2;
      ctx.fillStyle = isLedOn ? '#ef4444' : '#7f1d1d';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = isLedOn ? 25 : 2;
      ctx.beginPath();
      ctx.arc(rx + rw, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Electron particle flow along circuit
      const numElectrons = 16;
      for (let i = 0; i < numElectrons; i++) {
        const ep = (t * 0.8 + i / numElectrons) % 1;
        const perimeter = 2 * (rw + rh);
        const dist = ep * perimeter;

        let ex = rx;
        let ey = ry;
        if (dist < rw) {
          ex = rx + dist;
          ey = ry;
        } else if (dist < rw + rh) {
          ex = rx + rw;
          ey = ry + (dist - rw);
        } else if (dist < 2 * rw + rh) {
          ex = rx + rw - (dist - rw - rh);
          ey = ry + rh;
        } else {
          ex = rx;
          ey = ry + rh - (dist - 2 * rw - rh);
        }

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.textAlign = 'left';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`⚡ OHM'S LAW: I = V/R = 54.5 mA • Active Current Vector Flow`, rx, cy + 120);
    }

    // =========================================================================
    // 🪐 SIMULATION 6: ORBITAL PHYSICS & GRAVITATION (Physics / Astronomy)
    // =========================================================================
    else if (simType === 'orbital-physics') {
      // Central Star / Black Hole with Coronal Glow
      const sunGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#f59e0b');
      sunGrad.addColorStop(0.7, '#d97706');
      sunGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.fill();

      // Gravitational waves
      for (let r = 70; r < 340; r += 70) {
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.25 - r * 0.0006})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.sin(t * 3 + r) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Keplerian Orbits
      const planets = [
        { rx: 95, ry: 50, speed: 2.4, color: '#38bdf8', size: 6, label: 'Mercury (Fast Perihelion)' },
        { rx: 170, ry: 90, speed: 1.5, color: '#34d399', size: 8, label: 'Earth (1.0 AU Habitual)' },
        { rx: 250, ry: 130, speed: 0.9, color: '#f43f5e', size: 10, label: 'Mars (Elliptical eccentricity)' },
        { rx: 320, ry: 165, speed: 0.5, color: '#c084fc', size: 13, label: 'Jupiter (Gas Giant)' },
      ];

      planets.forEach((p) => {
        // Orbit Ellipse
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Planet Position
        const angle = t * p.speed;
        const px = cx + Math.cos(angle) * p.rx;
        const py = cy + Math.sin(angle) * p.ry;

        // Velocity vector arrow
        const vx = -Math.sin(angle) * 18;
        const vy = Math.cos(angle) * 18 * (p.ry / p.rx);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + vx, py + vy);
        ctx.stroke();

        // Planet Body
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        ctx.fillText(p.label, px + p.size + 4, py - 4);
      });
    }

    // =========================================================================
    // 🌊 SIMULATION 7: QUANTUM WAVE & OPTICS INTERFERENCE (Optics / Physics)
    // =========================================================================
    else if (simType === 'quantum-wave') {
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        const color = i === 0 ? '#38bdf8' : i === 1 ? '#34d399' : '#c084fc';
        const freq = 0.025 + i * 0.01;
        const amp = 45 - i * 8;
        const speed = (i + 1) * 3;

        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const y = cy + Math.sin(x * freq + t * speed) * amp * (0.5 + Math.sin(progress * Math.PI) * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Constructive Interference Peak Highlight
      const peakX = (t * 80) % w;
      const peakY = cy + Math.sin(peakX * 0.025 + t * 3) * 45;
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(peakX, peakY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('CONSTRUCTIVE PEAK [λ]', peakX, peakY - 14);
    }

    // =========================================================================
    // ⚛️ SIMULATION 8: ATOMIC BOHR SHELLS & CHEMICAL BONDING (Chemistry)
    // =========================================================================
    else if (simType === 'atomic-bonding') {
      // Nucleus
      const nucGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 28);
      nucGrad.addColorStop(0, '#f43f5e');
      nucGrad.addColorStop(0.6, '#38bdf8');
      nucGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();

      // Protons / Neutrons dots inside nucleus
      for (let i = 0; i < 7; i++) {
        const ang = i * 0.9;
        const dist = 8;
        ctx.fillStyle = i % 2 === 0 ? '#f43f5e' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shells: K-Shell (n=1), L-Shell (n=2), M-Shell (n=3)
      const shells = [
        { r: 75, electrons: 2, speed: 3.5, label: 'K-Shell (n=1)' },
        { r: 145, electrons: 8, speed: 2.0, label: 'L-Shell (n=2)' },
        { r: 215, electrons: 4, speed: 1.2, label: 'M-Valence Shell (n=3)' },
      ];

      shells.forEach((shell) => {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, shell.r, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < shell.electrons; i++) {
          const eAngle = (i / shell.electrons) * Math.PI * 2 + t * shell.speed;
          const ex = cx + Math.cos(eAngle) * shell.r;
          const ey = cy + Math.sin(eAngle) * shell.r;

          ctx.fillStyle = '#34d399';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(shell.label, cx + shell.r + 6, cy);
      });
    }

    // =========================================================================
    // 🧬 SIMULATION 9: CELLULAR & MITOSIS (Default Biology)
    // =========================================================================
    else if (simType === 'cellular') {
      const splitProgress = Math.min(Math.max((progress - 0.3) / 0.5, 0), 1);
      const cellSep = splitProgress * (w * 0.28);
      const leftX = cx - cellSep;
      const rightX = cx + cellSep;
      const cellRadius = 110 - splitProgress * 20;

      // Spindle fibers
      if (progress > 0.2 && progress < 0.85) {
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
        ctx.lineWidth = 1.5;
        for (let i = -4; i <= 4; i++) {
          ctx.beginPath();
          ctx.moveTo(leftX - cellRadius * 0.7, cy);
          ctx.quadraticCurveTo(cx, cy + i * 28, rightX + cellRadius * 0.7, cy);
          ctx.stroke();
        }
      }

      // Membranes
      [leftX, splitProgress > 0 ? rightX : null].filter(Boolean).forEach((xCoord) => {
        if (!xCoord) return;
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= 36; i++) {
          const angle = (i / 36) * Math.PI * 2;
          const wave = Math.sin(angle * 6 + t * 4) * 4;
          const r = cellRadius + wave;
          const px = xCoord + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      });
    }

    // =========================================================================
    // 📐 SIMULATION 10: MATH, DERIVATIVE & CALCULUS (Mathematics / Flow)
    // =========================================================================
    else {
      // Cartesian Coordinate axes
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, cy);
      ctx.lineTo(w - 60, cy);
      ctx.moveTo(cx, 40);
      ctx.lineTo(cx, h - 40);
      ctx.stroke();

      // Plot curve f(x) = sin(x) + x^2 / scale
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let px = 60; px < w - 60; px += 2) {
        const nx = (px - cx) * 0.02;
        const ny = Math.sin(nx * 2 + t * 1.5) * 60 - Math.pow(nx, 2) * 5;
        const py = cy - ny;
        if (px === 60) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Tangent derivative slope line at current position
      const targetPx = cx - 140 + progress * 280;
      const targetNx = (targetPx - cx) * 0.02;
      const targetNy = Math.sin(targetNx * 2 + t * 1.5) * 60 - Math.pow(targetNx, 2) * 5;
      const targetPy = cy - targetNy;

      // Tangent line
      const slope = Math.cos(targetNx * 2 + t * 1.5) * 2 * 60 * 0.02 - 2 * targetNx * 5 * 0.02;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(targetPx - 60, targetPy + slope * 60);
      ctx.lineTo(targetPx + 60, targetPy - slope * 60);
      ctx.stroke();

      // Tangent point
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(targetPx, targetPy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`dy/dx = ${(slope).toFixed(3)}`, targetPx + 12, targetPy - 12);
    }

    // =========================================================================
    // 🌟 HUD OVERLAY: DYNAMIC REAL-TIME CONCEPT TRACKER & PHASE MECHANICS
    // =========================================================================
    // Top-Left Concept Title & Domain Pill
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 13px sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(`⚡ ${visual.videoTitle || visual.topic}`, 18, 26);

    // Active Phase Marker
    const milestones = visual.milestones || [];
    const activeMilestone = milestones.reduce((latest, m) => {
      return t >= m.seconds ? m : latest;
    }, milestones[0]) || { title: 'Dynamic Educational Simulation', timestamp: '0:00', desc: visual.caption };

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`[${activeMilestone.timestamp}] ${activeMilestone.title.toUpperCase()}`, 18, 46);

    // Dynamic Live Stage Subtext Banner (Bottom Left)
    if (activeMilestone.desc) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(14, h - 42, w - 28, 28);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(14, h - 42, w - 28, 28);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px sans-serif';
      const textTruncated = activeMilestone.desc.length > 95 ? activeMilestone.desc.slice(0, 95) + '...' : activeMilestone.desc;
      ctx.fillText(`ℹ️ ${textTruncated}`, 24, h - 24);
    }

    // Bottom Right Watermark
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '10px monospace';
    ctx.fillText('Synexora AI • Gemini 2.5 Motion Engine', w - 24, 26);

  }, [currentTime, isPlaying, visual, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`w-full h-full object-contain rounded-lg ${className}`}
    />
  );
};
