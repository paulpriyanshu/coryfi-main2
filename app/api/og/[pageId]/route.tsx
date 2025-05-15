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
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        padding: '60px 80px',
        fontSize: 40,
        fontFamily: 'Arial, sans-serif',
        color: '#111',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            lineHeight: 1.2,
            color: '#000',
            marginBottom: 24,
          }}
        >
          {pageData?.name || 'Business Name'}
        </div>
        <div style={{ fontSize: 36, color: '#444' }}>
          {pageData?.description || 'Explore this business on Coryfi!'}
        </div>
      </div>

      <img
        src={pageData?.dpImageUrl || 'https://connect.coryfi.com/placeholder.jpg'}
        alt="Business"
        style={{
          width: 280,
          height: 280,
          objectFit: 'cover',
          borderRadius: 20,
          marginLeft: 60,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
        }}
      />
    </div>
  ),
  {
    width: 1200,
    height: 630,
  }
);
}