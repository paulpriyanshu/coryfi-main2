export default function ThreadList() {
    const threads = [
      { id: 1, title: "Project A Discussion", lastUpdate: "2 hours ago" },
      { id: 2, title: "Bug Fixes Thread", lastUpdate: "1 day ago" },
      { id: 3, title: "Feature Request: Dark Mode", lastUpdate: "3 days ago" },
    ]
  
    return (
      <ul className="space-y-2">
        {threads.map((thread) => (
          <li key={thread.id} className="p-2 bg-white rounded shadow">
            <p className="font-semibold">{thread.title}</p>
            <p className="text-sm text-gray-600">Last update: {thread.lastUpdate}</p>
          </li>
        ))}
      </ul>
    )
  }