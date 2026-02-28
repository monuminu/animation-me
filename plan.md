╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 animation.me — Full MVP Implementation Plan                                                                                                                                                                    
                                                        
 Context

 animation.me is a text-to-animation engine that generates production-ready, programmatic motion graphics from natural language prompts. The project is 100% greenfield — only CLAUDE.md (the spec) and
 product.png (reference screenshot) exist. No code, no dependencies, no config files.

 The goal is to build a Full MVP (Phases 1-5) that delivers a working product: type a prompt → Claude generates animation configs → see live animated preview in a professional 3-panel studio interface.

 Key decisions:
 - Build the Studio (3-panel builder) first, landing page second
 - Use template-based engine — Claude outputs JSON scene configs mapping to ~15 pre-built Framer Motion templates
 - Create spec files in _specs/ folder, then implement one spec at a time

 ---
 Implementation Phases

 Phase 1: Foundation — Project Setup

 Spec file: _specs/01-foundation.md

 What: Initialize Next.js 14 project with all dependencies, configs, types, Zustand store, and UI primitives.

 Files to create:
 - package.json — via npx create-next-app@14
 - tailwind.config.ts — custom dark theme colors (bg: #0a0a0b, accent: #7c3aed), fonts (Inter), animation keyframes
 - app/layout.tsx — dark theme root layout with Inter font via next/font/google
 - app/globals.css — dark scrollbar styling, selection color, CSS reset additions
 - .env.local — ANTHROPIC_API_KEY only for MVP
 - .env.example — all vars from CLAUDE.md section 9 (commented)
 - types/index.ts — Scene, Project, ChatMessage, BrandKit, VisualContext, FileAttachment interfaces
 - stores/project-store.ts — Zustand store for project state, chat messages, scenes, playback, UI state
 - lib/utils.ts — cn() helper using clsx + tailwind-merge
 - components/ui/button.tsx — button with variants (primary/secondary/ghost), sizes, loading
 - components/ui/input.tsx — styled text input
 - components/ui/scroll-area.tsx — Radix scroll area wrapper
 - components/ui/tooltip.tsx — Radix tooltip wrapper
 - Directory skeleton: app/studio/[projectId]/, app/api/animate/, components/studio/, skills/, lib/, hooks/

 Dependencies:
 framer-motion gsap three @react-three/fiber @react-three/drei
 @anthropic-ai/sdk
 lucide-react clsx tailwind-merge
 zustand nanoid react-dropzone
 @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-tooltip
 @radix-ui/react-scroll-area @radix-ui/react-separator

 Exit criteria: npm run dev works, dark page renders at localhost:3000

 ---
 Phase 2: Studio Core — 3-Panel Layout

 Spec file: _specs/02-studio-layout.md

 What: Build the 3-panel studio matching the reference screenshot (product.png).

 Layout:
 ┌─────────────────────────────────────────────────────────────┐
 │  TopBar: [animation.me] [progress] [Preview] [Export]       │
 ├──────────────┬──────────────────────────┬───────────────────┤
 │  ChatPanel   │     PreviewPanel         │  FileTreePanel    │
 │  (~300px)    │     (flex-1)             │  (~280px)         │
 │              │                          │                   │
 │  Messages    │  ┌────────────────────┐  │  📁 src/          │
 │  + prompt    │  │  Animation Canvas  │  │    components/    │
 │  input       │  │  (16:9, #0d1117)   │  │    scenes/        │
 │              │  └────────────────────┘  │                   │
 │              │  [◀ ▶ ━━━●━━━ 0:12]     │  [Code viewer]    │
 ├──────────────┴──────────────────────────┴───────────────────┤
 │  BottomBar: [⚡Build] [quick iteration input...] [Send]     │
 └─────────────────────────────────────────────────────────────┘

 Files to create:
 - app/studio/[projectId]/page.tsx — studio page, orchestrates layout
 - app/studio/page.tsx — redirect to /studio/new
 - components/studio/StudioLayout.tsx — CSS Grid 3-panel layout with drag-to-resize handles
 - components/studio/TopBar.tsx — logo, progress indicator, tabs, export button
 - components/studio/BottomBar.tsx — build button + quick iteration input
 - components/studio/ChatPanel.tsx — scrollable message area + prompt textarea + attach button
 - components/studio/ChatMessage.tsx — user/assistant message bubbles with markdown rendering
 - components/studio/PreviewPanel.tsx — 16:9 canvas container with empty state
 - components/studio/PlaybackControls.tsx — play/pause, scrubber, timestamp, speed control
 - components/studio/FileTreePanel.tsx — folder/file tree + code viewer
 - components/studio/FileTreeItem.tsx — individual tree node with expand/collapse
 - components/studio/CodeViewer.tsx — read-only syntax-highlighted code display
 - hooks/useResizePanel.ts — drag-to-resize panel widths (min-width constraints)

 Key details:
 - Panels resize via drag handles (4px wide dividers with cursor: col-resize)
 - Chat panel: auto-scroll to bottom, "AI is thinking..." animated dots, URL detection highlighting
 - Preview: centered 16:9 aspect ratio box, dark bg, empty state with "Your animation will appear here"
 - File tree: virtual files representing generated scenes, click to select + view code
 - Playback: requestAnimationFrame timer in usePlayback.ts hook

 Exit criteria: /studio/new renders the 3-panel layout, panels resize, chat input works, empty state shows in preview

 ---
 Phase 3: Animation Engine — Core Loop

 Spec file: _specs/03-animation-engine.md

 What: Wire Claude AI to generate animation configs, parse responses, render scenes via templates, enable full prompt → preview → iterate loop.

 Files to create:

 API & lib:
 - app/api/animate/route.ts — POST endpoint: receives prompt + messages, calls Claude with streaming, returns SSE
 - lib/claude.ts — Anthropic SDK client, system prompt builder, content block builder
 - lib/skills.ts — loads SKILL.md files from /skills/ directory
 - lib/url-detector.ts — regex URL detection from prompt text
 - lib/parse-animation-response.ts — parses Claude's streamed response into description + config + scenes

 Scene templates (initial 5):
 - lib/scene-templates/TextRevealScene.tsx — word-by-word, typewriter, fade-up text reveals
 - lib/scene-templates/HeroScene.tsx — headline + subheadline + CTA with cinematic entrance
 - lib/scene-templates/FeatureGridScene.tsx — staggered grid of feature cards
 - lib/scene-templates/CTAScene.tsx — call-to-action ending with gradient text
 - lib/scene-templates/LogoRevealScene.tsx — logo/brand animation with scale + type-out

 Core components:
 - lib/scene-registry.ts — maps template names → React components
 - components/AnimationPlayer.tsx — scene orchestrator, manages playback timing, renders active scene
 - components/SceneRenderer.tsx — renders individual scene via template lookup

 Hooks:
 - hooks/useAnimate.ts — handles prompt submission, streaming, response parsing, state updates
 - hooks/usePlayback.ts — requestAnimationFrame timer, scene advancement, time tracking

 Claude output format:
 {
   "title": "Product Launch Video",
   "totalDuration": 20000,
   "scenes": [
     {
       "id": "intro",
       "template": "TextRevealScene",
       "duration": 4000,
       "data": {
         "headline": "Ship with confidence",
         "style": "word-by-word",
         "colors": { "bg": "#0d1117", "text": "#ffffff", "accent": "#7c3aed" }
       }
     }
   ]
 }

 System prompt (in lib/claude.ts):
 - Instructs Claude to output: brief description + animation-config JSON block
 - Lists all available templates with their data schemas
 - Includes loaded skill context for quality rules
 - Enforces dark themes, cinematic motion, Framer Motion best practices

 Scene template interface — every template receives:
 interface SceneProps {
   isActive: boolean;      // true when this scene should animate
   progress: number;       // 0 to 1 through scene duration
   onComplete: () => void;
 }
 // Plus template-specific `data` prop

 End-to-end flow:
 1. User types prompt in ChatPanel → useAnimate().generate(prompt)
 2. POST /api/animate with prompt + message history
 3. Claude streams response with description + animation-config JSON
 4. Frontend parses response → updates chat message + sets scenes in store
 5. AnimationPlayer renders scenes using template registry
 6. PlaybackControls drive currentTime → determines active scene + progress
 7. User can iterate with follow-up prompts

 Exit criteria: Type a prompt → Claude generates scene config → scenes render in preview → play/pause works → can iterate

 ---
 Phase 4: Landing Page

 Spec file: _specs/04-landing-page.md

 What: Beautiful dark-themed landing page as the product entry point.

 Files to create:
 - app/page.tsx — landing page composition
 - components/landing/Hero.tsx — "Animate everything. Just describe it." with word-by-word Framer Motion reveal, gradient background
 - components/landing/PromptInput.tsx — multi-line textarea with upload button, URL detection, purple "Generate →" button, Cmd+Enter shortcut
 - components/landing/ExamplePrompts.tsx — clickable pills: "Product launch video", "Logo animation", "SaaS demo reel", "3D showcase"
 - components/landing/DemoAnimation.tsx — looping Framer Motion showcase in a mock video player frame (cycles through mini-animations)
 - components/landing/FeaturesGrid.tsx — 3 cards: "Text to Animation", "URL → Video", "Export Anywhere"
 - components/landing/Navbar.tsx — logo + sign in + GitHub
 - components/landing/Footer.tsx — minimal footer

 Navigation flow: "Generate →" creates a nanoid() project ID, stores prompt in Zustand, navigates to /studio/[projectId]

 Exit criteria: Landing page renders at /, looks premium, prompt input works, navigates to studio on submit

 ---
 Phase 5: Skills System & Expanded Templates

 Spec file: _specs/05-skills-and-templates.md

 What: Build the Skills library (SKILL.md files) and expand scene templates to 15.

 SKILL.md files to create (P0):
 - skills/scene-builder/SKILL.md — multi-scene structure, pacing, duration guidelines, scene ordering
 - skills/motion-style/SKILL.md — easing curves, spring configs, duration ranges, stagger patterns
 - skills/typography/SKILL.md — text animation patterns, font pairing, letter-spacing
 - skills/color-palette/SKILL.md — dark mode palettes, gradient combos, accent color usage
 - skills/transitions/SKILL.md — scene-to-scene transitions: fade, slide, morph, wipe
 - skills/visual-analysis/SKILL.md — how to analyze uploaded screenshots, VisualContext extraction

 Additional scene templates (10 more, total 15):
 - lib/scene-templates/SplitScreenScene.tsx — left text, right visual
 - lib/scene-templates/StatsScene.tsx — animated number counters
 - lib/scene-templates/TestimonialScene.tsx — quote with attribution
 - lib/scene-templates/TimelineScene.tsx — vertical timeline with milestones
 - lib/scene-templates/ScreenshotShowcaseScene.tsx — animate a product screenshot
 - lib/scene-templates/ComparisonScene.tsx — before/after or side-by-side
 - lib/scene-templates/CodeBlockScene.tsx — animated code typing
 - lib/scene-templates/GradientBackgroundScene.tsx — mesh gradient / aurora backgrounds
 - lib/scene-templates/LogoGridScene.tsx — grid of logos animating in
 - lib/scene-templates/PricingTableScene.tsx — animated pricing cards

 Update lib/scene-registry.ts to include all 15 templates.
 Update system prompt in lib/claude.ts to document all template data schemas.

 Exit criteria: All 6 skills loaded into system prompt, all 15 templates work, Claude generates diverse high-quality animations

 ---
 Spec-First Workflow

 Each phase gets a detailed spec file in _specs/. Implementation order:

 _specs/
 ├── 01-foundation.md          ← implement first
 ├── 02-studio-layout.md       ← implement second
 ├── 03-animation-engine.md    ← implement third (critical path)
 ├── 04-landing-page.md        ← implement fourth
 └── 05-skills-and-templates.md ← implement fifth

 Process for each spec:
 1. Write the spec with exact file paths, interfaces, component APIs, and implementation details
 2. Implement all files described in the spec
 3. Verify exit criteria
 4. Move to next spec

 ---
 Key Technical Decisions

 ┌─────────────────────┬─────────────────────────────────────┬────────────────────────────────────────────────────────────────────┐
 │      Decision       │               Choice                │                             Rationale                              │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ Animation rendering │ Pre-built parametric templates      │ Reliable, guaranteed quality, no in-browser TSX compilation needed │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ State management    │ Zustand                             │ Lightweight, no boilerplate                                        │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ Claude output       │ Structured JSON scene configs       │ Parseable, maps to templates predictably                           │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ Streaming           │ Native ReadableStream + SSE         │ Simple, works with Vercel                                          │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ Storage (MVP)       │ In-memory / Zustand                 │ Ship fast, add persistence later                                   │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ Playback            │ requestAnimationFrame + React state │ Smooth 60fps, no external deps                                     │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ Panel resizing      │ CSS Grid + mouse drag               │ No library needed                                                  │
 ├─────────────────────┼─────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
 │ Code viewer         │ Simple syntax highlighting          │ Avoid Monaco bundle size for MVP                                   │
 └─────────────────────┴─────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘

 ---
 File Count Summary

 ┌─────────┬───────┬───────────────────────────────────────────────────┐
 │  Phase  │ Files │                    Description                    │
 ├─────────┼───────┼───────────────────────────────────────────────────┤
 │ Specs   │ 5     │ _specs/01-05.md                                   │
 ├─────────┼───────┼───────────────────────────────────────────────────┤
 │ Phase 1 │ ~15   │ Config, types, store, UI primitives               │
 ├─────────┼───────┼───────────────────────────────────────────────────┤
 │ Phase 2 │ ~13   │ Studio layout, panels, controls                   │
 ├─────────┼───────┼───────────────────────────────────────────────────┤
 │ Phase 3 │ ~14   │ API route, Claude integration, 5 templates, hooks │
 ├─────────┼───────┼───────────────────────────────────────────────────┤
 │ Phase 4 │ ~9    │ Landing page components                           │
 ├─────────┼───────┼───────────────────────────────────────────────────┤
 │ Phase 5 │ ~17   │ 6 SKILL.md files, 10 templates, registry update   │
 ├─────────┼───────┼───────────────────────────────────────────────────┤
 │ Total   │ ~73   │                                                   │
 └─────────┴───────┴───────────────────────────────────────────────────┘

 ---
 Verification Plan

 After each phase, verify:

 1. Phase 1: npm run dev boots, dark page at localhost:3000, no TypeScript errors
 2. Phase 2: Navigate to /studio/new, 3-panel layout renders, panels resize, chat input sends messages to state
 3. Phase 3: Type a prompt → Claude responds with animation config → scenes appear in preview → play/pause works → file tree shows scene files
 4. Phase 4: Landing page at / looks polished, prompt navigates to studio
 5. Phase 5: Generate diverse prompts ("product launch", "logo animation", "pricing comparison") → each produces distinct, high-quality multi-scene animations

 End-to-end test: Open / → type "Create a 20-second dark product launch video for a deployment platform" → click Generate → studio opens → animation plays with 3-5 scenes → iterate with "make the intro
 faster" → animation updates