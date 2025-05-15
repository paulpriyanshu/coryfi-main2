import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { getBusinessPageData } from '@/app/api/business/business'

// Enable the Edge runtime for fast response
export const runtime = 'edge'

export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const { pageId } = params

  const { pageData } = await getBusinessPageData(pageId)

  const name = pageData?.name || 'Business'
  const description = pageData?.description || 'Explore our offerings'
  const imageUrl = pageData?.dpImageUrl || 'https://yourdomain.com/default-image.png'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          width: '100%',
          height: '100%',
          fontFamily: 'Inter, sans-serif',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <img
          src={imageUrl}
          width={128}
          height={128}
          style={{
            borderRadius: '50%',
            marginBottom: '20px',
            objectFit: 'cover',
          }}
          alt="Business Logo"
        />
        <h1 style={{ fontSize: 48, fontWeight: 'bold', margin: 0 }}>{name}</h1>
        <p style={{ fontSize: 24, color: '#6b7280', marginTop: '16px' }}>
          {description}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}