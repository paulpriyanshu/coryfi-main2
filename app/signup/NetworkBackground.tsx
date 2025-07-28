"use client"

import { useEffect, useState, useRef } from "react"

interface Node {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
  scale: number
  type: "primary" | "secondary" | "hub"
  connections: number[]
  pulsePhase: number
}

interface Connection {
  from: number
  to: number
  progress: number
  opacity: number
  strength: number
  animated: boolean
}

interface DataPacket {
  id: number
  connectionId: string
  progress: number
  speed: number
}

export default function NetworkBackground() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isDark, setIsDark] = useState(false)
  const animationRef = useRef<number>()

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateDimensions()
    checkDarkMode()

    window.addEventListener("resize", updateDimensions)

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      window.removeEventListener("resize", updateDimensions)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (dimensions.width === 0) return

    // Generate nodes with different types - increased visibility
    const initialNodes: Node[] = []
    const nodeCount = Math.min(25, Math.floor(dimensions.width / 60))

    // Create hub nodes (larger, central nodes)
    const hubCount = Math.floor(nodeCount / 8)
    for (let i = 0; i < hubCount; i++) {
      initialNodes.push({
        id: i,
        x: dimensions.width * (0.2 + Math.random() * 0.6),
        y: dimensions.height * (0.2 + Math.random() * 0.6),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0,
        scale: 0,
        type: "hub",
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Create primary nodes
    const primaryCount = Math.floor(nodeCount * 0.6)
    for (let i = hubCount; i < hubCount + primaryCount; i++) {
      initialNodes.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        opacity: 0,
        scale: 0,
        type: "primary",
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Create secondary nodes
    for (let i = hubCount + primaryCount; i < nodeCount; i++) {
      initialNodes.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0,
        scale: 0,
        type: "secondary",
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    setNodes(initialNodes)

    // Animate nodes appearing in waves
    initialNodes.forEach((node, index) => {
      const delay =
        node.type === "hub" ? index * 200 : node.type === "primary" ? 1000 + index * 150 : 1500 + index * 100

      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  opacity: node.type === "hub" ? 0.8 : node.type === "primary" ? 0.6 : 0.4, // Much more visible
                  scale: 1,
                }
              : n,
          ),
        )
      }, delay)
    })

    // Generate connections
    setTimeout(() => {
      const newConnections: Connection[] = []

      initialNodes.forEach((node, i) => {
        const maxConnections = node.type === "hub" ? 5 : node.type === "primary" ? 3 : 2
        const connectionTargets: Node[] = []

        // Hubs connect to nearby nodes
        if (node.type === "hub") {
          const nearbyNodes = initialNodes
            .filter((n) => n.id !== node.id)
            .sort((a, b) => {
              const distA = Math.sqrt(Math.pow(node.x - a.x, 2) + Math.pow(node.y - a.y, 2))
              const distB = Math.sqrt(Math.pow(node.x - b.x, 2) + Math.pow(node.y - b.y, 2))
              return distA - distB
            })
            .slice(0, maxConnections)
          connectionTargets.push(...nearbyNodes)
        } else {
          // Regular nodes connect to nearby nodes
          const nearbyNodes = initialNodes
            .filter((n) => n.id !== node.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, maxConnections)
          connectionTargets.push(...nearbyNodes)
        }

        connectionTargets.forEach((target) => {
          const distance = Math.sqrt(Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2))
          const maxDistance = node.type === "hub" ? 400 : 250

          if (distance < maxDistance) {
            const strength = node.type === "hub" || target.type === "hub" ? 0.8 : 0.6
            newConnections.push({
              from: node.id,
              to: target.id,
              progress: 0,
              opacity: 0,
              strength,
              animated: Math.random() > 0.7, // Some animated connections
            })
          }
        })
      })

      setConnections(newConnections)

      // Animate connections forming
      newConnections.forEach((connection, index) => {
        const delay = index * 200 + Math.random() * 300
        setTimeout(() => {
          setConnections((prev) =>
            prev.map((c) =>
              c.from === connection.from && c.to === connection.to ? { ...c, opacity: c.strength * 0.4 } : c,
            ),
          )

          // Animate connection progress
          const duration = 1000 + Math.random() * 800
          const startTime = Date.now()

          const animateProgress = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            setConnections((prev) =>
              prev.map((c) => (c.from === connection.from && c.to === connection.to ? { ...c, progress } : c)),
            )

            if (progress < 1) {
              requestAnimationFrame(animateProgress)
            }
          }
          requestAnimationFrame(animateProgress)
        }, delay)
      })
    }, 1500)

    // Continuous animation loop
    const animate = () => {
      setNodes((prev) =>
        prev.map((node) => {
          let newX = node.x + node.vx
          let newY = node.y + node.vy
          let newVx = node.vx
          let newVy = node.vy

          // Boundary collision
          if (newX <= 50 || newX >= dimensions.width - 50) newVx *= -1
          if (newY <= 50 || newY >= dimensions.height - 50) newVy *= -1

          // Keep within bounds
          newX = Math.max(50, Math.min(dimensions.width - 50, newX))
          newY = Math.max(50, Math.min(dimensions.height - 50, newY))

          // Enhanced pulse animation
          const pulseIntensity = 0.2
          const baseOpacity = node.type === "hub" ? 0.8 : node.type === "primary" ? 0.6 : 0.4
          const pulsedOpacity = baseOpacity + Math.sin(Date.now() * 0.002 + node.pulsePhase) * pulseIntensity

          return {
            ...node,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            opacity: pulsedOpacity,
            pulsePhase: node.pulsePhase + 0.01,
          }
        }),
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions])

  const getNodePosition = (id: number) => {
    const node = nodes.find((n) => n.id === id)
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 }
  }

  const getNodeRadius = (type: string) => {
    switch (type) {
      case "hub":
        return 8
      case "primary":
        return 6
      case "secondary":
        return 4
      default:
        return 5
    }
  }

  // Enhanced color schemes with better visibility
  const colors = {
    hub: {
      primary: isDark ? "rgb(59, 130, 246)" : "rgb(37, 99, 235)", // blue-500 : blue-600
      stroke: isDark ? "rgb(147, 197, 253)" : "rgb(59, 130, 246)", // blue-300 : blue-500
    },
    primary: {
      primary: isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)", // green-500 : green-600
      stroke: isDark ? "rgb(134, 239, 172)" : "rgb(34, 197, 94)", // green-300 : green-500
    },
    secondary: {
      primary: isDark ? "rgb(168, 85, 247)" : "rgb(147, 51, 234)", // purple-500 : purple-600
      stroke: isDark ? "rgb(196, 181, 253)" : "rgb(168, 85, 247)", // purple-300 : purple-500
    },
    connection: {
      start: isDark ? "rgb(59, 130, 246)" : "rgb(37, 99, 235)",
      middle: isDark ? "rgb(34, 197, 94)" : "rgb(22, 163, 74)",
      end: isDark ? "rgb(168, 85, 247)" : "rgb(147, 51, 234)",
    },
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
        <defs>
          {/* Enhanced gradients */}
          <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.hub.primary} stopOpacity="0.8" />
            <stop offset="70%" stopColor={colors.hub.primary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors.hub.primary} stopOpacity="0.1" />
          </radialGradient>

          <radialGradient id="primaryGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.primary.primary} stopOpacity="0.7" />
            <stop offset="70%" stopColor={colors.primary.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.primary.primary} stopOpacity="0.1" />
          </radialGradient>

          <radialGradient id="secondaryGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.secondary.primary} stopOpacity="0.6" />
            <stop offset="70%" stopColor={colors.secondary.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.secondary.primary} stopOpacity="0.1" />
          </radialGradient>

          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.connection.start} stopOpacity="0.6" />
            <stop offset="50%" stopColor={colors.connection.middle} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors.connection.end} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Render connections with enhanced visibility */}
        {connections.map((connection, index) => {
          const fromPos = getNodePosition(connection.from)
          const toPos = getNodePosition(connection.to)
          const currentX = fromPos.x + (toPos.x - fromPos.x) * connection.progress
          const currentY = fromPos.y + (toPos.y - fromPos.y) * connection.progress

          return (
            <line
              key={`connection-${connection.from}-${connection.to}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={currentX}
              y2={currentY}
              stroke="url(#connectionGradient)"
              strokeWidth={connection.strength * 2}
              opacity={connection.opacity}
              className={connection.animated ? "animate-pulse" : ""}
            />
          )
        })}

        {/* Render nodes with enhanced visibility */}
        {nodes.map((node) => {
          const radius = getNodeRadius(node.type)
          const gradientId = `${node.type}Gradient`

          return (
            <g key={`node-${node.id}`}>
              {/* Outer glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={radius * node.scale * 2}
                fill={`url(#${gradientId})`}
                opacity={node.opacity * 0.3}
              />
              {/* Main node body */}
              <circle
                cx={node.x}
                cy={node.y}
                r={radius * node.scale}
                fill={`url(#${gradientId})`}
                stroke={colors[node.type].stroke}
                strokeWidth="1"
                opacity={node.opacity}
              />
              {/* Inner highlight */}
              <circle
                cx={node.x}
                cy={node.y}
                r={radius * node.scale * 0.4}
                fill={colors[node.type].stroke}
                opacity={node.opacity * 0.6}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
