import React from "react";
import { Composition } from "remotion";
import { ExecpadLaunch, EXECPAD_DURATION } from "./ExecpadLaunch";
import { GhostEnvLaunch, GHOST_ENV_DURATION } from "./GhostEnvLaunch";
import { FPS } from "./shared/theme";

const W = 1920;
const H = 1080;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="execpad-launch"
        component={ExecpadLaunch}
        durationInFrames={EXECPAD_DURATION}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="ghost-env-launch"
        component={GhostEnvLaunch}
        durationInFrames={GHOST_ENV_DURATION}
        fps={FPS}
        width={W}
        height={H}
      />
    </>
  );
};
