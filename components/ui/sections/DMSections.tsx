export default function DMSection() {
    const dms = [
      { id: 1, message: "Hey, how's it going?", sender: "Alice" },
      { id: 2, message: "Can we meet later?", sender: "Bob" },
      { id: 3, message: "Don't forget about...", sender: "Charlie" },
    ]
  
    return (
      <ul className="space-y-2">
        {dms.map((dm) => (
          <li key={dm.id} className="p-2 bg-white rounded shadow">
            <p className="font-semibold">{dm.sender}</p>
            <p className="text-sm">{dm.message}</p>
          </li>
        ))}
      </ul>
    )
  }