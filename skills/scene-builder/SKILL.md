# Skill: Scene Builder

Use this skill when generating multi-scene animations or video-style sequences.

## Scene Structure

Every animation is an ordered array of scenes. Each scene maps to a template and has a duration.

## Pacing Guidelines

### Duration by Type
- **Quick promo** (10–15s total): 2–3 scenes, fast-paced
- **Standard video** (20–30s total): 4–6 scenes, balanced pacing
- **Detailed showcase** (40–60s total): 6–10 scenes, thorough coverage

### Scene Duration Ranges
- Intro/Logo reveal: 2–4 seconds
- Text reveals (single message): 3–5 seconds
- Feature showcases: 4–6 seconds
- Stats/data displays: 4–5 seconds
- CTA/outro: 3–4 seconds
- Complex scenes (comparison, timeline): 5–7 seconds

## Scene Ordering Best Practices

### Classic Product Launch Structure
1. **Logo Reveal** — brand identity first (LogoRevealScene)
2. **Hero Statement** — bold claim or headline (HeroScene or TextRevealScene)
3. **Feature Highlights** — 1–3 feature scenes (FeatureGridScene, SplitScreenScene)
4. **Social Proof** — stats or testimonials (StatsScene, TestimonialScene)
5. **Call to Action** — closing with CTA (CTAScene)

### Demo/Walkthrough Structure
1. **Text Intro** — set context (TextRevealScene)
2. **Screenshot Showcase** — show the product (ScreenshotShowcaseScene)
3. **Feature Deep Dives** — key features (SplitScreenScene, FeatureGridScene)
4. **Comparison** — before/after or vs competitors (ComparisonScene)
5. **CTA** — next steps (CTAScene)

### Brand/Logo Animation Structure
1. **Gradient Background** — mood setting (GradientBackgroundScene)
2. **Logo Reveal** — main logo animation (LogoRevealScene)
3. **Brand Statement** — tagline or mission (TextRevealScene)
4. **Values/Features** — what the brand stands for (FeatureGridScene)
5. **Logo + CTA** — final brand lockup (CTAScene)

## Rules
- Never start with a CTA — always build up to it
- Never put two identical templates back-to-back
- Always ensure totalDuration equals the sum of all scene durations
- Keep color palette consistent across all scenes
- The first scene should be visually striking — it sets the tone
- The last scene should have a clear conclusion or call-to-action
