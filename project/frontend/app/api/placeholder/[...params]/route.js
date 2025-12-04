export async function GET(request, { params }) {
  const { params: dimensions } = params
  const [width = '100', height = '100'] = dimensions
  
  // Create SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height)/3}" fill="#6366f1"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="sans-serif" font-size="14" font-weight="600">
        ${String.fromCodePoint(0x1F464)}
      </text>
    </svg>
  `
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
