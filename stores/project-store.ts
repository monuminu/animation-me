import { create } from 'zustand'
import type { AnimationConfig, ChatMessage, PlaybackState, FileTreeNode, CanvasPreset, RecordingState } from '@/types'

interface ProjectStore {
  // Project
  projectId: string | null
  projectTitle: string
  initialPrompt: string

  // Chat
  messages: ChatMessage[]
  isGenerating: boolean

  // Animation
  animationConfig: AnimationConfig | null

  // Playback
  playback: PlaybackState

  // Recording
  recording: RecordingState

  // File tree
  fileTree: FileTreeNode[]
  selectedFile: string | null

  // UI
  chatPanelWidth: number
  fileTreePanelWidth: number
  isFileTreeOpen: boolean
  canvasPresetId: string
  isPreviewOpen: boolean

  // Actions
  setProjectId: (id: string) => void
  setProjectTitle: (title: string) => void
  setInitialPrompt: (prompt: string) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setIsGenerating: (generating: boolean) => void
  setAnimationConfig: (config: AnimationConfig | null) => void
  setPlayback: (updates: Partial<PlaybackState>) => void
  togglePlayback: () => void
  setFileTree: (tree: FileTreeNode[]) => void
  setSelectedFile: (path: string | null) => void
  setChatPanelWidth: (width: number) => void
  setFileTreePanelWidth: (width: number) => void
  toggleFileTree: () => void
  setFileTreeOpen: (open: boolean) => void
  setCanvasPresetId: (id: string) => void
  setRecording: (updates: Partial<RecordingState>) => void
  openPreview: () => void
  closePreview: () => void
  reset: () => void
}

const initialPlayback: PlaybackState = {
  isPlaying: false,
  currentTime: 0,
  totalDuration: 0,
  currentSceneIndex: 0,
  speed: 1,
}

const initialRecording: RecordingState = {
  isRecording: false,
  hasStarted: false,
  hasEnded: false,
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projectId: null,
  projectTitle: 'Untitled Project',
  initialPrompt: '',
  messages: [],
  isGenerating: false,
  animationConfig: null,
  playback: initialPlayback,
  recording: initialRecording,
  fileTree: [],
  selectedFile: null,
  chatPanelWidth: 320,
  fileTreePanelWidth: 280,
  isFileTreeOpen: true,
  canvasPresetId: 'full-size',
  isPreviewOpen: false,

  setProjectId: (id) => set({ projectId: id }),
  setProjectTitle: (title) => set({ projectTitle: title }),
  setInitialPrompt: (prompt) => set({ initialPrompt: prompt }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  setIsGenerating: (generating) => set({ isGenerating: generating }),

  setAnimationConfig: (config) =>
    set({
      animationConfig: config,
      playback: config
        ? { ...initialPlayback, totalDuration: config.totalDuration }
        : initialPlayback,
      recording: initialRecording,
    }),

  setPlayback: (updates) =>
    set((state) => ({
      playback: { ...state.playback, ...updates },
    })),

  togglePlayback: () =>
    set((state) => ({
      playback: {
        ...state.playback,
        isPlaying: !state.playback.isPlaying,
      },
    })),

  setFileTree: (tree) => set({ fileTree: tree }),
  setSelectedFile: (path) => set({ selectedFile: path }),
  setChatPanelWidth: (width) => set({ chatPanelWidth: width }),
  setFileTreePanelWidth: (width) => set({ fileTreePanelWidth: width }),
  toggleFileTree: () => set((state) => ({ isFileTreeOpen: !state.isFileTreeOpen })),
  setFileTreeOpen: (open) => set({ isFileTreeOpen: open }),
  setCanvasPresetId: (id) => set({ canvasPresetId: id }),

  setRecording: (updates) =>
    set((state) => ({
      recording: { ...state.recording, ...updates },
    })),

  openPreview: () =>
    set((state) => ({
      isPreviewOpen: true,
      playback: {
        ...state.playback,
        currentTime: 0,
        currentSceneIndex: 0,
        isPlaying: true,
      },
    })),

  closePreview: () =>
    set((state) => ({
      isPreviewOpen: false,
      playback: {
        ...state.playback,
        isPlaying: false,
      },
    })),

  reset: () =>
    set({
      projectId: null,
      projectTitle: 'Untitled Project',
      initialPrompt: '',
      messages: [],
      isGenerating: false,
      animationConfig: null,
      playback: initialPlayback,
      recording: initialRecording,
      fileTree: [],
      selectedFile: null,
    }),
}))
