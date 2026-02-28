# Skill: Transitions

Use this skill when determining how scenes transition from one to another.

## Transition Types

### Fade (Default)
- Cross-dissolve between scenes
- Duration: 300–500ms
- Use when: Scenes are thematically different, calm pacing
- Implementation: opacity 1 → 0 for outgoing, 0 → 1 for incoming

### Slide
- Incoming scene slides in from a direction
- Duration: 400–600ms
- Directions: left, right, up, down
- Use when: Sequential content, timeline progression
- Ease: `cubic-bezier(0.16, 1, 0.3, 1)`

### Wipe
- Reveal line sweeps across, showing new scene underneath
- Duration: 500–700ms
- Use when: Dramatic reveals, before/after comparisons
- Implementation: clip-path animation

### Morph
- Elements transform between positions/states
- Duration: 600–800ms
- Use when: Same data, different view
- Most complex — reserve for special moments

### None
- Instant cut between scenes
- Duration: 0ms
- Use when: Same visual style continues, music-driven cuts

## When to Use Each

| Scenario | Recommended Transition |
|----------|----------------------|
| Intro → Feature | Fade |
| Feature → Feature | Slide (horizontal) |
| Feature → Stats | Fade |
| Stats → CTA | Fade |
| Before → After | Wipe |
| Any → Logo Reveal | Fade |
| Screenshot → Feature | Slide (up) |

## Rules
- Use consistent transitions within a single animation
- Don't mix more than 2 transition types per animation
- Fade is always safe — when in doubt, use fade
- Transition duration should be 10-15% of the shorter scene's duration
- Never make transitions longer than 800ms
- The first scene should NOT have an entrance transition (it's the starting state)
