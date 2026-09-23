// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-ui/src/components/VizTooltip/VizTooltipHeader.tsx
// Copied because @grafana/ui only exports this publicly from 13.1.0 (or not at all).
// See src/compat/index.ts before changing.
import * as React from 'react';
import { css } from '@emotion/css';

import { type GrafanaTheme2 } from '@grafana/data';

import { useStyles2 } from '@grafana/ui';

import { VizTooltipRow } from './VizTooltipRow';
import { type VizTooltipItem } from './types';

/** @alpha */
export interface VizTooltipHeaderProps {
  /** The item to display in the header row, typically the x-axis or time value. */
  item: VizTooltipItem;
  /**
   * Whether the tooltip is currently pinned (locked open by the user).
   * When pinned, the label and value become clickable to copy their text to the clipboard.
   * Defaults to `false`.
   */
  isPinned?: boolean;
}

/** @alpha */
export const VizTooltipHeader = ({
  item: { label, value, color, colorIndicator },
  isPinned = false,
}: VizTooltipHeaderProps) => {
  const styles = useStyles2(getStyles);
  return (
    <div className={styles}>
      <VizTooltipRow
        label={label}
        value={value}
        color={color}
        colorIndicator={colorIndicator}
        marginRight={'22px'}
        isPinned={isPinned}
      />
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) =>
  css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: theme.spacing(1),
    lineHeight: 1,
  });
