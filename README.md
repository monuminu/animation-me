<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-purple?style=flat-square" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Claude_AI-Sonnet_4-orange?style=flat-square" alt="Claude AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<h1 align="center">animation.me</h1>
<p align="center"><strong>Animate everything. Just describe it.</strong></p>
<p align="center">
  A text-to-animation engine that generates production-ready, programmatic motion graphics<br/>from natural language prompts — powered by Claude AI and Framer Motion.
</p>

---

## What is animation.me?

animation.me turns plain-language descriptions into smooth, professional animations. Unlike pixel-based AI video tools (Runway, Sora), animation.me generates **structured, code-native animations** using React and Framer Motion — making every output editable, modular, and reproducible.

**Type a prompt. Get a multi-scene animation. Iterate conversationally.**

### Use Cases

- Product launch videos & demo reels
- Brand motion identity & logo animations
- Explainer videos & onboarding walkthroughs
- Social media motion content (Stories, Reels, TikToks)
- Presentation slides with live transitions
- Interactive UI micro-animations

---

## Quick Start

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/animation-me.git
cd animation-me

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start creating.

---

## How It Works

```
 Prompt / Text Input
        │
        ▼
 ┌──────────────┐
 │   Claude AI   │  ← System prompt + Skills (scene-builder, motion-style, etc.)
 │  Orchestrator  │
 └──────┬───────┘
        │
        ▼
 Animation Config (JSON)
  {
    title, totalDuration,
    scenes: [{ template, duration, data }]
  }
        │
        ▼
 ┌──────────────────┐
 │  Scene Registry   │  ← Maps template names → React components
 │  (15 templates)   │
 └──────┬───────────┘
        │
        ▼
 ┌──────────────────┐
 │ Animation Player  │  ← requestAnimationFrame playback at 60fps
 │ + Scene Renderer  │
 └──────────────────┘
        │
        ▼
 Live Preview in Studio (16:9 canvas)
```

1. **User types a prompt** in the chat panel or landing page
2. **Claude AI generates** a structured animation config (JSON) using the system prompt + loaded skills
3. **The frontend parses** the streamed response and extracts the config
4. **Scene templates** render each scene using Framer Motion, driven by a `progress` value (0→1)
5. **The playback engine** (`requestAnimationFrame`) advances time and cross-fades between scenes
6. **User iterates** — "make the intro faster", "change colors to blue", "add a stats section"

---

## Studio Interface

The studio is a 3-panel layout with a professional, dark-themed design:

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar: [animation.me] [scene count] [Preview] [Export]    │
├──────────────┬──────────────────────────┬───────────────────┤
│  Chat Panel  │     Preview Panel        │  File Tree Panel  │
│  (~320px)    │     (flex-1)             │  (~280px)         │
│              │                          │                   │
│  Messages    │  ┌────────────────────┐  │  animation.json   │
│  + prompt    │  │  Animation Canvas  │  │  scenes/          │
│  input       │  │  (16:9, dark bg)   │  │    HeroScene.tsx  │
│              │  └────────────────────┘  │    ...             │
│              │  [◀ ▶ ━━━●━━━ 0:12]     │  [Code viewer]    │
├──────────────┴──────────────────────────┴───────────────────┤
│  BottomBar: [Quick Edit] [iteration input...] [Send]        │
└─────────────────────────────────────────────────────────────┘
```

- **Chat Panel** — Conversational interface with streaming responses and AI thinking indicator
- **Preview Panel** — 16:9 canvas with play/pause, scrubber, timestamp, and speed control (0.5x–2x)
- **File Tree Panel** — Generated scene files with syntax-highlighted code viewer
- **Resizable panels** — Drag the dividers to resize (min/max constraints)

---

## Scene Templates

15 production-ready, progress-driven animation templates:

| Template | Description | Key Data Props |
|----------|-------------|---------------|
| `TextRevealScene` | Word-by-word, typewriter, or fade-up text | `headline`, `subtitle`, `style` |
| `HeroScene` | Headline + subheadline + CTA with cinematic entrance | `headline`, `subheadline`, `cta` |
| `FeatureGridScene` | Staggered grid of feature cards | `features[]` with `title`, `description`, `icon` |
| `CTAScene` | Gradient text call-to-action with pulsing button | `headline`, `buttonText`, gradient colors |
| `LogoRevealScene` | Logo scale-in with brand name type-out | `brandName`, `tagline`, `logoUrl` |
| `SplitScreenScene` | Left text / right visual split layout | `headline`, `description`, `imageUrl` |
| `StatsScene` | Animated number counters | `stats[]` with `value`, `label`, `suffix` |
| `TestimonialScene` | Quote with author attribution | `quote`, `author`, `role`, `company` |
| `TimelineScene` | Vertical timeline with milestones | `milestones[]` with `year`, `title` |
| `ScreenshotShowcaseScene` | Product screenshot in browser/phone mockup | `imageUrl`, `mockupType` |
| `ComparisonScene` | Before/after side-by-side comparison | `before`, `after` with `items[]` |
| `CodeBlockScene` | Animated code typing with syntax colors | `code`, `language` |
| `GradientBackgroundScene` | Aurora/mesh gradient with overlaid text | `gradientColors[]`, `headline` |
| `LogoGridScene` | Grid of logos animating in with stagger | `logos[]` with `name`, `logoUrl` |
| `PricingTableScene` | Pricing cards with highlighted plan | `plans[]` with `price`, `features[]` |

Every template:
- Uses `progress` (0→1) to drive all animations — no timers or useEffect triggers
- Defaults to dark backgrounds (`#0d1117`) with customizable `colors` prop
- Is fully self-contained and renders inside the 16:9 canvas

---

## Skills System

Skills are modular instruction files that teach Claude how to generate high-quality animations. They're loaded into the system prompt automatically.

| Skill | File | Purpose |
|-------|------|---------|
| **Scene Builder** | `skills/scene-builder/SKILL.md` | Multi-scene structure, pacing, duration, ordering patterns |
| **Motion Style** | `skills/motion-style/SKILL.md` | Easing curves, spring configs, stagger timing |
| **Typography** | `skills/typography/SKILL.md` | Text animation patterns, font pairing, sizing |
| **Color Palette** | `skills/color-palette/SKILL.md` | Dark mode palettes, accent colors, gradients |
| **Transitions** | `skills/transitions/SKILL.md` | Scene-to-scene transitions (fade, slide, wipe, morph) |
| **Visual Analysis** | `skills/visual-analysis/SKILL.md` | Screenshot/video analysis, VisualContext extraction |

---

## Project Structure

```
animation-me/
├── app/
│   ├── layout.tsx                  # Root layout with Inter font, dark theme
│   ├── page.tsx                    # Landing page
│   ├── studio/
│   │   ├── page.tsx                # Redirect to /studio/[id]
│   │   └── [projectId]/page.tsx    # Studio workspace
│   └── api/
│       └── animate/route.ts        # SSE streaming endpoint → Claude AI
│
├── components/
│   ├── AnimationPlayer.tsx         # Scene orchestrator, manages playback
│   ├── SceneRenderer.tsx           # Renders scene via template registry
│   ├── studio/
│   │   ├── StudioLayout.tsx        # 3-panel CSS Grid layout
│   │   ├── TopBar.tsx              # Logo, status, export button
│   │   ├── ChatPanel.tsx           # Messages + prompt textarea
│   │   ├── ChatMessage.tsx         # User/assistant message bubbles
│   │   ├── PreviewPanel.tsx        # 16:9 canvas + playback
│   │   ├── PlaybackControls.tsx    # Play, pause, scrubber, speed
│   │   ├── FileTreePanel.tsx       # File tree + code viewer
│   │   ├── CodeViewer.tsx          # Syntax-highlighted code display
│   │   └── BottomBar.tsx           # Quick iteration input
│   ├── landing/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx                # Headline + prompt input + examples
│   │   ├── DemoAnimation.tsx       # Auto-cycling demo player
│   │   ├── FeaturesGrid.tsx        # 3 feature cards
│   │   └── Footer.tsx
│   └── ui/                         # Primitives (Button, Input, ScrollArea, Tooltip)
│
├── lib/
│   ├── claude.ts                   # Anthropic SDK, system prompt, streaming
│   ├── scene-registry.ts           # Template name → component mapping
│   ├── scene-templates/            # 15 Framer Motion scene components
│   ├── skills.ts                   # SKILL.md file loader
│   ├── parse-animation-response.ts # Extract JSON config from Claude response
│   ├── url-detector.ts             # URL regex detection
│   └── utils.ts                    # cn(), formatTime(), generateId()
│
├── hooks/
│   ├── useAnimate.ts               # Prompt → API → parse → state updates
│   ├── usePlayback.ts              # requestAnimationFrame playback engine
│   └── useResizePanel.ts           # Drag-to-resize panel widths
│
├── stores/
│   └── project-store.ts            # Zustand store (project, chat, playback, UI)
│
├── types/
│   └── index.ts                    # TypeScript interfaces
│
├── skills/                         # 6 SKILL.md instruction files
│   ├── scene-builder/SKILL.md
│   ├── motion-style/SKILL.md
│   ├── typography/SKILL.md
│   ├── color-palette/SKILL.md
│   ├── transitions/SKILL.md
│   └── visual-analysis/SKILL.md
│
├── tailwind.config.ts              # Custom dark theme, animation keyframes
├── tsconfig.json
├── package.json
└── .env.example
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| Animations | Framer Motion 11 |
| AI | Claude claude-sonnet-4-6 via Anthropic SDK |
| State | Zustand 5 |
| Icons | Lucide React |
| UI Primitives | Radix UI (Dialog, Tabs, Tooltip, ScrollArea) |
| Streaming | Native ReadableStream + Server-Sent Events |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | **Yes** | Your Anthropic API key for Claude |
| `REPLICATE_API_KEY` | No | For AI image generation (future) |
| `DATABASE_URL` | No | Supabase/Postgres URL (future) |
| `S3_BUCKET` | No | Asset storage bucket (future) |
| `S3_ACCESS_KEY` | No | S3 access key (future) |
| `S3_SECRET_KEY` | No | S3 secret key (future) |
| `NEXTAUTH_SECRET` | No | Auth secret (future) |
| `NEXTAUTH_URL` | No | Auth callback URL (future) |

> For MVP, only `ANTHROPIC_API_KEY` is required.

---

## Example Prompts

Try these to get started:

| Prompt | Expected Output |
|--------|----------------|
| "Create a 20-second dark product launch video for a deployment platform" | 5-scene animation: logo → hero → features → stats → CTA |
| "Make a logo animation for a company called Nexus" | 3-scene: gradient bg → logo reveal with type-out → tagline |
| "Build a SaaS demo reel showing pricing plans and key features" | 6-scene: text intro → feature grid → screenshot → comparison → pricing → CTA |
| "Create a quick 10-second social media promo" | 3-scene: bold text → stats → gradient CTA |
| "Animate a before and after comparison for a code editor" | 4-scene: intro → code block → comparison → CTA |

After generating, iterate with follow-ups:
- *"Make the intro faster"*
- *"Change the accent color to blue"*
- *"Add a testimonial scene before the CTA"*
- *"Remove the stats section"*

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Animation rendering | Pre-built parametric templates | Reliable quality, no in-browser compilation |
| State management | Zustand | Lightweight, zero boilerplate |
| Claude output | Structured JSON scene configs | Parseable, maps to templates predictably |
| Streaming | Native ReadableStream + SSE | Simple, works with Vercel edge |
| Playback | `requestAnimationFrame` + React state | Smooth 60fps, no external deps |
| Panel resizing | Mouse event handlers | No library needed, minimal code |
| Code viewer | Simple regex syntax highlighting | Avoids Monaco's 3MB bundle |

---

## Roadmap

- [ ] **File upload** — Drag-and-drop screenshots/videos for visual context
- [ ] **URL capture** — Playwright auto-capture from product URLs
- [ ] **Export** — MP4, GIF, WebM rendering via headless browser
- [ ] **Brand kits** — Save and reuse color/font/logo presets
- [ ] **Project persistence** — Save/load projects with Supabase
- [ ] **Auth** — User accounts with NextAuth
- [ ] **3D scenes** — Three.js/WebGL templates
- [ ] **Collaborative editing** — Real-time multiplayer studio
- [ ] **Template marketplace** — Community-created scene templates

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding a New Scene Template

1. Create a new file in `lib/scene-templates/YourScene.tsx`
2. Export a component matching the `SceneProps` interface
3. Drive all animations with the `progress` prop (0→1)
4. Register it in `lib/scene-registry.ts`
5. Add the data schema to the system prompt in `lib/claude.ts`

---

## License

MIT

---

<p align="center">
  <strong>animation.me</strong> — Animate everything. Just describe it.
</p>
