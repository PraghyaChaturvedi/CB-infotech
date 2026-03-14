"use client"

/**
 * JarvisHUD - Full-screen ambient tech atmosphere
 * No text labels. Rich visual elements spread across entire viewport.
 * Mouse parallax on two depth layers.
 */

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// ─── Pulsing glow orb ───────────────────────────────────────────────────────
function GlowOrb({ x, y, size, delay, duration, color = '#00D4FF', blur = 30 }: {
  x: string; y: string; size: number; delay: number; duration: number
  color?: string; blur?: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: color,
        filter: `blur(${blur}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ opacity: [0.04, 0.14, 0.04], scale: [0.85, 1.15, 0.85] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

// ─── Sharp glowing dot ───────────────────────────────────────────────────────
function Dot({ x, y, size = 4, delay, duration, opacity = 0.6 }: {
  x: string; y: string; size?: number; delay: number; duration: number; opacity?: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: '#00D4FF',
        boxShadow: `0 0 ${size * 3}px ${size}px rgba(0,212,255,${opacity * 0.4})`,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ opacity: [opacity * 0.3, opacity, opacity * 0.3] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

// ─── Rotating polygon wireframe ──────────────────────────────────────────────
function RotatingShape({ x, y, size, sides, duration, delay, clockwise = true, strokeOpacity = 0.2 }: {
  x: string; y: string; size: number; sides: number; duration: number; delay: number
  clockwise?: boolean; strokeOpacity?: number
}) {
  const points = Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    const r = size / 2 - 2
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`
  }).join(' ')

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, transform: 'translate(-50%, -50%)' }}
      animate={{ rotate: clockwise ? [0, 360] : [0, -360] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
        <polygon
          points={points}
          stroke={`rgba(0,212,255,${strokeOpacity})`}
          strokeWidth="1"
          fill={`rgba(0,212,255,0.02)`}
        />
        {/* corner accent dots */}
        {Array.from({ length: sides }, (_, i) => {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
          const r = size / 2 - 2
          const cx = 50 + (r / (size / 2)) * r * Math.cos(angle) / r * 50
          const cy = 50 + (r / (size / 2)) * r * Math.sin(angle) / r * 50
          return i % 2 === 0 ? (
            <circle key={i} cx={50 + (size/2 - 2) / (size/2) * 50 * Math.cos(angle)}
              cy={50 + (size/2 - 2) / (size/2) * 50 * Math.sin(angle)}
              r="2" fill={`rgba(0,212,255,${strokeOpacity * 1.5})`} />
          ) : null
        })}
      </svg>
    </motion.div>
  )
}

// ─── Thin line (horizontal or vertical) ─────────────────────────────────────
function Line({ vertical, pos, start, length, delay, opacity }: {
  vertical?: boolean; pos: string; start: string; length: string
  delay: number; opacity: number
}) {
  const style: React.CSSProperties = vertical
    ? { left: pos, top: start, width: 1, height: length,
        background: `linear-gradient(to bottom, transparent, rgba(0,212,255,${opacity}), transparent)` }
    : { top: pos, left: start, height: 1, width: length,
        background: `linear-gradient(to right, transparent, rgba(0,212,255,${opacity}), transparent)` }

  return (
    <motion.div className="absolute pointer-events-none" style={style}
      animate={{ opacity: [0.1, 0.7, 0.1] }}
      transition={{ duration: 4 + delay * 0.5, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

// ─── Corner bracket ──────────────────────────────────────────────────────────
function Bracket({ x, y, rot, size = 40, opacity = 0.3, delay }: {
  x: string; y: string; rot: number; size?: number; opacity?: number; delay: number
}) {
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)` }}
      animate={{ opacity: [opacity * 0.4, opacity, opacity * 0.4] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M2 20 L2 2 L20 2" stroke="rgba(0,212,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

// ─── Dashed arc segment ───────────────────────────────────────────────────────
function ArcSegment({ x, y, r, startAngle, endAngle, duration, delay, opacity }: {
  x: string; y: string; r: number; startAngle: number; endAngle: number
  duration: number; delay: number; opacity: number
}) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const cx = r + 2, cy = r + 2
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const large = endAngle - startAngle > 180 ? 1 : 0
  const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  const size = (r + 2) * 2

  return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <path d={d} stroke={`rgba(0,212,255,${opacity})`} strokeWidth="1"
          strokeDasharray="6 4" strokeLinecap="round" />
        {/* leading dot */}
        <circle cx={x1} cy={y1} r="2.5" fill={`rgba(0,212,255,${opacity * 1.5})`} />
      </svg>
    </motion.div>
  )
}

// ─── Cross / plus mark ───────────────────────────────────────────────────────
function CrossMark({ x, y, size = 16, delay, opacity = 0.3 }: {
  x: string; y: string; size?: number; delay: number; opacity?: number
}) {
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}
      animate={{ opacity: [opacity * 0.3, opacity, opacity * 0.3], rotate: [0, 90, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <line x1="8" y1="0" x2="8" y2="16" stroke="rgba(0,212,255,0.6)" strokeWidth="1" />
        <line x1="0" y1="8" x2="16" y2="8" stroke="rgba(0,212,255,0.6)" strokeWidth="1" />
        <circle cx="8" cy="8" r="1.5" fill="rgba(0,212,255,0.8)" />
      </svg>
    </motion.div>
  )
}

// ─── Floating grid tile ───────────────────────────────────────────────────────
function GridTile({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: 'translate(-50%,-50%)', width: 60, height: 60 }}
      animate={{ opacity: [0.03, 0.1, 0.03] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        {[0,20,40,60].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="60" stroke="rgba(0,212,255,1)" strokeWidth="0.5" />
            <line x1="0" y1={v} x2="60" y2={v} stroke="rgba(0,212,255,1)" strokeWidth="0.5" />
          </g>
        ))}
      </svg>
    </motion.div>
  )
}

export function JarvisHUD() {
  const slowX = useSpring(useMotionValue(0), { stiffness: 18, damping: 14 })
  const slowY = useSpring(useMotionValue(0), { stiffness: 18, damping: 14 })
  const fastX = useSpring(useMotionValue(0), { stiffness: 55, damping: 24 })
  const fastY = useSpring(useMotionValue(0), { stiffness: 55, damping: 24 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
      slowX.set(nx * 20); slowY.set(ny * 20)
      fastX.set(nx * 40); fastY.set(ny * 40)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [slowX, slowY, fastX, fastY])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">

      {/* ── LAYER A: Large ambient glows (slowest) ── */}
      <motion.div className="absolute inset-0" style={{ x: slowX, y: slowY }}>
        <GlowOrb x="8%"   y="15%"  size={350} delay={0}   duration={7}  blur={80} />
        <GlowOrb x="92%"  y="10%"  size={300} delay={2}   duration={8}  blur={70} color="#0088FF" />
        <GlowOrb x="85%"  y="85%"  size={400} delay={1}   duration={9}  blur={90} />
        <GlowOrb x="10%"  y="80%"  size={320} delay={3}   duration={7}  blur={75} color="#00AADD" />
        <GlowOrb x="50%"  y="50%"  size={200} delay={1.5} duration={6}  blur={60} />
        <GlowOrb x="50%"  y="0%"   size={250} delay={0.5} duration={10} blur={80} color="#005599" />
        <GlowOrb x="50%"  y="100%" size={280} delay={2.5} duration={8}  blur={80} color="#004488" />
      </motion.div>

      {/* ── LAYER B: Mid elements — lines, arcs, brackets (slow) ── */}
      <motion.div className="absolute inset-0" style={{ x: slowX, y: slowY }}>
        {/* Vertical lines */}
        <Line vertical pos="6%"  start="10%" length="35%" delay={0}   opacity={0.1} />
        <Line vertical pos="94%" start="15%" length="40%" delay={1.5} opacity={0.1} />
        <Line vertical pos="20%" start="5%"  length="25%" delay={2}   opacity={0.07} />
        <Line vertical pos="80%" start="5%"  length="30%" delay={0.8} opacity={0.07} />
        <Line vertical pos="35%" start="70%" length="28%" delay={1.2} opacity={0.06} />
        <Line vertical pos="65%" start="72%" length="25%" delay={2.5} opacity={0.06} />
        <Line vertical pos="50%" start="0%"  length="18%" delay={3}   opacity={0.05} />
        <Line vertical pos="50%" start="82%" length="18%" delay={1.8} opacity={0.05} />
        {/* Horizontal lines */}
        <Line pos="8%"  start="2%"  length="30%" delay={0.5} opacity={0.08} />
        <Line pos="92%" start="5%"  length="28%" delay={2}   opacity={0.08} />
        <Line pos="8%"  start="68%" length="30%" delay={1}   opacity={0.07} />
        <Line pos="92%" start="65%" length="32%" delay={1.5} opacity={0.07} />
        <Line pos="50%" start="0%"  length="15%" delay={3}   opacity={0.05} />
        <Line pos="50%" start="85%" length="15%" delay={0.8} opacity={0.05} />

        {/* Corner brackets — all 4 corners + 4 midpoints */}
        <Bracket x="4%"  y="6%"   rot={0}   size={44} opacity={0.35} delay={0}   />
        <Bracket x="96%" y="6%"   rot={90}  size={44} opacity={0.35} delay={1}   />
        <Bracket x="4%"  y="94%"  rot={270} size={44} opacity={0.35} delay={0.5} />
        <Bracket x="96%" y="94%"  rot={180} size={44} opacity={0.35} delay={1.5} />
        <Bracket x="4%"  y="50%"  rot={0}   size={32} opacity={0.2}  delay={2}   />
        <Bracket x="96%" y="50%"  rot={90}  size={32} opacity={0.2}  delay={2.5} />
        <Bracket x="50%" y="4%"   rot={45}  size={28} opacity={0.18} delay={3}   />
        <Bracket x="50%" y="96%"  rot={225} size={28} opacity={0.18} delay={1.2} />

        {/* Arc segments scattered around */}
        <ArcSegment x="8%"   y="30%"  r={50}  startAngle={200} endAngle={340} duration={20} delay={0}   opacity={0.2} />
        <ArcSegment x="92%"  y="30%"  r={55}  startAngle={20}  endAngle={160} duration={25} delay={1.5} opacity={0.2} />
        <ArcSegment x="8%"   y="70%"  r={45}  startAngle={180} endAngle={360} duration={18} delay={0.8} opacity={0.18} />
        <ArcSegment x="92%"  y="70%"  r={50}  startAngle={0}   endAngle={180} duration={22} delay={2}   opacity={0.18} />
        <ArcSegment x="30%"  y="5%"   r={40}  startAngle={10}  endAngle={170} duration={30} delay={1}   opacity={0.14} />
        <ArcSegment x="70%"  y="95%"  r={40}  startAngle={190} endAngle={350} duration={28} delay={2.5} opacity={0.14} />
        <ArcSegment x="50%"  y="8%"   r={60}  startAngle={210} endAngle={330} duration={35} delay={0.5} opacity={0.12} />
        <ArcSegment x="50%"  y="92%"  r={60}  startAngle={30}  endAngle={150} duration={32} delay={1.8} opacity={0.12} />
      </motion.div>

      {/* ── LAYER C: Fast parallax — dots, shapes, crossmarks ── */}
      <motion.div className="absolute inset-0" style={{ x: fastX, y: fastY }}>
        {/* Sharp dots all around viewport edges */}
        <Dot x="3%"   y="8%"   size={5} delay={0}   duration={3.5} />
        <Dot x="97%"  y="8%"   size={4} delay={1.2} duration={4}   />
        <Dot x="97%"  y="92%"  size={6} delay={0.5} duration={3}   />
        <Dot x="3%"   y="92%"  size={4} delay={2}   duration={4.5} />
        <Dot x="50%"  y="3%"   size={3} delay={1.5} duration={5}   />
        <Dot x="50%"  y="97%"  size={3} delay={0.8} duration={4.2} />
        <Dot x="3%"   y="50%"  size={4} delay={3}   duration={3.8} />
        <Dot x="97%"  y="50%"  size={4} delay={1}   duration={4.8} />
        <Dot x="20%"  y="5%"   size={3} delay={0.3} duration={3.2} />
        <Dot x="80%"  y="5%"   size={3} delay={1.8} duration={3.9} />
        <Dot x="20%"  y="95%"  size={4} delay={2.5} duration={3.6} />
        <Dot x="80%"  y="95%"  size={3} delay={0.7} duration={5.2} />
        <Dot x="5%"   y="25%"  size={3} delay={1.3} duration={4.1} />
        <Dot x="95%"  y="25%"  size={3} delay={0.6} duration={3.7} />
        <Dot x="5%"   y="75%"  size={4} delay={2.2} duration={4.3} />
        <Dot x="95%"  y="75%"  size={4} delay={1.6} duration={3.4} />

        {/* Rotating polygon shapes — corners and edges, NOT center */}
        <RotatingShape x="6%"   y="18%"  size={80}  sides={6} duration={30} delay={0}   clockwise={true}  strokeOpacity={0.18} />
        <RotatingShape x="94%"  y="18%"  size={70}  sides={4} duration={25} delay={1.5} clockwise={false} strokeOpacity={0.18} />
        <RotatingShape x="6%"   y="82%"  size={75}  sides={3} duration={35} delay={0.8} clockwise={true}  strokeOpacity={0.15} />
        <RotatingShape x="94%"  y="82%"  size={85}  sides={6} duration={28} delay={2}   clockwise={false} strokeOpacity={0.15} />
        <RotatingShape x="25%"  y="6%"   size={55}  sides={4} duration={22} delay={1}   clockwise={true}  strokeOpacity={0.14} />
        <RotatingShape x="75%"  y="6%"   size={60}  sides={3} duration={26} delay={2.5} clockwise={false} strokeOpacity={0.14} />
        <RotatingShape x="25%"  y="94%"  size={55}  sides={6} duration={32} delay={0.5} clockwise={false} strokeOpacity={0.13} />
        <RotatingShape x="75%"  y="94%"  size={65}  sides={4} duration={24} delay={1.2} clockwise={true}  strokeOpacity={0.13} />
        <RotatingShape x="4%"   y="50%"  size={50}  sides={3} duration={20} delay={3}   clockwise={true}  strokeOpacity={0.12} />
        <RotatingShape x="96%"  y="50%"  size={50}  sides={6} duration={38} delay={0.3} clockwise={false} strokeOpacity={0.12} />

        {/* Cross marks — scattered non-center positions */}
        <CrossMark x="15%"  y="15%"  size={18} delay={0}   opacity={0.35} />
        <CrossMark x="85%"  y="15%"  size={14} delay={1.2} opacity={0.3}  />
        <CrossMark x="15%"  y="85%"  size={16} delay={0.8} opacity={0.3}  />
        <CrossMark x="85%"  y="85%"  size={18} delay={2}   opacity={0.35} />
        <CrossMark x="50%"  y="10%"  size={12} delay={1.5} opacity={0.25} />
        <CrossMark x="50%"  y="90%"  size={12} delay={0.5} opacity={0.25} />
        <CrossMark x="10%"  y="50%"  size={14} delay={3}   opacity={0.28} />
        <CrossMark x="90%"  y="50%"  size={14} delay={1.8} opacity={0.28} />
        <CrossMark x="30%"  y="20%"  size={10} delay={2.5} opacity={0.2}  />
        <CrossMark x="70%"  y="20%"  size={10} delay={0.3} opacity={0.2}  />
        <CrossMark x="30%"  y="80%"  size={10} delay={1}   opacity={0.2}  />
        <CrossMark x="70%"  y="80%"  size={10} delay={2.2} opacity={0.2}  />

        {/* Subtle grid tiles at corners */}
        <GridTile x="12%"  y="12%"  delay={0}   />
        <GridTile x="88%"  y="12%"  delay={1.5} />
        <GridTile x="12%"  y="88%"  delay={0.8} />
        <GridTile x="88%"  y="88%"  delay={2}   />
      </motion.div>

      

      {/* ── Full-screen scan sweep ── */}
      <motion.div className="absolute left-0 right-0 pointer-events-none" style={{
        height: 200,
        background: 'linear-gradient(to bottom, transparent, rgba(0,212,255,0.018), transparent)',
      }}
        animate={{ top: ['-25%', '125%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
      />

      {/* ── Subtle vignette ── */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,11,24,0.5) 100%)',
      }} />
    </div>
  )
} 