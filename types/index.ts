export interface Scene {
  id: string
  template: string
  duration: number
  delay?: number  // ms pause after scene, before next scene/transition
  narration?: string  // Voiceover script text for TTS
  data: Record<string, unknown>
  transition?: TransitionConfig
}

export interface TransitionConfig {
  type:
    | 'none'
    | 'fade'
    | 'fadeBlur'
    | 'scaleFade'
    | 'slideLeft'
    | 'slideRight'
    | 'slideUp'
    | 'slideDown'
    | 'wipe'
    | 'zoomThrough'
    | 'crossDissolve'
    | 'clipCircle'
    | 'perspectiveFlip'
    | 'morphExpand'
    | 'splitHorizontal'
    | 'splitVertical'
    | 'pushLeft'
    | 'pushRight'
    // Backward-compat aliases
    | 'slide'
    | 'morph'
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

export interface RecordingState {
  isRecording: boolean
  hasStarted: boolean
  hasEnded: boolean
}

export interface ExportConfig {
  width: number
  height: number
  fps: 24 | 30 | 60
  quality: 'low' | 'medium' | 'high'
  format: 'mp4'
}

export interface ExportProgress {
  phase: 'preparing' | 'rendering' | 'encoding' | 'finalizing' | 'done' | 'error'
  currentFrame: number
  totalFrames: number
  percent: number
  error?: string
}

export interface SceneAudio {
  sceneId: string
  audioUrl: string       // Blob URL (preview) or file path (export)
  audioDuration: number  // ms, measured from actual audio
  status: 'pending' | 'generating' | 'ready' | 'error'
  error?: string
}

export interface NarrationState {
  enabled: boolean
  muted: boolean
  voiceId: string
  sceneAudios: SceneAudio[]
  isGenerating: boolean
  generationProgress: number  // 0-100
}
