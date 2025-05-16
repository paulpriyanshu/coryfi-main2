import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    console.log("hello there")
    const { pageId } = params

    // Fetch business data from your Node.js API route
    const res = await fetch(`https://connect.coryfi.com/api/business-data/${pageId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!res.ok) {
      console.error(`Failed to fetch business data: ${res.status} ${res.statusText}`)
      return new Response('Business not found', { status: 404 })
    }

    const { pageData } = await res.json()
    console.log("business data",pageData)

    // Make sure we have full absolute URLs for images
    const imageUrl = pageData?.dpImageUrl 
      ? new URL(pageData.dpImageUrl, 'https://connect.coryfi.com').toString()
      : 'https://connect.coryfi.com/placeholder.jpg'

    // Generate the image response
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: 40,
          }}
        >
          <div style={{ 
            fontSize: 64, 
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
            color: '#000000'
          }}>
            {pageData?.name || 'Business Name'}
          </div>
          
          <div style={{ 
            fontSize: 32, 
            color: '#333333',
            textAlign: 'center',
            marginBottom: 40,
            maxWidth: '80%'
          }}>
            {pageData?.description || 'Check out this awesome business on Coryfi!'}
          </div>
          
          <img
            src={imageUrl}
            alt={pageData?.name || 'Business'}
            style={{
              width: 300,
              height: 300,
              objectFit: 'cover',
              borderRadius: 16,
              border: '4px solid #f0f0f0',
            }}
          />
          
          <div style={{ 
            fontSize: 24, 
            marginTop: 30,
            color: '#666666',
            fontWeight: 'bold'
          }}>
            Discover more on Coryfi
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Error generating image', { status: 500 })
  }
}