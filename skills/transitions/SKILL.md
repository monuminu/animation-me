# Skill: Transitions

Use this skill when determining how scenes transition from one to another.

## How Transitions Work

Each scene can include an optional `transition` property in the animation config:
```json
{
  "id": "scene-1",
  "template": "HeroScene",
  "duration": 5000,
  "transition": { "type": "fadeBlur", "duration": 500 },
  "data": { ... }
}
```

The `transition` on a scene controls how it exits into the NEXT scene. During the last N milliseconds (the transition duration), both the current and next scene render simultaneously with the transition effect applied.

## Available Transition Types (18)

### Basic
| Type | Effect | Default Duration | Description |
|------|--------|-----------------|-------------|
| `none` | Instant cut | 0ms | Hard cut between scenes |
| `fade` | Opacity crossfade | 300ms | Simple, safe, always works |
| `crossDissolve` | Extended overlap dissolve | 500ms | Smoother than fade, more overlap |

### Cinematic
| Type | Effect | Default Duration | Description |
|------|--------|-----------------|-------------|
| `fadeBlur` | Fade + 12px blur | 400ms | Dreamy, premium, cinematic |
| `scaleFade` | Scale 0.92→1 + fade | 400ms | Subtle zoom transition |
| `zoomThrough` | Current zooms in, next scales up | 500ms | Diving deeper into content |
| `clipCircle` | Radial circle reveal from center | 600ms | Spotlight/dramatic reveal |

### Directional
| Type | Effect | Default Duration | Description |
|------|--------|-----------------|-------------|
| `slideLeft` | Next slides in from right | 500ms | Sequential content flow |
| `slideRight` | Next slides in from left | 500ms | Reverse direction flow |
| `slideUp` | Next slides in from bottom | 500ms | Upward energy, reveals |
| `slideDown` | Next slides in from top | 500ms | Dropdown reveals |
| `pushLeft` | Both scenes push left together | 500ms | Strong directional momentum |
| `pushRight` | Both scenes push right together | 500ms | Strong directional momentum |
| `wipe` | Left-to-right clip-path reveal | 600ms | Dramatic sweeping reveal |

### Theatrical
| Type | Effect | Default Duration | Description |
|------|--------|-----------------|-------------|
| `perspectiveFlip` | 3D card flip (rotateY) | 600ms | Playful, comparing two sides |
| `morphExpand` | Scale from center point | 500ms | Expanding into new content |
| `splitHorizontal` | Horizontal curtain open | 500ms | Theatrical, cinematic reveals |
| `splitVertical` | Vertical curtain open | 500ms | Theatrical, cinematic reveals |

### Backward-Compatible Aliases
- `slide` → maps to `slideLeft`
- `morph` → maps to `morphExpand`

## When to Use Each

| Scene Flow | Recommended Transition |
|-----------|----------------------|
| Intro → Features | `fade` or `fadeBlur` |
| Feature → Feature | `slideLeft` or `pushLeft` |
| Feature → Stats | `fade` or `scaleFade` |
| Stats → CTA | `fadeBlur` or `zoomThrough` |
| Before → After (Comparison) | `wipe` |
| Any → Logo Reveal | `fade` or `clipCircle` |
| Screenshot → Feature | `slideUp` or `scaleFade` |
| Content → Dramatic moment | `clipCircle` or `splitHorizontal` |
| Pricing plan comparisons | `slideLeft` |
| Timeline progression | `slideLeft` or `pushLeft` |
| Code demo → Explanation | `fadeBlur` or `scaleFade` |
| Gradient/mood scene → Next | `crossDissolve` |

## Transition Style Combinations

For consistency, pick ONE style family per animation:

### Clean & Professional
Use: `fade`, `fadeBlur`, `crossDissolve`

### Dynamic & Energetic
Use: `slideLeft`, `pushLeft`, `slideUp`

### Cinematic & Dramatic
Use: `fadeBlur`, `clipCircle`, `zoomThrough`

### Theatrical & Playful
Use: `perspectiveFlip`, `splitHorizontal`, `morphExpand`

## Rules

1. **The first scene should NOT have a transition** — it's the starting state
2. **Use 1-2 transition types max** per animation for visual consistency
3. **fade is always safe** — when in doubt, use `fade`
4. **fadeBlur** is the best upgrade from plain `fade` for premium feel
5. **Transition duration** should be 10-15% of the shorter scene's duration
6. **Never exceed 800ms** for transitions — they should be quick
7. Don't mix more than 2 style families in one animation
8. **The last scene (CTA)** typically doesn't need a transition since nothing follows it
9. Match transition energy to content energy — gentle transitions for calm content, dynamic for exciting
