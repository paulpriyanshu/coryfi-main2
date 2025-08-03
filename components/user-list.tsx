
// import React from 'react'
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Send, ExpandIcon as Explore, CheckCircle, Play, ArrowLeft } from "lucide-react"
// import { getTop8MostConnectedUsers } from "@/app/api/actions/user"
// async function UserLists() {
//     const users=await getTop8MostConnectedUsers()
//     console.log("top users")
//   return (
//     <>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {users.map((user) => (
//             <Card
//               key={user.id}
//               className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300"
//             >
//               <CardContent className="p-6 text-center">
//                 <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-slate-600">
//                   <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
//                 </div>
//                 <h3 className="text-white font-medium mb-4">{user.name}</h3>
//                 <Button
//                   onClick={() => sendRequest(user.id)}
//                   disabled={user.requestSent}
//                   size="sm"
//                   className={`w-full transition-all duration-300 ${
//                     user.requestSent
//                       ? "bg-green-600 hover:bg-green-600 shadow-green-500/20"
//                       : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:scale-105"
//                   }`}
//                 >
//                   {user.requestSent ? (
//                     <>
//                       <CheckCircle className="w-4 h-4 mr-2" />
//                       Sent
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4 mr-2" />
//                       Send Request
//                     </>
//                   )}
//                 </Button>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//     </>
//   )
// }

// export default UserLists