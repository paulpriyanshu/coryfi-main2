import { MetadataRoute } from 'next'
import { getAllPages } from '@/app/api/business/business' // Adjust the import path as needed

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      // Fetch business pages
      const businesses = await getAllPages()
  
      // Check if businesses.pageData exists and is an array
      const businessEntries: MetadataRoute.Sitemap = Array.isArray(businesses?.pageData)
        ? businesses.pageData.map(business => ({
            url: `https://connect.coryfi.com/explore/business/${encodeURIComponent(business.name)}/${business.id}`,
            lastModified: business.updatedAt ? new Date(business.updatedAt).toISOString() : undefined,
            changeFrequency: 'weekly',
            priority: 0.8
          }))
        : []
  
      // Define static pages
      const staticPages: MetadataRoute.Sitemap = [
        { url: 'https://connect.coryfi.com', changeFrequency: 'daily', priority: 1 },
        { url: 'https://connect.coryfi.com/explore', changeFrequency: 'daily', priority: 0.8 },
        { url: 'https://connect.coryfi.com/feed', changeFrequency: 'daily', priority: 0.8 }
      ]
  
      return [...staticPages, ...businessEntries]
  
    } catch (error) {
      console.error("Error generating sitemap:", error)
      return []
    }
  }