"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import * as d3 from "d3"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, RefreshCw } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/libs/store/hooks"
import { selectResponseData, setResponseData } from "@/app/libs/features/pathdata/pathSlice"
import { fetchUserConnections, fetchUserId } from "@/app/api/actions/media"

export default function PersonalNetwork({ data: propData }) {
  const { data: session, status } = useSession()
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  const [graphData, setGraphData] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedPersonImage, setSelectedPersonImage] = useState("")
  const [visibleNodes, setVisibleNodes] = useState([])
  const [visibleLinks, setVisibleLinks] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userdp, setUserDp] = useState("")
  const router = useRouter()
  const dispatch = useAppDispatch()
  const pathData = useAppSelector(selectResponseData)
  const [userId, setUserId] = useState(null)
  const [userConnections, setUserConnections] = useState([])

  // Memoize the email to prevent unnecessary re-renders
  const email = useMemo(() => session?.user?.email, [session?.user?.email])

  // Fetch user connections only when email changes
  useEffect(() => {
    if (!email) return

    const fetchUserPosts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const userconnections = await fetchUserConnections(email)
        setUserConnections(userconnections)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load user data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserPosts()
  }, [email])

  // Memoize processData to prevent recreation on every render
  const processData = useCallback(
    (inputData) => {
      const uniqueNodes = inputData.nodes.reduce((acc, node) => {
        const nodeId = typeof node.id === "number" ? node.id : Number.parseInt(node.id)
        if (isNaN(nodeId)) {
          console.error("Invalid node ID:", node.id)
          return acc
        }

        const existingNode = acc.find((n) => n.email === node.email)
        if (!existingNode) {
          acc.push({
            ...node,
            id: nodeId,
            group: node.group || 1,
            connections: node.connections || 0,
            name: node.name || node.email,
            bio: node.bio || "",
            visible: true,
          })
        }
        return acc
      }, [])

      const userNode = uniqueNodes.find((node) => node.email === email)
      if (userNode) {
        uniqueNodes.splice(uniqueNodes.indexOf(userNode), 1)
        uniqueNodes.unshift(userNode)
      }

      const processedLinks = inputData.links
        .map((link) => {
          const sourceId = typeof link.source === "number" ? link.source : Number.parseInt(link.source)
          const targetId = typeof link.target === "number" ? link.target : Number.parseInt(link.target)

          if (isNaN(sourceId) || isNaN(targetId)) {
            console.error("Invalid link:", link)
            return null
          }

          const sourceNode = uniqueNodes.find((node) => node.id === sourceId)
          const targetNode = uniqueNodes.find((node) => node.id === targetId)

          if (sourceNode && targetNode && sourceId !== targetId) {
            return {
              source: sourceId,
              target: targetId,
              value: link.value || 1,
            }
          }
          return null
        })
        .filter(Boolean)

      if (userNode) {
        uniqueNodes.forEach((node) => {
          if (node.id !== userNode.id && node.connections > 0) {
            const existingLink = processedLinks.find(
              (link) =>
                (link.source === userNode.id && link.target === node.id) ||
                (link.source === node.id && link.target === userNode.id),
            )
            if (!existingLink) {
              processedLinks.push({
                source: userNode.id,
                target: node.id,
                value: 1,
              })
            }
          }
        })
      }

      return {
        nodes: uniqueNodes,
        links: processedLinks,
      }
    },
    [email],
  )

  // Helper function to get profile pictures - memoized
  const getUserProfilePicture = useCallback(async (nodeEmail, userConnections, currentUserEmail) => {
    if (!nodeEmail || !userConnections) {
      return `https://api.dicebear.com/6.x/initials/svg?seed=${nodeEmail || "unknown"}`
    }

    try {
      const userData = await fetchUserId(nodeEmail)
      if (userData && userData.userdp) {
        return userData.userdp
      }
    } catch (error) {
      console.error("Error fetching user data with fetchUserId:", error)
    }

    const connection = userConnections.find(
      (conn) => conn.requester.email === nodeEmail || conn.recipient.email === nodeEmail,
    )

    if (connection) {
      const profilePic =
        connection.requester.email === nodeEmail ? connection.requester.userdp : connection.recipient.userdp
      return profilePic
    }

    return `https://api.dicebear.com/6.x/initials/svg?seed=${nodeEmail}`
  }, [])

  // **FIXED**: Separate data fetching from visualization
  const fetchData = useCallback(async () => {
    if (status !== "authenticated") return

    setIsLoading(true)
    setError(null)
    let processedData

    if (propData && propData.nodes && propData.nodes.length > 0) {
      try {
        processedData = processData(propData)
      } catch (error) {
        setError("Error processing provided data")
        setIsLoading(false)
        return
      }
    } else {
      try {
        const response = await fetch("https://neo.coryfi.com/api/v1/getnetwork", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email || "" }),
        })

        if (!response.ok) {
          throw new Error("Network response was not ok")
        }

        const fetchedData = await response.json()
        processedData = processData(fetchedData)
      } catch (error) {
        setError("Error fetching network data")
        console.error("Error fetching network data:", error)
        setIsLoading(false)
        return
      }
    }

    setGraphData(processedData)
    setVisibleNodes(processedData.nodes)
    setVisibleLinks(processedData.links)
    setIsLoading(false)
  }, [status, propData, processData, email])

  // **FIXED**: Only fetch data when propData actually changes (deep comparison)
  const propDataString = useMemo(() => JSON.stringify(propData), [propData])
  
  useEffect(() => {
    fetchData()
  }, [propDataString, status, email]) // Only re-run when propData content, status, or email changes

  const handleNodeClick = useCallback(
    (d) => {
      if (!graphData) return

      if (d.id === graphData.nodes[0]?.id) {
        router.push(`/profile`)
      } else {
        setSelectedPerson(d)
      }
    },
    [graphData, router],
  )

  // const handleFindPath = useCallback(
  //   async (email) => {
  //     if (session?.user?.email) {
  //       try {
  //         const response = await fetch("https://neo.coryfi.com/api/v1/connectToUser", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             targetEmail: email,
  //             sourceEmail: session.user.email,
  //           }),
  //         })

  //         const data = await response.json()
  //         dispatch(setResponseData(data))
  //       } catch (error) {
  //         console.error("Error finding path:", error)
  //       }
  //     }
  //   },
  //   [session?.user?.email, dispatch],
  // )

  // Memoize drag behavior
  const drag = useCallback((simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  }, [])

  // **FIXED**: Main visualization effect - only recreate when essential data changes
  // Removed fetchData and other unnecessary dependencies
  useEffect(() => {
    if (!svgRef.current || !visibleNodes.length || !visibleLinks) {
      return
    }

    // Stop previous simulation if it exists
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    const container = svgRef.current.parentElement
    const width = container.clientWidth
    const height = container.clientHeight

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])

    svg.selectAll("*").remove()

    const g = svg.append("g")

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    const isMobile = window.innerWidth < 768
    const initialScale = isMobile ? 0.7 : 1

    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(initialScale)
        .translate(-width / 2, -height / 2),
    )

    const userNode = visibleNodes[0]

    const simulation = d3
      .forceSimulation(visibleNodes)
      .force(
        "link",
        d3
          .forceLink(visibleLinks)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40))

    // Store simulation reference
    simulationRef.current = simulation

    const defs = g.append("defs")

    const link = g
      .append("g")
      .selectAll("line")
      .data(visibleLinks)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 1)
      .attr("stroke-width", (d) => Math.sqrt(d.value))

    defs
      .selectAll(".clip")
      .data(visibleNodes)
      .enter()
      .append("clipPath")
      .attr("id", (d) => `clip-${d.id}`)
      .append("circle")
      .attr("r", 30)

    const nodeGroup = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(visibleNodes)
      .enter()
      .append("g")
      .call(drag(simulation))
      .on("click", (event, d) => handleNodeClick(d))

    nodeGroup
      .append("circle")
      .attr("r", 30)
      .attr("fill", (d) => (d === userNode ? "#3b82f6" : "#d1dbe6"))
      .attr("stroke", "#64748b")
      .attr("stroke-width", 0.7)
      .attr("opacity", 1)

    nodeGroup
      .append("image")
      .attr("x", -30)
      .attr("y", -30)
      .attr("width", 60)
      .attr("height", 60)
      .attr("clip-path", (d) => `url(#clip-${d.id})`)
      .attr("xlink:href", (d) => {
        return `https://api.dicebear.com/6.x/initials/svg?seed=${d.email || "unknown"}`
      })
      .each(function (d) {
        getUserProfilePicture(d.email, userConnections, email)
          .then((imageUrl) => {
            d3.select(this).attr("xlink:href", imageUrl)
          })
          .catch((err) => {
            console.error("Error loading profile picture for", d.email, err)
          })
      })

    nodeGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 45)
      .text((d) => d.name)
      .attr("fill", (d) => (d === userNode ? "#1d4ed8" : "#64748b"))

    // Handle paths if present
    if (pathData && pathData.path) {
      const pathNodes = new Set(pathData.path.map((node) => node.id))
      const pathLinks = visibleLinks.filter((link) => pathNodes.has(link.source.id) && pathNodes.has(link.target.id))

      link
        .attr("stroke", (d) => (pathLinks.includes(d) ? "#4CAF50" : "#999"))
        .attr("stroke-width", (d) => (pathLinks.includes(d) ? 3 : 1))

      nodeGroup
        .select("circle")
        .attr("fill", (d) => (pathNodes.has(d.id) ? "#4CAF50" : d === userNode ? "#3b82f6" : "#f1f5f9"))
    }

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`)
    })

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [visibleNodes, visibleLinks, handleNodeClick, pathData, drag, getUserProfilePicture, userConnections]) // Removed email from dependencies

  const handleConnect = useCallback(() => {
    console.log("Connecting with", selectedPerson?.name)
  }, [selectedPerson])

  const handleMessage = useCallback(() => {
    console.log("Messaging", selectedPerson?.name)
  }, [selectedPerson])

  const handleViewFullProfile = useCallback(() => {
    if (selectedPerson) {
      const matchedItem = userConnections.find(
        (item) => item.requester.email === selectedPerson.email || item.recipient.email === selectedPerson.email,
      )

      if (matchedItem) {
        const id =
          matchedItem.requester.email === selectedPerson.email ? matchedItem.requester.id : matchedItem.recipient.id
        console.log(id)
        router.push(`/userProfile/${id}`)
      } else {
        console.log("No matching profile found for the selected person.")
      }
    }
  }, [selectedPerson, router, userConnections])

  // **FIXED**: Manual reload function that forces a refresh
  const handleReload = useCallback(() => {
    setIsLoading(true)
    // Force a fresh fetch by clearing existing data first
    setGraphData(null)
    setVisibleNodes([])
    setVisibleLinks(null)
    fetchData()
  }, [fetchData])

  // Effect to load the selected person's profile picture
  useEffect(() => {
    if (selectedPerson && selectedPerson.email) {
      setSelectedPersonImage(`https://api.dicebear.com/6.x/initials/svg?seed=${selectedPerson.name}`)

      getUserProfilePicture(selectedPerson.email, userConnections, email)
        .then((imageUrl) => {
          setSelectedPersonImage(imageUrl)
        })
        .catch((err) => {
          console.error("Error loading selected person profile picture:", err)
        })
    } else {
      setSelectedPersonImage("")
    }
  }, [selectedPerson, userConnections, email, getUserProfilePicture])

  if (status === "loading" || isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (status !== "authenticated") {
    return (
      <div className=" flex justify-center items-center w-full h-full">
        Please log in to view your personal network.
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col h-screen dark:text-white">
      <div className="flex justify-end p-4">
        <Button onClick={handleReload} className="flex items-center">
          <RefreshCw className="h-4 w-4" />
          <p className="hidden md:block">Reload Network</p>
        </Button>
      </div>

      <div className="flex flex-1 w-full overflow-hidden">
        <div className="bg-white dark:bg-black rounded-lg shadow-md h-full w-full" style={{ minHeight: "500px" }}>
          <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
      </div>

      <Dialog open={!!selectedPerson} onOpenChange={() => setSelectedPerson(null)} className="dark:text-white">
        <DialogContent className="dark:text-white">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{selectedPerson?.name}</DialogTitle>
          </DialogHeader>
          <Card className="dark:text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={selectedPersonImage || "/placeholder.svg"} />
                  <AvatarFallback>{selectedPerson?.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <span>{selectedPerson?.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="dark:text-white">
              <p className="text-sm text-gray-500 mb-4">{selectedPerson?.email}</p>
              <p className="mb-4">{selectedPerson?.bio}</p>
              <div className="flex space-x-2">
                <Button onClick={handleViewFullProfile} className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  View Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  )
}