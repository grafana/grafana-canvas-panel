// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-ui/src/components/uPlot/plugins/CloseButton.tsx
// Fallback for hosts without the public export. See src/compat/README.md.
// mostly copy/pasted from: public/app/core/components/CloseButton/CloseButton.tsx
import { css } from '@emotion/css';
import * as React from 'react';

import { type GrafanaTheme2 } from '@grafana/data';

import { IconButton, useStyles2 } from '@grafana/ui';

type Props = {
  onClick: () => void;
  'aria-label'?: string;
  style?: React.CSSProperties;
};

export const CloseButton = ({ onClick, 'aria-label': ariaLabel, style }: Props) => {
  const styles = useStyles2(getStyles);
  return (
    <IconButton aria-label={ariaLabel ?? 'Close'} className={styles} name="times" onClick={onClick} style={style} />
  );
};

const getStyles = (theme: GrafanaTheme2) =>
  css({
    position: 'absolute',
    margin: '0px',
    right: 5,
    top: 6,
  });
