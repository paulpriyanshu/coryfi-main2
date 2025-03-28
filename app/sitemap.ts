import { MetadataRoute } from 'next'
import { getAllPages } from '@/app/api/business/business' // Adjust the import path as needed

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all business pages using the server action
  const businesses = await getAllPages()



  // Generate sitemap entries dynamically
  const businessEntries: MetadataRoute.Sitemap = businesses.pageData.map(business => ({
    url: `https://connect.coryfi.com/explore/business/${encodeURIComponent(business.name)}/${business.id}`,
    lastModified: business.updatedAt ? new Date(business.updatedAt).toISOString() : undefined,
    changeFrequency: 'weekly',
    priority: 0.8
  }))

  // Define static pages with metadata
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://connect.coryfi.com',
    //   lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: 'https://connect.coryfi.com/explore',
    //   lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
        url: 'https://connect.coryfi.com/feed',
        // lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.8
    }
  ]

  return [...staticPages, ...businessEntries]
}