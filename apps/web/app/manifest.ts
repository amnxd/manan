import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
   return {
      name: 'Manan',
      short_name: 'Manan',
      description: 'AI-powered learning platform',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      icons: [
         {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
         }
      ],
   }
}
