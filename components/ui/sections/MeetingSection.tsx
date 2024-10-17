export default function MeetingSection() {
    const meetings = [
      { id: 1, title: "Team Standup", time: "10:00 AM" },
      { id: 2, title: "Client Call", time: "2:00 PM" },
      { id: 3, title: "Project Review", time: "4:30 PM" },
    ]
  
    return (
      <ul className="space-y-2">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="p-2 bg-white rounded shadow">
            <p className="font-semibold">{meeting.title}</p>
            <p className="text-sm text-gray-600">{meeting.time}</p>
          </li>
        ))}
      </ul>
    )
  }