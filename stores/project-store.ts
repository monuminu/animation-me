import { create } from 'zustand'
import type { AnimationConfig, ChatMessage, PlaybackState, FileTreeNode, CanvasPreset, RecordingState, ExportProgress, NarrationState, SceneAudio } from '@/types'
import { computeTotalDuration } from '@/lib/scene-utils'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

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

  // Narration
  narration: NarrationState

  // File tree
  fileTree: FileTreeNode[]
  selectedFile: string | null

  // UI
  chatPanelWidth: number
  fileTreePanelWidth: number
  isFileTreeOpen: boolean
  canvasPresetId: string
  isPreviewOpen: boolean
  isExportModalOpen: boolean
  isExporting: boolean
  exportProgress: ExportProgress | null

  // Persistence
  saveStatus: SaveStatus
  lastSavedAt: number | null

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
  openExportModal: () => void
  closeExportModal: () => void
  setIsExporting: (exporting: boolean) => void
  setExportProgress: (progress: ExportProgress | null) => void
  updateSceneDelay: (sceneIndex: number, delay: number) => void
  setNarrationMuted: (muted: boolean) => void
  setNarrationGenerating: (generating: boolean) => void
  setNarrationProgress: (progress: number) => void
  setSceneAudio: (sceneId: string, updates: Partial<SceneAudio>) => void
  setAllSceneAudios: (audios: SceneAudio[]) => void
  clearNarration: () => void
  setSaveStatus: (status: SaveStatus) => void
  hydrateFromServer: (data: {
    projectId: string
    title: string
    prompt: string
    animationConfig: AnimationConfig | null
    messages: ChatMessage[]
    canvasPresetId: string
  }) => void
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

const initialNarration: NarrationState = {
  enabled: true,
  muted: false,
  voiceId: '',
  sceneAudios: [],
  isGenerating: false,
  generationProgress: 0,
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
  narration: initialNarration,
  fileTree: [],
  selectedFile: null,
  chatPanelWidth: 320,
  fileTreePanelWidth: 280,
  isFileTreeOpen: true,
  canvasPresetId: 'full-size',
  isPreviewOpen: false,
  isExportModalOpen: false,
  isExporting: false,
  exportProgress: null,
  saveStatus: 'idle',
  lastSavedAt: null,

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
    set((state) => {
      // Revoke old blob URLs to prevent memory leaks
      for (const audio of state.narration.sceneAudios) {
        if (audio.audioUrl && audio.audioUrl.startsWith('blob:')) {
          try { URL.revokeObjectURL(audio.audioUrl) } catch {}
        }
      }
      return {
        animationConfig: config,
        playback: config
          ? { ...initialPlayback, totalDuration: config.totalDuration }
          : initialPlayback,
        recording: initialRecording,
        narration: initialNarration,
      }
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

  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false, exportProgress: null }),
  setIsExporting: (exporting) => set({ isExporting: exporting }),
  setExportProgress: (progress) => set({ exportProgress: progress }),

  updateSceneDelay: (sceneIndex, delay) =>
    set((state) => {
      if (!state.animationConfig) return state
      const scenes = state.animationConfig.scenes.map((scene, i) =>
        i === sceneIndex ? { ...scene, delay: Math.max(0, delay) } : scene
      )
      const newTotalDuration = computeTotalDuration(scenes)
      return {
        animationConfig: {
          ...state.animationConfig,
          scenes,
          totalDuration: newTotalDuration,
        },
        playback: {
          ...state.playback,
          totalDuration: newTotalDuration,
        },
      }
    }),

  setNarrationMuted: (muted) =>
    set((state) => ({
      narration: { ...state.narration, muted },
    })),

  setNarrationGenerating: (generating) =>
    set((state) => ({
      narration: { ...state.narration, isGenerating: generating },
    })),

  setNarrationProgress: (progress) =>
    set((state) => ({
      narration: { ...state.narration, generationProgress: progress },
    })),

  setSceneAudio: (sceneId, updates) =>
    set((state) => {
      const existing = state.narration.sceneAudios.find((a) => a.sceneId === sceneId)
      if (existing) {
        return {
          narration: {
            ...state.narration,
            sceneAudios: state.narration.sceneAudios.map((a) =>
              a.sceneId === sceneId ? { ...a, ...updates } : a
            ),
          },
        }
      }
      // Create new entry
      const newAudio: SceneAudio = {
        sceneId,
        audioUrl: '',
        audioDuration: 0,
        status: 'pending',
        ...updates,
      }
      return {
        narration: {
          ...state.narration,
          sceneAudios: [...state.narration.sceneAudios, newAudio],
        },
      }
    }),

  setAllSceneAudios: (audios) =>
    set((state) => ({
      narration: { ...state.narration, sceneAudios: audios },
    })),

  clearNarration: () =>
    set((state) => {
      // Revoke all blob URLs to prevent memory leaks
      for (const audio of state.narration.sceneAudios) {
        if (audio.audioUrl && audio.audioUrl.startsWith('blob:')) {
          try { URL.revokeObjectURL(audio.audioUrl) } catch {}
        }
      }
      return { narration: initialNarration }
    }),

  setSaveStatus: (status) => set({ saveStatus: status, lastSavedAt: status === 'saved' ? Date.now() : undefined }),

  hydrateFromServer: (data) =>
    set({
      projectId: data.projectId,
      projectTitle: data.title,
      initialPrompt: data.prompt,
      animationConfig: data.animationConfig,
      messages: data.messages,
      canvasPresetId: data.canvasPresetId,
      playback: data.animationConfig
        ? { ...initialPlayback, totalDuration: data.animationConfig.totalDuration }
        : initialPlayback,
      recording: initialRecording,
      narration: initialNarration,
      saveStatus: 'saved',
      lastSavedAt: Date.now(),
    }),

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
      narration: initialNarration,
      fileTree: [],
      selectedFile: null,
      saveStatus: 'idle',
      lastSavedAt: null,
    }),
}))
