export interface Node extends d3.SimulationNodeDatum {
    id: string
    group: number
    connections: number
    avatar: string
    bio: string
    visible: boolean
  }
  
export interface Link extends d3.SimulationLinkDatum<Node> {
    source: string | number | Node
    target: string | number | Node
    value: number
  }
  
  
export interface GraphData {
    nodes: Node[]
    links: Link[]
  }
  