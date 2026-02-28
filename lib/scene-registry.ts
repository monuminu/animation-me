'use client'

import type { SceneProps } from '@/types'
import { TextRevealScene } from './scene-templates/TextRevealScene'
import { HeroScene } from './scene-templates/HeroScene'
import { FeatureGridScene } from './scene-templates/FeatureGridScene'
import { CTAScene } from './scene-templates/CTAScene'
import { LogoRevealScene } from './scene-templates/LogoRevealScene'
import { SplitScreenScene } from './scene-templates/SplitScreenScene'
import { StatsScene } from './scene-templates/StatsScene'
import { TestimonialScene } from './scene-templates/TestimonialScene'
import { TimelineScene } from './scene-templates/TimelineScene'
import { ScreenshotShowcaseScene } from './scene-templates/ScreenshotShowcaseScene'
import { ComparisonScene } from './scene-templates/ComparisonScene'
import { CodeBlockScene } from './scene-templates/CodeBlockScene'
import { GradientBackgroundScene } from './scene-templates/GradientBackgroundScene'
import { LogoGridScene } from './scene-templates/LogoGridScene'
import { PricingTableScene } from './scene-templates/PricingTableScene'

type SceneComponent = React.ComponentType<SceneProps>

const registry: Record<string, SceneComponent> = {
  TextRevealScene,
  HeroScene,
  FeatureGridScene,
  CTAScene,
  LogoRevealScene,
  SplitScreenScene,
  StatsScene,
  TestimonialScene,
  TimelineScene,
  ScreenshotShowcaseScene,
  ComparisonScene,
  CodeBlockScene,
  GradientBackgroundScene,
  LogoGridScene,
  PricingTableScene,
}

export function getSceneComponent(templateName: string): SceneComponent | undefined {
  return registry[templateName]
}

export function getAvailableTemplates(): string[] {
  return Object.keys(registry)
}

export { registry as sceneRegistry }
