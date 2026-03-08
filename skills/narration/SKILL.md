# Skill: Narration

Use this skill when generating voiceover narration scripts for animation scenes.
Each scene can include a `narration` field containing the text that will be
converted to speech via ElevenLabs TTS and played during the scene.

## When to Include Narration

### Always narrate
- HeroScene — introduce the product/concept
- FeatureGridScene — explain what each feature does
- SplitScreenScene — describe the benefit or comparison
- CTAScene — deliver the closing call-to-action
- StatsScene — contextualize the numbers
- ComparisonScene — explain before vs after
- TimelineScene — walk through the milestones

### Skip narration
- LogoRevealScene — let the visual breathe; a short musical beat is better
- TestimonialScene — the quote IS the narration (reading it aloud would be redundant)
- CodeBlockScene — code speaks for itself; narration would compete with reading

## Writing Rules

### Pacing
- Target ~2.5 words per second of scene duration
- A 5-second scene should have ~12 words of narration
- A 8-second scene should have ~20 words of narration
- Leave 500ms of breathing room at the end (don't fill every millisecond)
- If the narration would exceed the scene duration, the system will auto-extend the scene delay — but aim to stay within bounds

### Length
- 1–3 sentences per scene
- Never exceed 4 sentences
- Shorter is almost always better

### Tone
- Conversational, not corporate — write like you're explaining to a friend
- Active voice: "We built X" not "X was built"
- Present tense preferred: "Meet your new dashboard" not "You will meet..."
- Match the animation's visual tone:
  - Dark/premium theme → confident, understated narration
  - Bright/playful theme → energetic, enthusiastic narration
  - Minimal/clean theme → concise, precise narration

### Content Rules
- **Complement, don't repeat**: If the headline says "Lightning Fast", the narration should explain WHY it's fast, not repeat "It's lightning fast"
- **Add context**: Narration should provide information that isn't on screen
- **Bridge scenes**: Each narration should feel like it flows naturally from the previous one
- **No UI instructions**: Never say "click here" or "as you can see" — this isn't a tutorial

### Word Choice
- Avoid filler words: "basically", "actually", "just", "really"
- Avoid marketing buzzwords: "revolutionary", "game-changing", "best-in-class"
- Use concrete language: "saves 3 hours per week" beats "saves significant time"

## Examples

### Good
```
Scene: HeroScene (headline: "Ship Faster")
Narration: "Building great products shouldn't mean wrestling with infrastructure. That's why we created Launchpad."
```

```
Scene: FeatureGridScene (features: real-time sync, team collab, API access)
Narration: "Real-time sync keeps everyone on the same page. Collaborate with your team, or plug into your existing tools with our API."
```

```
Scene: CTAScene (headline: "Start Free Today")
Narration: "Ready to see the difference? Get started in under two minutes — no credit card required."
```

### Bad
- "Welcome to our revolutionary platform that will change the way you work forever." (buzzwords, vague)
- "As you can see on screen, the headline says Ship Faster." (repeating on-screen text)
- "Click the button below to sign up." (UI instruction)
