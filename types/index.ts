export interface Scene {
  id: string
  template: string
  duration: number
  data: Record<string, unknown>
  transition?: TransitionConfig
}

export interface TransitionConfig {
  type: 'fade' | 'slide' | 'wipe' | 'morph' | 'none'
  duration?: number
}

export interface AnimationConfig {
  title: string
  totalDuration: number
  scenes: Scene[]
  metadata?: {
    prompt: string
    model: string
    generatedAt: string
  }
}

export interface Project {
  id: string
  title: string
  prompt: string
  config: AnimationConfig | null
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  animationConfig?: AnimationConfig
  isStreaming?: boolean
}

export interface BrandKit {
  colors: {
    primary: string
    accent: string
    background: string
    text: string
    muted: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    headingWeight: number
  }
  logo?: string
}

export interface VisualContext {
  colors: {
    bg: string
    accent: string
    heading: string
    body: string
    gradient?: string[]
  }
  typography: {
    headingFont: string
    headingWeight: number
    letterSpacing: string
  }
  layout: {
    style: string
    borderRadius: string
    density: string
  }
  tone: {
    minimal: number
    corporate: number
    dark: number
    dynamic: number
  }
  keyScreens: string[]
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  base64?: string
}

export interface SceneProps {
  isActive: boolean
  progress: number
  onComplete: () => void
  data: Record<string, unknown>
}

export interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  currentSceneIndex: number
  speed: number
}

export interface FileTreeNode {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileTreeNode[]
  content?: string
  language?: string
}

export interface CanvasPreset {
  id: string
  label: string
  width: number
  height: number
  category: 'standard' | 'iphone' | 'pixel' | 'samsung'
}
