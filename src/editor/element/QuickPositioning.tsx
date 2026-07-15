// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/canvas/editor/element/QuickPositioning.tsx
import * as React from 'react';
import { css } from '@emotion/css';

import { type GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { IconButton, useStyles2 } from '@grafana/ui';
import { type ElementState } from '../../features/canvas/runtime/element';
import { QuickPlacement } from '../../features/canvas/types';

import { HorizontalConstraint, VerticalConstraint, type Placement } from '../../panelcfg.gen';

import { type CanvasEditorOptions } from './elementEditor';

type Props = {
  onPositionChange: (value: number | undefined, placement: keyof Placement) => void;
  element: ElementState;
  settings: CanvasEditorOptions;
};

export const QuickPositioning = ({ onPositionChange, element, settings }: Props) => {
  const styles = useStyles2(getStyles);
  const elementRef = element;

  const onQuickPositioningChange = (position: QuickPlacement) => {
    const defaultConstraint = { vertical: VerticalConstraint.Top, horizontal: HorizontalConstraint.Left };
    const originalConstraint = { ...elementRef.options.constraint };

    // eslint-disable-next-line react-hooks/immutability
    elementRef.options.constraint = defaultConstraint;
    elementRef.setPlacementFromConstraint();

    switch (position) {
      case QuickPlacement.Top:
        onPositionChange(0, 'top');
        break;
      case QuickPlacement.Bottom:
        onPositionChange(getRightBottomPosition(elementRef.options.placement?.height ?? 0, 'bottom'), 'top');
        break;
      case QuickPlacement.VerticalCenter:
        onPositionChange(getCenterPosition(elementRef.options.placement?.height ?? 0, 'v'), 'top');
        break;
      case QuickPlacement.Left:
        onPositionChange(0, 'left');
        break;
      case QuickPlacement.Right:
        onPositionChange(getRightBottomPosition(elementRef.options.placement?.width ?? 0, 'right'), 'left');
        break;
      case QuickPlacement.HorizontalCenter:
        onPositionChange(getCenterPosition(elementRef.options.placement?.width ?? 0, 'h'), 'left');
        break;
    }

    elementRef.options.constraint = originalConstraint;
    elementRef.setPlacementFromConstraint();
  };

  // Basing this on scene will mean that center is based on root for the time being
  const getCenterPosition = (elementSize: number, align: 'h' | 'v') => {
    const sceneSize = align === 'h' ? settings.scene.width : settings.scene.height;

    return (sceneSize - elementSize) / 2;
  };

  const getRightBottomPosition = (elementSize: number, align: 'right' | 'bottom') => {
    const sceneSize = align === 'right' ? settings.scene.width : settings.scene.height;

    return sceneSize - elementSize;
  };

  return (
    <div className={styles.buttonGroup}>
      <IconButton
        name="horizontal-align-left"
        // eslint-disable-next-line react-hooks/immutability
        onClick={() => onQuickPositioningChange(QuickPlacement.Left)}
        className={styles.button}
        size="lg"
        tooltip={t('canvas.quick-positioning.tooltip-align-left', 'Align left')}
      />
      <IconButton
        name="horizontal-align-center"
        onClick={() => onQuickPositioningChange(QuickPlacement.HorizontalCenter)}
        className={styles.button}
        size="lg"
        tooltip={t('canvas.quick-positioning.tooltip-align-horizontal-centers', 'Align horizontal centers')}
      />
      <IconButton
        name="horizontal-align-right"
        onClick={() => onQuickPositioningChange(QuickPlacement.Right)}
        className={styles.button}
        size="lg"
        tooltip={t('canvas.quick-positioning.tooltip-align-right', 'Align right')}
      />
      <IconButton
        name="vertical-align-top"
        onClick={() => onQuickPositioningChange(QuickPlacement.Top)}
        size="lg"
        tooltip={t('canvas.quick-positioning.tooltip-align-top', 'Align top')}
      />
      <IconButton
        name="vertical-align-center"
        onClick={() => onQuickPositioningChange(QuickPlacement.VerticalCenter)}
        className={styles.button}
        size="lg"
        tooltip={t('canvas.quick-positioning.tooltip-align-vertical-centers', 'Align vertical centers')}
      />
      <IconButton
        name="vertical-align-bottom"
        onClick={() => onQuickPositioningChange(QuickPlacement.Bottom)}
        className={styles.button}
        size="lg"
        tooltip={t('canvas.quick-positioning.tooltip-align-bottom', 'Align bottom')}
      />
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  buttonGroup: css({
    display: 'flex',
    flexWrap: 'wrap',
    padding: '12px 0 12px 0',
  }),
  button: css({
    marginLeft: '5px',
    marginRight: '5px',
  }),
});
