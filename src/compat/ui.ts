import { type ComponentProps, type ComponentType } from 'react';

import * as grafanaUI from '@grafana/ui';

import { CloseButton as FallbackCloseButton } from './fallbacks/CloseButton';
import { VizTooltipContent as FallbackContent } from './fallbacks/VizTooltip/VizTooltipContent';
import { VizTooltipFooter as FallbackFooter } from './fallbacks/VizTooltip/VizTooltipFooter';
import { VizTooltipHeader as FallbackHeader } from './fallbacks/VizTooltip/VizTooltipHeader';

// ComponentType accepts React memo/forwardRef components too; do not check
// typeof === 'function'. These public exports postdate the 12.4 baseline.
export interface OptionalUIExports {
  CloseButton?: ComponentType<ComponentProps<typeof FallbackCloseButton>>;
  VizTooltipContent?: ComponentType<ComponentProps<typeof FallbackContent>>;
  VizTooltipFooter?: ComponentType<ComponentProps<typeof FallbackFooter>>;
  VizTooltipHeader?: ComponentType<ComponentProps<typeof FallbackHeader>>;
}

const host = grafanaUI as typeof grafanaUI & OptionalUIExports;

// Select once and preserve the host's component identity and hook lifecycle.
export const CloseButton = host.CloseButton ?? FallbackCloseButton;
export const VizTooltipContent = host.VizTooltipContent ?? FallbackContent;
export const VizTooltipFooter = host.VizTooltipFooter ?? FallbackFooter;
export const VizTooltipHeader = host.VizTooltipHeader ?? FallbackHeader;
