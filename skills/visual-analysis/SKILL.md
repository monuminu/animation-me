# Skill: Visual Analysis

Use this skill whenever Claude receives uploaded screenshots, videos, or Playwright-captured images. Always read this BEFORE writing any animation code when visual inputs are present.

## What to Extract from Screenshots

Analyze every provided image and extract:

### Color DNA
- Primary background color (usually the dominant color)
- Accent/brand color (buttons, highlights, CTAs)
- Text colors (heading, body, muted)
- Gradient directions and stop colors if present
- Output as: `{ bg, accent, heading, body, gradient }`

### Typography Style
- Heading font family (serif / sans-serif / monospace / display)
- Font weight used for headings (light / regular / bold / black)
- Body font if different
- Letter-spacing style (tight / normal / loose)
- Output as: `{ headingFont, headingWeight, bodyFont, letterSpacing }`

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

After analysis, produce a concise VisualContext object:
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

## Rules
- ALWAYS analyze visuals before writing animation code
- Extract real colors from the image — do not guess or use defaults
- If the product is light-themed, use light backgrounds in the animation
- If the product is dark-themed, match its dark palette
- Brand consistency is paramount — match the product's visual identity
