# Export MP4 — Implementation Plan

## Overview

Implement in-browser MP4 export using **mediabunny** (already installed as `mediabunny@1.35.1`). The export uses the canvas preset size selected in the Studio's PreviewPanel dropdown as the video resolution. The animation is rendered frame-by-frame to an OffscreenCanvas at the target resolution, encoded via mediabunny's `CanvasSource` + `Mp4OutputFormat`, and downloaded as an MP4 file.

---

## Architecture

```
User clicks "Export" in TopBar
        │
        ▼
  ExportModal opens
  ├── Shows selected canvas preset (e.g., 1920×1080)
  ├── Quality picker (Low / Medium / High)
  ├── FPS picker (24 / 30 / 60)
  └── "Export MP4" button
        │
        ▼
  useExportMP4 hook kicks off
  ├── 1. Pause current playback
  ├── 2. Create OffscreenCanvas at preset dimensions
  ├── 3. Create mediabunny Output + CanvasSource
  ├── 4. Frame-by-frame loop:
  │      for each frame (0 → totalFrames):
  │        a. Calculate currentTime = frame / fps
  │        b. Determine currentSceneIndex + progress
  │        c. Render scene to OffscreenCanvas via html2canvas-style capture
  │           (actually: render React scenes into a hidden DOM container,
  │            then use dom-to-canvas capture per frame)
  │        d. Call videoSource.add(timestamp, 1/fps)
  ├── 5. Finalize output
  ├── 6. Create Blob from buffer → trigger download
  └── 7. Restore playback state
```

### Key Challenge: React → Canvas

The animations are React components (divs, text, CSS transforms) — not drawn on a `<canvas>`. To capture each frame for mediabunny's `CanvasSource`, we need to rasterize the DOM at each time step. The approach:

1. **Create a hidden container** (`div`) at the exact export dimensions (e.g., 1920×1080px), positioned offscreen.
2. **For each frame**: set the playback time, let React render the scene, then use the **`html-to-image`** library (`toCanvas()`) to rasterize the container to a canvas.
3. **Feed that canvas** to mediabunny's encoder.

We'll add `html-to-image` as a dependency (lightweight, ~7KB gzipped, no external dependencies).

---

## Files to Create / Modify

### New Files

| File | Purpose |
|------|---------|
| `hooks/useExportMP4.ts` | Core export hook — orchestrates the frame-by-frame encoding pipeline |
| `components/studio/ExportModal.tsx` | Full export modal UI (replace current empty placeholder) |
| `components/ExportRenderer.tsx` | Hidden offscreen renderer that renders animation at export resolution |
| `lib/export-utils.ts` | Helper functions: frame calculation, time-to-scene mapping, download trigger |

### Modified Files

| File | Change |
|------|--------|
| `components/studio/TopBar.tsx` | Wire Export button to open ExportModal |
| `stores/project-store.ts` | Add `isExportModalOpen`, `exportProgress`, `isExporting` state + actions |
| `types/index.ts` | Add `ExportConfig` interface |
| `package.json` | Add `html-to-image` dependency |

---

## Detailed Implementation

### Step 1: Install dependency

```bash
npm install html-to-image
```

### Step 2: Add types (`types/index.ts`)

```ts
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
```

### Step 3: Update store (`stores/project-store.ts`)

Add to the store interface and implementation:
- `isExportModalOpen: boolean`
- `isExporting: boolean`
- `exportProgress: ExportProgress | null`
- `openExportModal()` / `closeExportModal()`
- `setExportProgress(progress)` / `setIsExporting(boolean)`

### Step 4: Create `lib/export-utils.ts`

```ts
// Maps a time (ms) to { sceneIndex, progress } — same logic as usePlayback
export function getSceneAtTime(scenes: Scene[], timeMs: number) → { sceneIndex, progress, elapsed }

// Triggers file download from ArrayBuffer
export function downloadMP4(buffer: ArrayBuffer, filename: string)

// Maps quality string to mediabunny bitrate
export function getQualityBitrate(quality: 'low' | 'medium' | 'high') → number
```

### Step 5: Create `components/ExportRenderer.tsx`

A React component that:
- Renders an absolutely-positioned, offscreen `<div>` at the exact export width×height
- Contains `<AnimationPlayer />` (or the same scene rendering logic) driven by a `time` prop rather than playback state
- Exposes a ref so the parent can read the DOM element for rasterization

```tsx
interface ExportRendererProps {
  width: number
  height: number
  scenes: Scene[]
  currentTime: number  // controlled externally
  animationConfig: AnimationConfig
}

// Renders animation at exact pixel dimensions, positioned offscreen
// Uses the same SceneRenderer + transition logic as AnimationPlayer
// but driven by the currentTime prop instead of playback store
```

### Step 6: Create `hooks/useExportMP4.ts`

The main orchestrator:

```ts
export function useExportMP4() {
  async function exportMP4(config: ExportConfig) {
    const { width, height, fps, quality } = config
    const animationConfig = useProjectStore.getState().animationConfig

    // 1. Calculate total frames
    const totalDuration = animationConfig.totalDuration // in ms
    const totalFrames = Math.ceil((totalDuration / 1000) * fps)

    // 2. Create mediabunny output
    const { Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH, QUALITY_MEDIUM, QUALITY_LOW } = await import('mediabunny')

    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    })

    const canvas = new OffscreenCanvas(width, height)
    const videoSource = new CanvasSource(canvas, {
      codec: 'avc',
      bitrate: getQualityBitrate(quality),
    })
    output.addVideoTrack(videoSource)

    await output.start()

    // 3. Frame-by-frame render loop
    for (let frame = 0; frame < totalFrames; frame++) {
      const timeMs = (frame / fps) * 1000

      // a. Set the ExportRenderer's time
      setCurrentExportTime(timeMs)

      // b. Wait for React to render (requestAnimationFrame)
      await new Promise(r => requestAnimationFrame(r))

      // c. Rasterize the DOM container to a canvas via html-to-image
      const frameCanvas = await toCanvas(exportContainerRef.current, {
        width, height,
        pixelRatio: 1,
        backgroundColor: '#0d1117',
      })

      // d. Draw onto the OffscreenCanvas
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(frameCanvas, 0, 0, width, height)

      // e. Feed to mediabunny encoder
      await videoSource.add(frame / fps, 1 / fps)

      // f. Update progress
      setExportProgress({
        phase: 'rendering',
        currentFrame: frame + 1,
        totalFrames,
        percent: Math.round(((frame + 1) / totalFrames) * 100),
      })
    }

    // 4. Finalize
    await output.finalize()

    // 5. Download
    downloadMP4(output.target.buffer, `${animationConfig.title}.mp4`)
  }

  return { exportMP4, cancelExport }
}
```

### Step 7: Build `components/studio/ExportModal.tsx`

A polished modal with:
- **Header**: "Export Animation" title
- **Preview thumbnail**: Small preview of current animation frame
- **Resolution display**: Shows selected preset (e.g., "1920 × 1080 — Full size") — read-only, driven by the canvas preset selected in PreviewPanel
- **Quality selector**: 3 options (Low / Medium / High) with descriptions
  - Low: "Smaller file, faster export (~2 Mbps)"
  - Medium: "Balanced quality (~5 Mbps)"
  - High: "Best quality, larger file (~10 Mbps)"
- **FPS selector**: 24 / 30 / 60
- **Estimated file size** (rough calculation from bitrate × duration)
- **Export button**: "Export MP4" with download icon
- **Progress bar**: Shows during export with frame count, percentage, estimated time remaining
- **Cancel button**: During export
- **Close/done state**: Shows download link when complete

### Step 8: Wire TopBar Export button

Update `TopBar.tsx`:
- Import `openExportModal` from store
- Wire the Export button's `onClick` to `openExportModal()`
- Disable when no `animationConfig` exists

---

## Export Flow (User Experience)

1. User generates an animation in the Studio
2. User selects canvas size from PreviewPanel dropdown (e.g., "Full size" 1920×1080, or "iPhone 17 Pro" 402×874)
3. User clicks **Export** in TopBar
4. ExportModal opens showing:
   - Resolution: 1920 × 1080 (from selected preset)
   - Quality: Medium (default)
   - FPS: 30 (default)
   - Est. file size: ~12 MB
5. User clicks **Export MP4**
6. Progress bar shows: "Rendering frame 124/600 (21%)"
7. On completion: browser downloads `Product Launch Video.mp4`
8. Modal shows success state with "Done!" checkmark

---

## Technical Considerations

### OffscreenCanvas & html-to-image
- `html-to-image` uses `foreignObject` SVG serialization to rasterize DOM elements
- The hidden export container must be in the actual DOM (not `display: none`) — we position it offscreen with `position: fixed; left: -99999px`
- Each frame render involves: React state update → DOM paint → html-to-image rasterization → canvas draw → mediabunny encode
- We await `requestAnimationFrame` between frames to let React flush

### Performance
- Export will be slower than real-time (expected: ~2-5× slower depending on scene complexity and resolution)
- Progress UI keeps the user informed
- We dynamically import mediabunny to keep it out of the main bundle

### Browser Compatibility
- mediabunny uses WebCodecs API — supported in Chrome 94+, Edge 94+, Safari 16.4+, Firefox 130+
- If WebCodecs is unavailable, show a "Browser not supported" message in the modal

### Memory
- We process one frame at a time and don't accumulate frame buffers
- mediabunny handles its own internal buffering efficiently
- The OffscreenCanvas is reused across all frames

---

## File Count

| Type | Count |
|------|-------|
| New files | 4 |
| Modified files | 4 |
| New dependency | 1 (`html-to-image`) |
| **Total changes** | **8 files** |
