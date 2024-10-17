import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Sample data
const sampleCommunities = [
  { id: 1, name: "Community Alpha", members: 250 },
  { id: 2, name: "Community Beta", members: 450 },
  { id: 3, name: "Community Gamma", members: 300 },
  { id: 4, name: "Community Delta", members: 550 },
  { id: 5, name: "Community Epsilon", members: 120 },
  { id: 6, name: "Community Zeta", members: 780 },
  { id: 7, name: "Community Eta", members: 650 },
  { id: 8, name: "Community Theta", members: 900 },
  { id: 9, name: "Community Iota", members: 200 },
  { id: 10, name: "Community Kappa", members: 350 },
  { id: 11, name: "Community Lambda", members: 1000 },
  { id: 12, name: "Community Mu", members: 230 },
  { id: 13, name: "Community Nu", members: 500 },
  { id: 14, name: "Community Xi", members: 270 },
  { id: 15, name: "Community Omicron", members: 800 },
]

export default function CommunitiesList() {
  return (
    <Card className="flex flex-col h-3/5">
      <CardHeader className="border-b">
        <CardTitle>Communities/Grps</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100vh-280px)] overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {sampleCommunities.map(community => (
              <li key={community.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-auto bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {community.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {community.members} members
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
