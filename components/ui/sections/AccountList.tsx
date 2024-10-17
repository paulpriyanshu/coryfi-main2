import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Sample data
const sampleAccounts = [
  { id: 1, name: "Account One", username: "username1" },
  { id: 2, name: "Account Two", username: "username2" },
  { id: 3, name: "Account Three", username: "username3" },
  { id: 4, name: "Account Four", username: "username4" },
  { id: 5, name: "Account Five", username: "username5" },
  { id: 6, name: "Account Six", username: "username6" },
  { id: 7, name: "Account Seven", username: "username7" },
  { id: 8, name: "Account Eight", username: "username8" },
  { id: 9, name: "Account Nine", username: "username9" },
  { id: 10, name: "Account Ten", username: "username10" },
  { id: 11, name: "Account Eleven", username: "username11" },
  { id: 12, name: "Account Twelve", username: "username12" },
  { id: 13, name: "Account Thirteen", username: "username13" },
  { id: 14, name: "Account Fourteen", username: "username14" },
  { id: 15, name: "Account Fifteen", username: "username15" },
  { id: 16, name: "Account Sixteen", username: "username16" },
  { id: 17, name: "Account Seventeen", username: "username17" },
  { id: 18, name: "Account Eighteen", username: "username18" },
  { id: 19, name: "Account Nineteen", username: "username19" },
  { id: 20, name: "Account Twenty", username: "username20" },
]

export default function AccountsList() {
  return (
    <Card className="flex flex-col h-3/5 overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle>Accounts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100vh-280px)] overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {sampleAccounts.map(account => (
              <li key={account.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-auto bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {account.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      @{account.username}
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
