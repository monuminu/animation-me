import React from 'react'
import { Composition, CalculateMetadataFunction } from 'remotion'
import { RemotionComposition } from './RemotionComposition'
import type { RemotionCompositionProps } from './RemotionComposition'
import type { AnimationConfig } from '@/types'

/**
 * RemotionRoot — Registers the "animation" composition with Remotion.
 *
 * inputProps are provided at render time by the API route:
 *   { animationConfig, fps, width, height }
 */

// Default props for Remotion Studio preview (if you run `npx remotion studio`)
const defaultAnimationConfig: AnimationConfig = {
  title: 'Preview',
  totalDuration: 3000,
  scenes: [
    {
      id: 'placeholder',
      template: 'TextRevealScene',
      duration: 3000,
      data: {
        heading: 'Preview',
        subheading: 'This is a Remotion preview placeholder',
      },
    },
  ],
}

const calculateMetadata: CalculateMetadataFunction<RemotionCompositionProps> = ({
  props,
}) => {
  const fps = props.fps || 30
  const totalDuration =
    props.animationConfig?.totalDuration ?? defaultAnimationConfig.totalDuration

  return {
    durationInFrames: Math.ceil((totalDuration / 1000) * fps),
    fps,
    width: props.width || 1920,
    height: props.height || 1080,
  }
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="animation"
        component={RemotionComposition}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          animationConfig: defaultAnimationConfig,
          fps: 30,
          width: 1920,
          height: 1080,
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  )
}
