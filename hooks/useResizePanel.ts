'use client'

import { useState, useCallback, useEffect } from 'react'

interface UseResizePanelOptions {
  initialWidth: number
  minWidth: number
  maxWidth: number
  onResize: (width: number) => void
  direction: 'left' | 'right'
}

export function useResizePanel({
  initialWidth,
  minWidth,
  maxWidth,
  onResize,
  direction,
}: UseResizePanelOptions) {
  const [width, setWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth: number
      if (direction === 'right') {
        newWidth = e.clientX
      } else {
        newWidth = window.innerWidth - e.clientX
      }
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(newWidth)
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minWidth, maxWidth, onResize, direction])

  return { width, isResizing, onMouseDown }
}
