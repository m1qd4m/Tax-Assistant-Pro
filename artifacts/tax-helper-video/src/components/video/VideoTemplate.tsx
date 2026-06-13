import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS = {
  open: 6000,
  problem: 8000,
  reliefs: 10000,
  product: 10000,
  closer: 8000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1,
  problem: Scene2,
  reliefs: Scene3,
  product: Scene4,
  closer: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  void sceneIndex;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-body text-white">
      {/* Persistent background layer */}
      <div className="absolute inset-0">
        <video
          src={`${import.meta.env.BASE_URL}videos/bg-loop.mp4`}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Scene-specific foreground content */}
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
