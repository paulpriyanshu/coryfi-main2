import { NextResponse } from 'next/server'
import { get_new_requests } from "@/app/api/actions/network"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const result = await get_new_requests(email)
    
    if (result?.success) {
      return NextResponse.json({ requests: result.requests })
    } else {
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}