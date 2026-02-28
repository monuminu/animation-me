# Skill: Color Palette

Use this skill when choosing colors for animation scenes.

## Dark Mode Palettes (Default)

### Deep Dark (Default)
- Background: `#0d1117`
- Surface: `#161b22`
- Card: `#1c2128`
- Border: `#30363d`
- Text primary: `#f0f6fc`
- Text secondary: `#8b949e`
- Text muted: `#6e7681`

### Midnight Blue
- Background: `#0f172a`
- Surface: `#1e293b`
- Card: `#1e3a5f`
- Text primary: `#f8fafc`
- Text secondary: `#94a3b8`

### Purple Night
- Background: `#0a0a0b`
- Surface: `#1a1a2e`
- Card: `#16213e`
- Text primary: `#fafafa`
- Text secondary: `#a1a1aa`

## Accent Color Combinations

### Purple (Default)
- Primary: `#7c3aed`
- Hover: `#6d28d9`
- Light: `#a78bfa`
- Gradient: `#7c3aed` → `#6366f1`

### Blue
- Primary: `#3b82f6`
- Hover: `#2563eb`
- Light: `#93c5fd`
- Gradient: `#3b82f6` → `#06b6d4`

### Green
- Primary: `#10b981`
- Hover: `#059669`
- Light: `#6ee7b7`
- Gradient: `#10b981` → `#34d399`

### Orange
- Primary: `#f97316`
- Hover: `#ea580c`
- Light: `#fdba74`
- Gradient: `#f97316` → `#eab308`

### Pink
- Primary: `#ec4899`
- Hover: `#db2777`
- Light: `#f9a8d4`
- Gradient: `#ec4899` → `#8b5cf6`

## Gradient Patterns

### Background Gradients
- Subtle: primary bg → slightly lighter (5% opacity shift)
- Radial: center glow of accent at 5-10% opacity on dark bg
- Mesh: 2-3 overlapping radial gradients at low opacity

### Text Gradients
- Always left-to-right or diagonal
- Use 2-3 stops maximum
- Ensure all colors maintain readability

## Rules
- ALWAYS default to dark backgrounds unless user specifies otherwise
- Keep accent color consistent across ALL scenes
- Use accent color sparingly — for highlights, CTAs, and emphasis
- Card backgrounds should be 1-2 steps lighter than the main background
- Never use pure black (#000000) — always slightly warm or cool
- Never use pure white (#ffffff) for backgrounds — use #f0f6fc or #fafafa for text
- Ensure WCAG AA contrast ratio (4.5:1) for body text
