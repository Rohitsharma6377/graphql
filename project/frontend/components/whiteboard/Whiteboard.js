'use client'

import { motion } from 'framer-motion'
import { 
  X, 
  Pen, 
  Eraser, 
  Undo, 
  Redo, 
  Download, 
  Trash2,
  Circle,
  Square,
  Minus
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Whiteboard({ roomId, onClose }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState('pen') // pen, eraser, line, circle, square
  const [color, setColor] = useState('#6366F1')
  const [lineWidth, setLineWidth] = useState(3)
  const [strokes, setStrokes] = useState([])
  const [currentStroke, setCurrentStroke] = useState(null)

  const colors = [
    '#6366F1', // primary
    '#22D3EE', // accent
    '#10B981', // success
    '#F59E0B', // warning
    '#EF4444', // destructive
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#FFFFFF', // white
    '#000000', // black
  ]

  const lineWidths = [2, 3, 5, 8, 12]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set canvas background
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw all strokes
    strokes.forEach(stroke => drawStroke(ctx, stroke))
  }, [strokes])

  const drawStroke = (ctx, stroke) => {
    if (!stroke.points || stroke.points.length < 2) return

    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }

    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setCurrentStroke({
      tool,
      color,
      width: lineWidth,
      points: [{ x, y }],
    })
  }

  const draw = (e) => {
    if (!isDrawing || !currentStroke) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentStroke({
      ...currentStroke,
      points: [...currentStroke.points, { x, y }],
    })

    const ctx = canvas.getContext('2d')
    drawStroke(ctx, {
      ...currentStroke,
      points: [...currentStroke.points, { x, y }],
    })
  }

  const stopDrawing = () => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes([...strokes, currentStroke])
    }
    setIsDrawing(false)
    setCurrentStroke(null)
  }

  const handleUndo = () => {
    if (strokes.length > 0) {
      setStrokes(strokes.slice(0, -1))
    }
  }

  const handleClear = () => {
    setStrokes([])
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `whiteboard-${roomId}-${Date.now()}.png`
    link.href = url
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg"
    >
      {/* Header */}
      <div className="glass-strong border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Pen className="w-6 h-6 text-primary-400" />
            Collaborative Whiteboard
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute top-24 left-6 z-10">
        <div className="glass-strong p-4 rounded-2xl space-y-4">
          {/* Tools */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium mb-2">Tools</p>
            <div className="flex flex-col gap-2">
              <Button
                variant={tool === 'pen' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setTool('pen')}
                className="rounded-xl"
              >
                <Pen className="w-5 h-5" />
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setTool('eraser')}
                className="rounded-xl"
              >
                <Eraser className="w-5 h-5" />
              </Button>
              <Button
                variant={tool === 'line' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setTool('line')}
                className="rounded-xl"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Button
                variant={tool === 'circle' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setTool('circle')}
                className="rounded-xl"
              >
                <Circle className="w-5 h-5" />
              </Button>
              <Button
                variant={tool === 'square' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setTool('square')}
                className="rounded-xl"
              >
                <Square className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Color</p>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-lg transition-all',
                    color === c && 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Size</p>
            <div className="flex flex-col gap-2 items-center">
              {lineWidths.map((width) => (
                <button
                  key={width}
                  onClick={() => setLineWidth(width)}
                  className={cn(
                    'rounded-full bg-foreground transition-all',
                    lineWidth === width && 'ring-2 ring-primary'
                  )}
                  style={{ width: width * 2, height: width * 2 }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="w-full rounded-xl"
            >
              <Undo className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="w-full rounded-xl"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button
              variant="glass"
              size="icon"
              onClick={handleDownload}
              className="w-full rounded-xl"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="h-[calc(100vh-88px)] p-6 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-full h-full glass-strong rounded-2xl overflow-hidden shadow-glass-lg"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
        </motion.div>
      </div>

      {/* Participants Cursors - Placeholder */}
      <div className="absolute bottom-6 right-6 glass-strong p-3 rounded-xl">
        <p className="text-xs text-muted-foreground">
          👥 3 people are drawing
        </p>
      </div>
    </motion.div>
  )
}
