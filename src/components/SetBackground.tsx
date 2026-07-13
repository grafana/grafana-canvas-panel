// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/canvas/components/SetBackground.tsx
import * as React from 'react';
import { css } from '@emotion/css';
import { useState } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { ResourceDimensionMode } from '@grafana/schema';
import { Portal, useTheme2 } from '@grafana/ui';
import { type Scene } from '../features/canvas/runtime/scene';
import { ResourcePickerPopover } from '../features/dimensions/editors/ResourcePickerPopover';
import { MediaType, ResourceFolderName } from '../features/dimensions/types';

import { type AnchorPoint } from '../types';

type Props = {
  onClose: () => void;
  scene: Scene;
  anchorPoint: AnchorPoint;
};

export function SetBackground({ onClose, scene, anchorPoint }: Props) {
  const defaultValue = scene.root.options.background?.image?.fixed ?? '';

  const [bgImage, setBgImage] = useState(defaultValue);
  const theme = useTheme2();
  const styles = getStyles(theme, anchorPoint);

  const onChange = (value: string | undefined) => {
    const sceneRef = scene;
    if (value) {
      setBgImage(value);
      if (sceneRef.root) {
        // eslint-disable-next-line react-hooks/immutability
        sceneRef.root.options.background = {
          ...sceneRef.root.options.background,
          image: { mode: ResourceDimensionMode.Fixed, fixed: value },
        };
        // eslint-disable-next-line react-hooks/immutability
        sceneRef.revId++;
        sceneRef.save();

        sceneRef.root.reinitializeMoveable();
      }

      // Force a re-render (update scene data after config update)
      if (sceneRef) {
        sceneRef.updateData(sceneRef.data!);
      }
    }

    onClose();
  };

  return (
    <Portal className={styles.portalWrapper}>
      <ResourcePickerPopover
        onChange={onChange}
        value={bgImage}
        mediaType={MediaType.Image}
        folderName={ResourceFolderName.IOT}
      />
    </Portal>
  );
}

const getStyles = (theme: GrafanaTheme2, anchorPoint: AnchorPoint) => ({
  portalWrapper: css({
    width: '315px',
    height: '445px',
    transform: `translate(${anchorPoint.x}px, ${anchorPoint.y - 200}px)`,
  }),
});
