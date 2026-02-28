# Skill: Motion Style

Use this skill when setting animation timing, easing, or spring configurations.

## Easing Guidelines

### By Animation Type
- **Entrances**: Use `ease-out` or spring — things slow down as they arrive
- **Exits**: Use `ease-in` — things accelerate as they leave
- **UI micro-interactions**: Snappy springs for physical feel
- **Cinematic reveals**: Dramatic cubic-bezier for elegance

### Recommended Curves
- Standard ease-out: `cubic-bezier(0.16, 1, 0.3, 1)`
- Smooth ease-in-out: `cubic-bezier(0.45, 0, 0.55, 1)`
- Dramatic entrance: `cubic-bezier(0.0, 0.0, 0.2, 1)`
- Bounce settle: `spring(1, 80, 10)` (Framer Motion)
- Snappy UI: `spring(1, 200, 20)` (Framer Motion)

## Duration Guidelines

### By Context
- **Micro** (hover, tap feedback): 80–150ms
- **UI transitions** (panel open, modal): 200–400ms
- **Scene changes** (cross-fade between scenes): 500–800ms
- **Hero/cinematic reveals** (first impression): 800–1200ms
- **Full text reveal** (word-by-word headline): 1500–2500ms

### Scene-Level Timing
- A 4-second scene should have:
  - 0–30%: entrance animations
  - 30–70%: content visible and settled
  - 70–100%: either hold or exit transition

## Stagger Patterns

### Lists & Cards
- List items: stagger by 60–100ms
- Grid cards: stagger by 40–80ms
- Feature items: stagger by 80–120ms

### Direction
- **Sequential**: top to bottom (default for lists)
- **Radial**: center outward (good for grids)
- **Diagonal**: top-left to bottom-right (adds visual interest)

## Animation Principles
- Every element should have a purpose for moving
- Prefer subtle over dramatic — less is more
- Maintain consistent timing feel across scenes
- Fast elements (< 200ms) feel responsive
- Slow elements (> 800ms) feel cinematic
- Use springs for anything that should feel physical/tactile
- Use cubic-bezier for anything that should feel smooth/elegant
