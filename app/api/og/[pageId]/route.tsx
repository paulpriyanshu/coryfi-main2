// app/api/og/[pageId]/route.ts
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request, { params }) {
  const { pageId } = params

  // Fetch business data from your Node.js API route
  const res = await fetch(`https://connect.coryfi.com/api/business-data/${pageId}`)
  if (!res.ok) {
    return new Response('Business not found', { status: 404 })
  }

  const { pageData } = await res.json()

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          padding: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          color: '#000',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold' }}>
          {pageData?.name || 'Business Name'}
        </div>
        <div style={{ fontSize: 32, marginTop: 20, color: '#333' }}>
          {pageData?.description || 'Check out this awesome business on Coryfi!'}
        </div>
        <img
          src={pageData?.dpImageUrl || 'https://connect.coryfi.com/placeholder.jpg'}
          alt="Business"
          style={{
            width: 200,
            height: 200,
            objectFit: 'cover',
            borderRadius: 16,
            marginTop: 40,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}