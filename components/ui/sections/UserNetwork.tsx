'use client'

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface Node extends d3.SimulationNodeDatum {
  id: string
  group: number
  connections: number
  avatar: string
  bio: string
  visible: boolean
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number
}

export const data: { nodes: Node[], links: Link[] } = {
  nodes: [
    { id: "You", group: 1, connections: 5, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=facearea&facepad=2&w=256&h=256&q=80", bio: "That's you!", visible: true },
    { id: "Alice", group: 2, connections: 4, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=facearea&facepad=2&w=256&h=256&q=80", bio: "Software Engineer passionate about AI", visible: true },
    { id: "Bob", group: 2, connections: 3, avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?fit=facearea&facepad=2&w=256&h=256&q=80", bio: "UX Designer with a love for minimalism", visible: true },
    { id: "Charlie", group: 2, connections: 5, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?fit=facearea&facepad=2&w=256&h=256&q=80", bio: "Data Scientist exploring machine learning", visible: true },
    { id: "David", group: 2, connections: 2, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=facearea&facepad=2&w=256&h=256&q=80", bio: "Product Manager with startup experience", visible: true },
    { id: "Eve", group: 2, connections: 4, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=facearea&facepad=2&w=256&h=256&q=80", bio: "Full-stack developer specializing in React", visible: true },
  ],
  links: [
    { source: "You", target: "Alice", value: 1 },
    { source: "You", target: "Bob", value: 1 },
    { source: "You", target: "Charlie", value: 1 },
    { source: "You", target: "David", value: 1 },
    { source: "You", target: "Eve", value: 1 },
  ],
}

interface UserNetworkProps {
  onNodeClick: (node: Node) => void
}

export default function UserNetwork({ onNodeClick }: UserNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])

    svg.selectAll("*").remove()

    const g = svg.append("g")

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString())
      })

    svg.call(zoom)

    const userConnections = data.links.filter(link => 
      (typeof link.source === 'string' && link.source === "You") || 
      (typeof link.target === 'string' && link.target === "You")
    )
    const connectedNodes = data.nodes.filter(node => 
      node.id === "You" || userConnections.some(link => 
        (typeof link.source === 'string' && link.source === node.id) || 
        (typeof link.target === 'string' && link.target === node.id)
      )
    )

    const simulation = d3.forceSimulation<Node>(connectedNodes)
      .force("link", d3.forceLink<Node, Link>(userConnections).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(() => 35))

    const link = g.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(userConnections)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value))

    const node = g.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll<SVGGElement, Node>("g")
    .data(connectedNodes)
    .join("g")
    .call(drag(simulation))
    .on("click", (event, d) => onNodeClick(d))
    
    node.append("circle")
      .attr("r", 30)
      .attr("fill", d => d.id === "You" ? "#4f46e5" : "white")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)

    node.append("image")
      .attr("xlink:href", d => d.avatar)
      .attr("x", -30)
      .attr("y", -30)
      .attr("width", 60)
      .attr("height", 60)
      .attr("clip-path", "circle(30px at 30px 30px)")

    node.append("title")
      .text(d => d.id)

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x ?? 0)
        .attr("y1", d => (d.source as Node).y ?? 0)
        .attr("x2", d => (d.target as Node).x ?? 0)
        .attr("y2", d => (d.target as Node).y ?? 0)

      node
        .attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    }

    return () => {
      simulation.stop()
    }
  }, [onNodeClick])

  return (
    <div className="bg-white rounded-lg shadow-md h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  )
}