export default function MailSection() {
    const mails = [
      { id: 1, subject: "Meeting tomorrow", sender: "John Doe" },
      { id: 2, subject: "Project update", sender: "Jane Smith" },
      { id: 3, subject: "Weekly report", sender: "Mike Johnson" },
    ]
  
    return (
      <ul className="space-y-2">
        {mails.map((mail) => (
          <li key={mail.id} className="p-2 bg-white rounded shadow">
            <p className="font-semibold">{mail.subject}</p>
            <p className="text-sm text-gray-600">{mail.sender}</p>
          </li>
        ))}
      </ul>
    )
  }