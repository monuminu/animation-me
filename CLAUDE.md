# animation.me — CLAUDE.md

> **Product**: animation.me  
> **Tagline**: Animate everything. Just describe it.  
> **Core Concept**: Text-to-animation engine that generates production-ready, programmatic motion graphics from natural language prompts, uploaded product screenshots/videos, or live product URLs — powered by Claude AI, MCP servers, Playwright capture, and a composable Skills system.

---

## 1. What is animation.me?

animation.me is an AI-native platform that turns plain-language descriptions into smooth, professional animations. Unlike pixel-based AI video tools (Runway, Sora), animation.me generates **structured, code-native animations** using React, Framer Motion, GSAP, CSS keyframes, and Three.js/WebGL — making every output editable, modular, and reproducible.

**Key use cases:**
- Product launch videos & demo reels
- Brand motion identity / logo animations
- Explainer videos & onboarding walkthroughs
- Social media motion content (Stories, Reels, TikToks)
- Presentation slides with live transitions
- Interactive UI micro-animations embedded directly in apps

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         animation.me                             │
│                                                                  │
│   INPUT SOURCES                                                  │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐   │
│  │  Text/Chat  │  │  Upload Files    │  │  Product URL      │   │
│  │  Prompt     │  │  (PNG/MP4/WebM)  │  │  (auto-captured)  │   │
│  └──────┬──────┘  └────────┬─────────┘  └────────┬──────────┘   │
│         └─────────────────▼──────────────────────┘              │
│                    ┌──────▼──────┐                               │
│                    │  Claude AI  │                               │
│                    │ Orchestrator│                               │
│                    └──────┬──────┘                               │
│                           │                                      │
│         ┌─────────────────▼──────────────────────┐              │
│         │              MCP Servers                │              │
│         │  • playwright-server (URL capture)      │              │
│         │  • asset-server (images/uploads)        │              │
│         │  • export-server (MP4/GIF/WebM)         │              │
│         │  • brand-server (tokens)                │              │
│         │  • storage-server (saves)               │              │
│         └────────────────────────────────────────┘              │
│                                                                  │
│         ┌──────────────────────────────────────────────────┐    │
│         │                  Skills Library                  │    │
│         │  • playwright-capture  • motion-style            │    │
│         │  • scene-builder       • typography              │    │
│         │  • color-palette       • transitions             │    │
│         │  • 3d-webgl            • brand-kit               │    │
│         │  • visual-analysis     • export-render           │    │
│         └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Input Sources & Handling

animation.me accepts three types of input, which can be combined freely in a single prompt.

### 3.1 Text Prompt (Primary)
The base input mode. Users describe what they want animated in natural language.
```
"Create a 20-second dark product launch video for my SaaS tool"
```

### 3.2 File Upload — Screenshots & Videos
Users can attach product visuals directly in the chat. Claude receives and analyzes these files to understand the product's UI, color language, and layout before generating animations.

**Supported formats:**
| Type | Formats | Max Size | Notes |
|------|---------|----------|-------|
| Screenshots | PNG, JPG, WebP, AVIF | 20 MB | UI screens, logos, brand assets |
| Screen recordings | MP4, WebM, MOV | 100 MB | Product walkthroughs, demos |
| Design exports | SVG, PDF | 10 MB | Vector assets, wireframes |
| Multiple files | Any combo above | — | Up to 10 files per prompt |

**Claude's behavior on upload:**
1. Read `visual-analysis/SKILL.md` before inspecting any uploaded file
2. Extract dominant colors → seed into brand kit automatically
3. Identify UI components, typography style, layout patterns
4. Use extracted context to design animation scenes that match the product's visual DNA
5. Reference uploaded images directly in animation code as scene assets

**Upload UI component (`UploadZone.tsx`):**
```tsx
// Drag-and-drop + paste support
<UploadZone
  accept="image/*,video/*,.svg,.pdf"
  maxFiles={10}
  maxSizeMB={100}
  onUpload={(files) => attachToPrompt(files)}
  hint="Drop screenshots, recordings, or brand assets"
/>
```

**API handling (`/api/animate/route.ts`):**
```typescript
// Files arrive as multipart form data
const formData = await request.formData();
const files = formData.getAll('files') as File[];
const prompt = formData.get('prompt') as string;

// Convert to Anthropic message content blocks
const contentBlocks: MessageParam['content'] = [
  ...files.map(file => ({
    type: file.type.startsWith('image/') ? 'image' : 'document',
    source: {
      type: 'base64',
      media_type: file.type,
      data: await fileToBase64(file),
    }
  })),
  { type: 'text', text: prompt }
];
```

---

### 3.3 Product URL — Playwright Auto-Capture

When a user provides a URL instead of (or alongside) files, Claude triggers the `playwright-server` MCP to automatically navigate to the URL, capture screenshots and/or screen recordings, and feed those visuals back into the animation pipeline.

**User prompt example:**
```
"Go to https://myproduct.com and create a launch video"
"Capture https://dashboard.myapp.com/features and animate the key screens"
```

**Claude's decision logic:**
```
IF user_input contains URL:
  → CALL playwright-server.detect_url(input)
  → CALL playwright-server.capture_screenshots(url, pages=['/','/#features','/#pricing'])
  → CALL playwright-server.capture_screen_recording(url, interaction_script)
  → Feed captures into visual-analysis pipeline (same as file upload)
  → Proceed with animation generation using captured visuals
```

**Full Playwright capture flow:**

```
URL Input
   │
   ▼
playwright-server.navigate(url)
   │
   ├──▶ capture_full_page_screenshot()   → PNG array
   ├──▶ capture_viewport_screenshot()    → PNG (above-the-fold)
   ├──▶ capture_component_screenshots()  → PNG per section (hero, features, CTA)
   ├──▶ capture_screen_recording()       → WebM (optional, 15s scroll demo)
   └──▶ extract_brand_tokens()           → { colors, fonts, favicon }
         │
         ▼
   asset-server.store_captures()
         │
         ▼
   visual-analysis Skill
         │
         ▼
   Animation generation
```

---

## 4. MCP (Model Context Protocol) Servers

animation.me is MCP-native. Claude uses MCP servers as structured tool interfaces to handle all non-generation tasks.

### 4.1 `playwright-server` ⭐ NEW
Navigates to any product URL and captures screenshots, screen recordings, and brand tokens for use in animation generation.

```json
{
  "name": "animation-playwright-server",
  "tools": [
    "detect_url",                  // Validate and normalize a URL from user input
    "navigate",                    // Open browser and navigate to URL
    "capture_full_page_screenshot",// Full-page PNG scroll capture
    "capture_viewport_screenshot", // Above-the-fold only PNG
    "capture_component_screenshots",// Per-section screenshots (hero, features, CTA, footer)
    "capture_screen_recording",    // 15s WebM scroll/interaction recording
    "extract_brand_tokens",        // Pull colors, fonts, favicon from live page CSS
    "run_interaction_script",      // Click through flows (login, onboarding, etc.)
    "capture_responsive_variants", // Mobile (375px), tablet (768px), desktop (1440px)
    "close_browser"                // Clean up browser session
  ]
}
```

**Playwright server implementation notes:**
- Uses `playwright` with Chromium headless
- Waits for `networkidle` before capturing (ensures assets loaded)
- Automatically dismisses cookie banners, modals, and popups via common CSS selectors
- Captures `prefers-color-scheme: dark` AND `light` variants if applicable
- `extract_brand_tokens` reads computed CSS vars (`--primary`, `--color-*`, `font-family`) plus palette from screenshots via color quantization
- Screen recordings use `page.screencast()` and are exported as WebM → stored to S3

```typescript
// playwright-server/tools/capture.ts
async function captureComponentScreenshots(url: string) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  // Auto-detect sections by landmark roles and common class patterns
  const sections = await page.$$eval(
    'section, [class*="hero"], [class*="feature"], [class*="pricing"], [class*="cta"]',
    els => els.map(el => el.getBoundingClientRect())
  );

  return await Promise.all(
    sections.map(rect => page.screenshot({ clip: rect, type: 'png' }))
  );
}
```

### 4.2 `asset-server`
  "tools": [
    "generate_image",         // Generate AI imagery for a scene
    "search_stock_assets",    // Search free-to-use visuals
    "upload_brand_asset",     // Accept user logo/images
    "get_asset_url"           // Return CDN URL for use in animation code
  ]
}
```

### 4.2 `asset-server`
Provides Claude access to image generation, stock assets, user-uploaded files, and Playwright-captured visuals.

```json
{
  "name": "animation-asset-server",
  "tools": [
    "generate_image",              // Generate AI imagery for a scene
    "search_stock_assets",         // Search free-to-use visuals
    "upload_brand_asset",          // Accept user logo/images (file upload)
    "store_playwright_captures",   // Save Playwright screenshots/recordings to S3
    "get_asset_url"                // Return CDN URL for use in animation code
  ]
}
```

### 4.3 `export-server`
Handles rendering and exporting finished animations.

```json
{
  "name": "animation-export-server",
  "tools": [
    "render_to_mp4",          // Headless Puppeteer/Playwright MP4 export
    "render_to_gif",          // GIF for social sharing
    "render_to_webm",         // Lightweight web embed format
    "get_export_status",      // Poll render job status
    "get_download_url"        // Return signed download URL
  ]
}
```

### 4.4 `brand-server`
Stores and retrieves brand kits (colors, fonts, logos) for consistent outputs. Can be auto-populated from Playwright-extracted tokens.

```json
{
  "name": "animation-brand-server",
  "tools": [
    "save_brand_kit",              // Store brand tokens
    "get_brand_kit",               // Retrieve brand tokens by team/user
    "apply_brand_to_scene",        // Auto-inject brand tokens into animation code
    "save_from_playwright_tokens"  // Seed brand kit from Playwright CSS extraction
  ]
}
```

### 4.5 `storage-server`
Manages project saves, history, and versioning.

```json
{
  "name": "animation-storage-server",
  "tools": [
    "save_project",
    "load_project",
    "list_projects",
    "fork_project",
    "delete_project"
  ]
}
```

### 4.6 MCP Configuration (`.mcp.json`)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["./mcp-servers/playwright-server/index.js"],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium",
        "CAPTURE_TIMEOUT_MS": "30000",
        "S3_BUCKET": "${S3_BUCKET}"
      }
    },
    "asset": {
      "command": "node",
      "args": ["./mcp-servers/asset-server/index.js"],
      "env": { "REPLICATE_API_KEY": "${REPLICATE_API_KEY}" }
    },
    "export": {
      "command": "node",
      "args": ["./mcp-servers/export-server/index.js"],
      "env": { "RENDER_WORKERS": "4" }
    },
    "brand": {
      "command": "node",
      "args": ["./mcp-servers/brand-server/index.js"],
      "env": { "DATABASE_URL": "${DATABASE_URL}" }
    },
    "storage": {
      "command": "node",
      "args": ["./mcp-servers/storage-server/index.js"],
      "env": { "S3_BUCKET": "${S3_BUCKET}" }
    }
  }
}
```

---

## 5. Skills System

Skills are modular prompt-instruction packs that teach Claude how to generate specific types of animation code with best practices. Each Skill is a folder with a `SKILL.md` and optional template files.

### 5.1 Skills Directory Structure

```
/skills/
├── playwright-capture/
│   └── SKILL.md         # How to use playwright-server to capture URLs
├── visual-analysis/
│   └── SKILL.md         # How to analyze screenshots/videos and extract design context
├── motion-style/
│   └── SKILL.md         # Easing curves, spring physics, timing best practices
├── scene-builder/
│   └── SKILL.md         # Multi-scene sequencing, scene transitions
├── typography/
│   └── SKILL.md         # Animated text: reveal, glitch, typewriter, gradient
├── color-palette/
│   └── SKILL.md         # Dark-mode palettes, gradient combos, brand-safe colors
├── transitions/
│   └── SKILL.md         # Fade, slide, morph, liquid, wipe, parallax
├── 3d-webgl/
│   └── SKILL.md         # Three.js scenes, WebGL shaders, 3D text
├── brand-kit/
│   └── SKILL.md         # How to inject brand tokens into animation code
└── export-render/
    └── SKILL.md         # How to structure code for headless rendering
```

### 5.2 New Skill: `playwright-capture/SKILL.md`

```markdown
# Skill: Playwright Capture

Use this skill FIRST whenever the user provides a URL in their prompt.

## Trigger Condition
If user input contains any of: http://, https://, www., or a recognizable domain pattern
→ IMMEDIATELY call playwright-server.detect_url() before doing anything else

## Standard Capture Sequence
Always run in this order:
1. playwright-server.navigate(url)
2. playwright-server.capture_viewport_screenshot()     ← hero/above-fold
3. playwright-server.capture_component_screenshots()   ← per-section
4. playwright-server.extract_brand_tokens()            ← colors, fonts
5. playwright-server.capture_screen_recording()        ← only if user says "demo" or "walkthrough"
6. playwright-server.capture_responsive_variants()     ← only if user says "mobile" or "responsive"
7. playwright-server.close_browser()

## Error Handling
- If URL requires auth → inform user, ask for screenshot upload instead
- If page load times out (>30s) → retry once, then ask for manual upload
- If URL is localhost/internal → inform user it's not reachable, request file upload

## What to Do With Captures
- Pass all PNGs to visual-analysis Skill
- Save to asset-server via store_playwright_captures()
- Auto-seed brand-server with extracted_tokens via save_from_playwright_tokens()
- Use captured images as scene assets in animation code (reference S3 URLs)

## Never Do
- Never navigate to URLs not provided by the user
- Never interact with forms, sign-up flows, or payment pages
- Never store credentials or session data
```

### 5.3 New Skill: `visual-analysis/SKILL.md`

```markdown
# Skill: Visual Analysis

Use this skill whenever Claude receives uploaded screenshots, videos, or
Playwright-captured images. Always read this BEFORE writing any animation code
when visual inputs are present.

## What to Extract from Screenshots
Analyze every provided image and extract:

### Color DNA
- Primary background color (usually dominant)
- Accent/brand color (buttons, highlights, CTAs)
- Text colors (heading, body, muted)
- Gradient directions and stop colors if present
→ Output as: { bg, accent, heading, body, gradient }

### Typography Style
- Heading font family (serif / sans-serif / monospace / display)
- Font weight used for headings (light/regular/bold/black)
- Body font if different
- Letter-spacing style (tight/normal/loose)
→ Output as: { headingFont, headingWeight, bodyFont, letterSpacing }

### Layout Language
- Card-based vs full-bleed vs editorial
- Spacing density (compact / comfortable / spacious)
- Border radius style (sharp / rounded / pill)
- Shadow usage (none / subtle / elevated)

### UI Components Spotted
- Navigation bar style
- Hero section structure (text-left, centered, split)
- Feature sections (grid / alternating / timeline)
- CTA placement and style

### Tone & Personality
From the overall visual impression, rate on:
- Minimal ↔ Rich
- Corporate ↔ Playful
- Dark ↔ Light
- Static ↔ Dynamic

## What to Extract from Videos
- Scroll speed and transitions already present
- Interactive elements (hover states, animations)
- Key "wow moments" worth highlighting in the animation

## Output Format
After analysis, produce a concise `VisualContext` object:
```json
{
  "colors": { "bg": "#0d1117", "accent": "#7c3aed", "heading": "#fff", "body": "#94a3b8" },
  "typography": { "headingFont": "Inter", "headingWeight": 700, "letterSpacing": "-0.02em" },
  "layout": { "style": "card-based", "borderRadius": "rounded", "density": "comfortable" },
  "tone": { "minimal": 0.8, "corporate": 0.3, "dark": 0.9, "dynamic": 0.6 },
  "keyScreens": ["hero", "features-grid", "pricing", "cta"]
}
```
This VisualContext MUST be used when selecting motion-style, color-palette, and scene-builder parameters.
```

### 5.4 Example: `motion-style/SKILL.md`

```markdown
# Skill: Motion Style

Use this skill whenever generating animation timing, easing, or spring configurations.

## Easing Guidelines
- Entrances: Use `ease-out` or `spring(1, 80, 10)` — things slow down as they arrive
- Exits: Use `ease-in` — things accelerate as they leave
- UI micro-interactions: `spring(1, 200, 20)` for snappy, physical feel
- Cinematic: `cubic-bezier(0.16, 1, 0.3, 1)` for dramatic reveals

## Duration Guidelines
- Micro (hover, tap): 80–150ms
- UI transitions: 200–400ms
- Scene changes: 500–800ms
- Hero/cinematic reveals: 800–1200ms

## Stagger Patterns
- List reveals: stagger children by 50–80ms
- Grid reveals: stagger by 30–50ms with radial or diagonal direction

## Libraries to Use
- CSS keyframes: for simple, performant, no-dependency animations
- Framer Motion: for React component animations with gesture support
- GSAP: for timeline-based, complex sequences
- Three.js: for 3D, particle systems, WebGL shaders
```

### 5.5 Example: `scene-builder/SKILL.md`

```markdown
# Skill: Scene Builder

Use this skill when generating multi-scene animations or video-style sequences.

## Scene Structure (React)
Every animation is composed as an ordered array of `<Scene>` components.

```jsx
const scenes = [
  { id: 'intro',    duration: 3000, component: IntroScene },
  { id: 'feature1', duration: 4000, component: Feature1Scene },
  { id: 'cta',      duration: 2000, component: CTAScene },
]
```

## Scene Transition Pattern
Use an `<AnimationPlayer>` wrapper that auto-advances scenes and applies
the chosen transition style between them.

## Required Scene Props
- `isActive: boolean` — whether the scene is currently playing
- `onComplete: () => void` — fires when scene duration elapses
- `brandKit?: BrandKit` — optional brand token injection

## Background Patterns
Prefer dark themes (#0d1117 to #1a1f2e) with subtle radial gradients or
mesh gradients using the brand's accent color at 15–25% opacity.
```

---

## 6. Claude's Role & Behavior

Claude is the core intelligence of animation.me. It:

1. **Detects input type** — text prompt, uploaded files, URL, or a combination
2. **Captures visuals if URL** — triggers playwright-server before doing anything else
3. **Analyzes visuals** — reads `visual-analysis/SKILL.md` when images/videos are present
4. **Selects relevant Skills** — always reads appropriate SKILL.md files before writing any code
5. **Calls MCP tools** as needed — fetches/stores assets, applies brand kits, queues exports
6. **Generates animation code** — React + chosen animation library, clean and modular
7. **Iterates conversationally** — user can say "make it faster", "change to blue", "add a logo"

### Claude's Workflow Per Request

```
INPUT RECEIVED
│
├── URL detected?
│     └── YES → READ playwright-capture/SKILL.md
│               → CALL playwright-server (full capture sequence)
│               → CALL brand-server.save_from_playwright_tokens()
│               → CALL asset-server.store_playwright_captures()
│               └── Continue ↓
│
├── Files uploaded?
│     └── YES → READ visual-analysis/SKILL.md
│               → Analyze all images/videos → produce VisualContext
│               → CALL asset-server.upload_brand_asset() for each file
│               └── Continue ↓
│
├── Brand kit exists?
│     └── YES → CALL brand-server.get_brand_kit()
│               └── Continue ↓
│
├── READ relevant Skills:
│     scene-builder, motion-style, typography, color-palette,
│     transitions (based on prompt intent)
│
├── GENERATE animation code (informed by VisualContext + brand kit)
│
├── PRESENT live preview in studio
│
├── OFFER quick actions: [ Iterate ] [ Export MP4 ] [ Save project ]
│
└── CALL storage-server.save_project()
```

### Claude's System Prompt (core excerpt)

```
You are the animation engine for animation.me. Your job is to convert 
natural language, uploaded product visuals, and live product URLs into
beautiful, production-ready animation code.

Rules:
- If the user provides a URL → ALWAYS run playwright-capture FIRST
- If the user uploads images/video → ALWAYS run visual-analysis FIRST
- Always read the relevant SKILL.md files before writing animation code
- Use extracted VisualContext to match the product's color/typography/tone
- Generate React components using Framer Motion or GSAP depending on complexity
- Default to dark themes unless visual analysis shows the product is light-themed
- Animations should feel cinematic: smooth, intentional, never jarring
- Always structure output for headless MP4 rendering compatibility
- When a brand kit is available, apply it automatically
- After generating, always offer: iterate / export / save
```

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Animation Runtime | Framer Motion, GSAP, Three.js, CSS |
| AI Orchestration | Claude claude-sonnet-4-6 via Anthropic SDK |
| MCP Protocol | `@anthropic-ai/mcp` + custom servers |
| URL Capture | **Playwright (Chromium headless)** |
| Export/Render | Puppeteer (headless Chromium) → FFmpeg |
| Asset Generation | Replicate (FLUX / SDXL) |
| Storage | Supabase (projects) + S3 (assets/exports/captures) |
| Auth | Clerk or NextAuth |
| Deployment | Vercel (frontend) + Railway (MCP servers + render workers) |

---

## 8. Project Structure

```
animation.me/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing / prompt input
│   ├── studio/                 # Animation studio UI
│   │   ├── page.tsx
│   │   └── [projectId]/page.tsx
│   └── api/
│       ├── animate/route.ts    # Main Claude orchestration endpoint
│       ├── upload/route.ts     # File upload handler (multipart)
│       └── export/route.ts     # Export trigger endpoint
│
├── components/
│   ├── AnimationPlayer.tsx     # Scene runner with auto-advance
│   ├── SceneRenderer.tsx       # Renders individual scenes
│   ├── PromptBar.tsx           # Chat-style input with URL detection
│   ├── UploadZone.tsx          # Drag-and-drop file upload (PNG/MP4/SVG)
│   └── ExportPanel.tsx         # Export controls
│
├── mcp-servers/
│   ├── playwright-server/      # ⭐ URL capture (Chromium headless)
│   │   ├── index.js
│   │   ├── tools/
│   │   │   ├── navigate.ts
│   │   │   ├── capture.ts      # Screenshots & recordings
│   │   │   ├── brand-extract.ts# CSS token extraction
│   │   │   └── interaction.ts  # Scripted click flows
│   │   └── package.json
│   ├── asset-server/
│   ├── export-server/
│   ├── brand-server/
│   └── storage-server/
│
├── skills/
│   ├── playwright-capture/SKILL.md   # ⭐ URL capture instructions
│   ├── visual-analysis/SKILL.md      # ⭐ Screenshot/video analysis
│   ├── motion-style/SKILL.md
│   ├── scene-builder/SKILL.md
│   ├── typography/SKILL.md
│   ├── color-palette/SKILL.md
│   ├── transitions/SKILL.md
│   ├── 3d-webgl/SKILL.md
│   ├── brand-kit/SKILL.md
│   └── export-render/SKILL.md
│
├── lib/
│   ├── claude.ts               # Anthropic SDK client
│   ├── mcp.ts                  # MCP server connectors
│   ├── skills.ts               # Skill loader utility
│   ├── upload.ts               # File → base64 + S3 helpers
│   └── url-detector.ts         # Regex URL detection from prompt text
│
├── .mcp.json                   # MCP server definitions
├── CLAUDE.md                   # ← You are here
└── .env.local
```

---

## 9. Environment Variables

```env
# Anthropic
ANTHROPIC_API_KEY=

# Asset Generation
REPLICATE_API_KEY=

# Storage
DATABASE_URL=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Playwright (URL Capture)
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT_MS=30000

# Render Workers
RENDER_WORKERS=4
PUPPETEER_EXECUTABLE_PATH=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## 10. Getting Started (Dev)

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Start all MCP servers
npm run mcp:dev

# Start Next.js dev server
npm run dev

# Run export worker
npm run worker:export
```

---

## 11. Example Prompts & Expected Behavior

| Prompt | Input Type | Skills Used | MCP Calls |
|--------|-----------|------------|-----------|
| "Create a 20-second dark product launch video for animation.me" | Text | scene-builder, typography, motion-style, color-palette | asset-server, export-server |
| "Make a launch video" + [attaches 3 screenshots] | Files | visual-analysis, scene-builder, typography, motion-style | asset-server (upload), brand-server (seed) |
| "Go to https://myproduct.com and create a launch video" | URL | playwright-capture, visual-analysis, scene-builder | playwright-server, brand-server, asset-server |
| "Animate https://stripe.com/payments — focus on the hero and features" | URL | playwright-capture, visual-analysis, transitions | playwright-server (component capture) |
| [uploads screen recording MP4] "Turn this into an animated promo" | Video | visual-analysis, scene-builder, motion-style | asset-server (store), export-server |
| "Create a 3D rotating product showcase" + URL | URL + Text | playwright-capture, 3d-webgl, motion-style | playwright-server, asset-server |
| "Export the current animation as 1080p MP4" | Text | export-render | export-server (render_to_mp4) |

---

## 12. Design Principles

- **Three ways to input, one pipeline out**: Text, file uploads, and URLs all flow into the same VisualContext → animation generation pipeline.
- **URL = automatic brand extraction**: Pasting a URL should feel magical — Playwright captures the product, extracts its colors and fonts, and the animation already looks on-brand.
- **Visual-analysis before generation**: Claude MUST analyze any uploaded or captured visual before writing a single line of animation code.
- **Programmatic > Pixel**: Animations are code, not video files. They're editable, versioned, and reproducible.
- **Skills-first**: Claude must always consult the relevant Skill before generating — no winging it.
- **MCP for everything external**: No direct API calls in generation logic; all side effects go through MCP servers.
- **Dark by default, brand-matched in reality**: Default to `#0d1117` base, but override immediately if visual analysis reveals a light-themed product.
- **Conversational iteration**: Every output ends with 3 quick-action suggestions (change speed / change color / export).
- **Brand-aware**: If a brand kit exists or can be extracted, always apply it. Never generate generic output when brand context is available.

---

*animation.me — Animate everything. Just describe it.*