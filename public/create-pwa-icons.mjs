// Simple script to create placeholder PWA icons
// Run: node public/create-pwa-icons.js

import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createIcon(size, filename) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background gradient (approximation with solid color for simplicity)
  ctx.fillStyle = '#667eea'
  ctx.fillRect(0, 0, size, size)

  // Rounded corners effect
  const radius = size * 0.2
  ctx.fillStyle = '#667eea'

  // Create rounded rectangle path
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.arcTo(size, 0, size, radius, radius)
  ctx.lineTo(size, size - radius)
  ctx.arcTo(size, size, size - radius, size, radius)
  ctx.lineTo(radius, size)
  ctx.arcTo(0, size, 0, size - radius, radius)
  ctx.lineTo(0, radius)
  ctx.arcTo(0, 0, radius, 0, radius)
  ctx.closePath()

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#764ba2')
  ctx.fillStyle = gradient
  ctx.fill()

  // White wallet background
  const walletWidth = size * 0.66
  const walletHeight = size * 0.62
  const walletX = (size - walletWidth) / 2
  const walletY = (size - walletHeight) / 2
  const walletRadius = size * 0.04

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.beginPath()
  ctx.moveTo(walletX + walletRadius, walletY)
  ctx.lineTo(walletX + walletWidth - walletRadius, walletY)
  ctx.arcTo(
    walletX + walletWidth,
    walletY,
    walletX + walletWidth,
    walletY + walletRadius,
    walletRadius,
  )
  ctx.lineTo(walletX + walletWidth, walletY + walletHeight - walletRadius)
  ctx.arcTo(
    walletX + walletWidth,
    walletY + walletHeight,
    walletX + walletWidth - walletRadius,
    walletY + walletHeight,
    walletRadius,
  )
  ctx.lineTo(walletX + walletRadius, walletY + walletHeight)
  ctx.arcTo(
    walletX,
    walletY + walletHeight,
    walletX,
    walletY + walletHeight - walletRadius,
    walletRadius,
  )
  ctx.lineTo(walletX, walletY + walletRadius)
  ctx.arcTo(walletX, walletY, walletX + walletRadius, walletY, walletRadius)
  ctx.closePath()
  ctx.fill()

  // Dollar sign
  ctx.fillStyle = '#667eea'
  ctx.font = `bold ${size * 0.35}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('$', size / 2, size / 2)

  // Save
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(__dirname, filename), buffer)
  console.log(`✅ Created ${filename} (${size}x${size})`)
}

// Generate icons
console.log('🎨 Generating PWA icons...\n')

try {
  createIcon(512, 'pwa-512x512.png')
  createIcon(192, 'pwa-192x192.png')
  createIcon(180, 'apple-touch-icon.png')

  console.log('\n✨ All icons generated successfully!')
  console.log('📁 Icons saved in public/ directory')
} catch (error) {
  console.error('❌ Error:', error.message)
  console.log('\n💡 Note: This script requires canvas package')
  console.log('   Run: npm install canvas')
  console.log('   Or use the HTML generator: public/generate-icons.html')
}
