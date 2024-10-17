'use client'

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import { User, Users, Network, Search, ChevronLeft, ChevronRight, RefreshCw, ThumbsUp, MessageSquare, Bookmark, UserPlus, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {data,networkStats,userPosts} from "@/lib/networkData"
import { Node,Link,GraphData} from "@/types/network"



export default function EnhancedConnectionNetwork() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedPerson, setSelectedPerson] = useState<Node | null>(null)
  const [highlightedPath, setHighlightedPath] = useState<string[]>([])
  const [connectionsNeeded, setConnectionsNeeded] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Node[]>([])
  const [networkInfoVisible, setNetworkInfoVisible] = useState(true)
  const [visibleNodes, setVisibleNodes] = useState<Node[]>(() => data.nodes.filter(node => node.visible))
  const [visibleLinks, setVisibleLinks] = useState<Link[]>(() => data.links.filter(link => 
    visibleNodes.some(node => node.id === (typeof link.source === 'string' ? link.source : (link.source as Node).id)) && 
    visibleNodes.some(node => node.id === (typeof link.target === 'string' ? link.target : (link.target as Node).id))
  ))
  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [recommendations, setRecommendations] = useState<Node[]>([])

  const resetToFirstDegree = useCallback(() => {
    const firstDegreeNodes = data.nodes.filter(node => 
      node.id === "You" || data.links.some(link => {
        const sourceId = typeof link.source === 'string' ? link.source :
                         typeof link.source === 'number' ? link.source.toString() :
                         link.source.id
        const targetId = typeof link.target === 'string' ? link.target :
                         typeof link.target === 'number' ? link.target.toString() :
                         link.target.id
        return (sourceId === "You" && targetId === node.id) || 
               (targetId === "You" && sourceId === node.id)
      })
    )
    const firstDegreeLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source :
                       typeof link.source === 'number' ? link.source.toString() :
                       link.source.id
      const targetId = typeof link.target === 'string' ? link.target :
                       typeof link.target === 'number' ? link.target.toString() :
                       link.target.id
      return sourceId === "You" || targetId === "You"
    })
    setVisibleNodes(firstDegreeNodes)
    setVisibleLinks(firstDegreeLinks)
    setHighlightedPath([])
    setConnectionsNeeded(0)
    setSelectedPerson(data.nodes.find(node => node.id === "You") || null)
    setExpandedNodes({})
    setRefreshKey(prevKey => prevKey + 1)
  }, [data.nodes, data.links])

  const showConnectedNodes = useCallback((nodeId: string) => {
    setVisibleNodes(prevNodes => {
      const newNodes = [...prevNodes]
      data.links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source :
                         typeof link.source === 'number' ? link.source.toString() :
                         link.source.id
        const targetId = typeof link.target === 'string' ? link.target :
                         typeof link.target === 'number' ? link.target.toString() :
                         link.target.id
        if (sourceId === nodeId || targetId === nodeId) {
          const otherNodeId = sourceId === nodeId ? targetId : sourceId
          const otherNodeData = data.nodes.find(n => n.id === otherNodeId)
          if (otherNodeData && !newNodes.some(n => n.id === otherNodeId)) {
            newNodes.push(otherNodeData)
          }
        }
      })
      return newNodes
    })

    setVisibleLinks(prevLinks => {
      const newLinks = [...prevLinks]
      data.links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source :
                         typeof link.source === 'number' ? link.source.toString() :
                         link.source.id
        const targetId = typeof link.target === 'string' ? link.target :
                         typeof link.target === 'number' ? link.target.toString() :
                         link.target.id
        if (sourceId === nodeId || targetId === nodeId) {
          if (!newLinks.some(l => {
            const lSourceId = typeof l.source === 'string' ? l.source :
                              typeof l.source === 'number' ? l.source.toString() :
                              l.source.id
            const lTargetId = typeof l.target === 'string' ? l.target :
                              typeof l.target === 'number' ? l.target.toString() :
                              l.target.id
            return (lSourceId === sourceId && lTargetId === targetId) ||
                   (lSourceId === targetId && lTargetId === sourceId)
          })) {
            newLinks.push(link)
          }
        }
      })
      return newLinks
    })
  }, [data.links, data.nodes])


  const handleNodeClick = useCallback((d: Node) => {
    if (d.id === "You") {
      resetToFirstDegree()
    } else {
      setExpandedNodes((prev) => {
        const newExpandedNodes = { ...prev }
        if (newExpandedNodes[d.id]) {
          delete newExpandedNodes[d.id]
        } else {
          newExpandedNodes[d.id] = true
        }
        return newExpandedNodes
      })
  
      const path = findPath(data, "You", d.id)
      if (path && path.length > 1) {
        setHighlightedPath(path)
      }
      setConnectionsNeeded(path ? path.length - 2 : 0)
      setSelectedPerson(d)
      setNetworkInfoVisible(true)
      
      setVisibleNodes((prevNodes) => {
        const newNodes = [...prevNodes]
        if (!newNodes.some(n => n.id === d.id)) {
          newNodes.push(d)
        }
        data.links.forEach(link => {
          const sourceId = typeof link.source === 'string' ? link.source :
                           typeof link.source === 'number' ? link.source.toString() :
                           link.source.id
          const targetId = typeof link.target === 'string' ? link.target :
                           typeof link.target === 'number' ? link.target.toString() :
                           link.target.id
          if (sourceId === d.id || targetId === d.id) {
            const otherId = sourceId === d.id ? targetId : sourceId
            if (!newNodes.some(n => n.id === otherId)) {
              const otherNode = data.nodes.find(n => n.id === otherId)
              if (otherNode) newNodes.push(otherNode)
            }
          }
        })
        return newNodes
      })
  
      setVisibleLinks((prevLinks) => {
        const newLinks = [...prevLinks]
        data.links.forEach(link => {
          const sourceId = typeof link.source === 'string' ? link.source :
                           typeof link.source === 'number' ? link.source.toString() :
                           link.source.id
          const targetId = typeof link.target === 'string' ? link.target :
                           typeof link.target === 'number' ? link.target.toString() :
                           link.target.id
          if (sourceId === d.id || targetId === d.id) {
            if (!newLinks.some(l => {
              const lSourceId = typeof l.source === 'string' ? l.source :
                                typeof l.source === 'number' ? l.source.toString() :
                                l.source.id
              const lTargetId = typeof l.target === 'string' ? l.target :
                                typeof l.target === 'number' ? l.target.toString() :
                                l.target.id
              return (lSourceId === sourceId && lTargetId === targetId) ||
                     (lSourceId === targetId && lTargetId === sourceId)
            })) {
              newLinks.push(link)
            }
          }
        })
        return newLinks
      })
    }
  }, [resetToFirstDegree, data, setExpandedNodes, setHighlightedPath, setConnectionsNeeded, setSelectedPerson, setNetworkInfoVisible, setVisibleNodes, setVisibleLinks])

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

    const simulation = d3.forceSimulation<Node>(visibleNodes)
      .force("link", d3.forceLink<Node, Link>(visibleLinks).id(d  => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))

    const link = g.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll<SVGLineElement, Link>("line")
      .data(visibleLinks)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value))

    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, Node>("g")
      .data(visibleNodes)
      .join("g")
      .attr("class", "node")
      .call(drag(simulation))
      .on("click", (event, d) => handleNodeClick(d))

    node.append("circle")
      .attr("r", 30)
      .attr("fill", d => expandedNodes[d.id] ? "#4299e1" : "white")
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
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!)

      node
        .attr("transform", d => `translate(${d.x},${d.y})`)
    })

    function highlightPath(path: string[]) {
      link.attr("stroke", "#999").attr("stroke-width", 1)
      if (path && path.length > 0) {
        for (let i = 0; i < path.length - 1; i++) {
          link.filter(d => 
            ((d.source as Node).id === path[i] && (d.target as Node).id === path[i+1]) || 
            ((d.source as Node).id === path[i+1] && (d.target as Node).id === path[i])
          ).attr("stroke", "#3b82f6").attr("stroke-width", 3)
        }
      }
    }

    highlightPath(highlightedPath)

    return () => {
      simulation.stop()
    }

  }, [visibleNodes, visibleLinks, highlightedPath, refreshKey, handleNodeClick, expandedNodes])

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

  const handleSearch = () => {
    const results = data.nodes.filter(node => 
      node.id.toLowerCase().includes(searchTerm.toLowerCase()) && node.id !== "You"
    )
    setSearchResults(results)
  }

  const handleSearchResultClick = (person: Node) => {
    const path = findPath(data, "You", person.id)
    setHighlightedPath(path || [])
    setConnectionsNeeded(path ? path.length - 2 : 0)
    setSelectedPerson(person)
    setNetworkInfoVisible(true)
    showConnectedNodes(person.id)
    setSearchResults([])
    setSearchTerm("")
    console.log(connectionsNeeded)
  }

  const handleUserAction = (action: string, userId: string) => {
    console.log(`Action ${action} performed on user ${userId}`)
    if (action === 'view') {
      const person = data.nodes.find(node => node.id === userId)
      if (person) setSelectedPerson(person)
    }
  }

  useEffect(() => {
    const recommendedUsers = data.nodes
      .filter(node => node.id !== "You" && !visibleNodes.some(n => n.id === node.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
    setRecommendations(recommendedUsers)
  }, [visibleNodes])

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Your Connection Network</h1>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetToFirstDegree}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Reset network view</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to show only your connections</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNetworkInfoVisible(!networkInfoVisible)}
          >
            {networkInfoVisible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="sr-only">Toggle network info panel</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={cn(
          "w-64 bg-white shadow-md transition-all duration-300 ease-in-out overflow-y-auto",
          networkInfoVisible ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">Network Info</h2>
            {selectedPerson ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{selectedPerson.id}</h3>
                <img src={selectedPerson.avatar} alt={selectedPerson.id} className="w-16 h-16 rounded-full mb-2" />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{selectedPerson.id === "You" ? "You" : "Contact"}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{selectedPerson.connections} Connections</span>
                  </div>
                  <div className="flex items-center">
                    <Network className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Group {selectedPerson.group}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{selectedPerson.bio}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-6">Select a user to view details</p>
            )}
            <h3 className="text-lg font-semibold mb-2">Users in Network</h3>
            <div className="space-y-2">
              {(showAllUsers ? data.nodes : data.nodes.slice(0, 5)).map((person) => (
                <div key={person.id} className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => handleNodeClick(person)}
                  >
                    <img src={person.avatar} alt={person.id} className="w-8 h-8 rounded-full" />
                    <span>{person.id}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">User actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleUserAction('remove', person.id)}>Remove</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('block', person.id)}>Block</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('report', person.id)}>Report</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('message', person.id)}>Message</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('view', person.id)}>View Profile</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
            {!showAllUsers && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAllUsers(true)}
              >
                Show More
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-1 overflow-hidden">
            <div className="bg-gray-50 rounded-lg shadow-md h-full">
              <svg ref={svgRef} className="w-full h-full"></svg>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-md p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Network Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{networkStats.totalConnections}</div>
                  <p className="text-sm text-gray-500">Total connections</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p>2 days: <span className="font-bold text-green-600">+{networkStats.growth.twoDays}</span></p>
                    <p>7 days: <span className="font-bold text-green-600">+{networkStats.growth.sevenDays}</span></p>
                    <p>1 month: <span className="font-bold text-green-600">+{networkStats.growth.oneMonth}</span></p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p><ThumbsUp className="inline-block mr-2 h-4 w-4" /> {networkStats.likedPosts} posts liked</p>
                    <p><MessageSquare className="inline-block mr-2 h-4 w-4" /> {networkStats.comments} comments</p>
                    <p><Bookmark className="inline-block mr-2 h-4 w-4" /> {networkStats.pagesFollowed} pages followed</p>
                    <p><UserPlus className="inline-block mr-2 h-4 w-4" /> {networkStats.approachAttempts} approach attempts</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {userPosts.map(post => (
                      <li key={post.id} className="text-sm">
                        <p className="font-medium">{post.title}</p>
                        <p className="text-gray-500">{post.likes} likes · {post.comments} comments</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="w-64 bg-white shadow-md p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Search</h2>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Search for a person"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => handleSearchResultClick(person)}
                >
                  <img src={person.avatar} alt={person.id} className="w-8 h-8 rounded-full" />
                  <span>{person.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No results found</p>
          )}

          <h2 className="text-xl font-bold mt-8 mb-4">Recommendations</h2>
          <div className="space-y-2">
            {recommendations.map((person) => (
              <div
                key={person.id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => handleSearchResultClick(person)}
              >
                <img src={person.avatar} alt={person.id} className="w-8 h-8 rounded-full" />
                <span>{person.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function findPath(graph: GraphData, start: string, end: string): string[] | null {
  const queue: string[][] = [[start]]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const path = queue.shift()!
    const node = path[path.length - 1]

    if (node === end) {
      return path
    }

    if (!visited.has(node)) {
      visited.add(node)

      const neighbors = graph.links
        .filter(link => {
          const sourceId = typeof link.source === 'string' ? link.source :
                           typeof link.source === 'number' ? link.source.toString() :
                           link.source.id
          const targetId = typeof link.target === 'string' ? link.target :
                           typeof link.target === 'number' ? link.target.toString() :
                           link.target.id
          return sourceId === node || targetId === node
        })
        .map(link => {
          const sourceId = typeof link.source === 'string' ? link.source :
                           typeof link.source === 'number' ? link.source.toString() :
                           link.source.id
          const targetId = typeof link.target === 'string' ? link.target :
                           typeof link.target === 'number' ? link.target.toString() :
                           link.target.id
          return sourceId === node ? targetId : sourceId
        })

      for (const neighbor of neighbors) {
        queue.push([...path, neighbor])
      }
    }
  }

  return null
}
