export default function YourList() {
    const items = [
      { id: 1, text: "Complete project proposal" },
      { id: 2, text: "Review code changes" },
      { id: 3, text: "Prepare for client meeting" },
      { id: 4, text: "Update documentation" },
    ]
  
    return (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center p-2 bg-white rounded shadow">
            <input type="checkbox" className="mr-2" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    )
  }