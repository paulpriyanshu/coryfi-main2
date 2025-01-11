import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type PathNode = {
  id: string
  name: string
}

type ConnectionPath = {
  id: string
  nodes: PathNode[]
}

type ConnectionPathsProps = {
  paths: ConnectionPath[]
}

export default function Connectioncard({ paths }: ConnectionPathsProps = {
  paths: [
    {
      id: "path1",
      nodes: [
        { id: "user", name: "You" },
        { id: "connection1", name: "John Doe" },
        { id: "connection2", name: "Jane Smith" },
        { id: "target", name: "Target User" }
      ]
    },
    {
      id: "path2",
      nodes: [
        { id: "user", name: "You" },
        { id: "connection3", name: "Alice Johnson" },
        { id: "connection4", name: "Bob Williams" },
        { id: "target", name: "Target User" }
      ]
    },
    {
      id: "path3",
      nodes: [
        { id: "user", name: "You" },
        { id: "connection5", name: "Charlie Brown" },
        { id: "connection6", name: "Diana Prince" },
        { id: "target", name: "Target User" }
      ]
    },
    {
      id: "path4",
      nodes: [
        { id: "user", name: "You" },
        { id: "connection7", name: "Eve Anderson" },
        { id: "connection8", name: "Frank Miller" },
        { id: "target", name: "Target User" }
      ]
    }
  ]
}) {
  return (
    <ScrollArea className="h-[400px] w-full max-w-md p-4 rounded-lg border">
      <div className="space-y-4">
        {paths.map((path) => (
          <ConnectionPathCard key={path.id} path={path} />
        ))}
      </div>
    </ScrollArea>
  )
}

function ConnectionPathCard({ path }: { path: ConnectionPath }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {path.nodes.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full ${index === 0 || index === path.nodes.length - 1 ? 'bg-primary w-6 h-6' : 'bg-secondary'} flex items-center justify-center`}>
                {index === 1 && (
                  <div className="absolute -top-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0L11.1962 9H0.803848L6 0Z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs mt-1 text-center">{node.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          {path.nodes.map((_, index) => (
            <div key={index} className="flex-1">
              {index < path.nodes.length - 1 && (
                <div className="flex items-center justify-center">
                  {index === 1 ? (
                    <div className="text-secondary text-2xl leading-none">...</div>
                  ) : (
                    <div className="h-px bg-secondary flex-1"></div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}