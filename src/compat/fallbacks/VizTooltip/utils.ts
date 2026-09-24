// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-ui/src/components/VizTooltip/utils.ts
// Private fallback helper. See src/compat/README.md.
// Trimmed to the one helper the copied tooltip components use.
import { type ColorIndicatorStyles } from './VizTooltipColorIndicator';
import { VizTooltipColorIndicator } from './types';

export const getColorIndicatorClass = (colorIndicator: string, styles: ColorIndicatorStyles) => {
  switch (colorIndicator) {
    case VizTooltipColorIndicator.series:
      return styles.series;
    case VizTooltipColorIndicator.value:
      return styles.value;
    case VizTooltipColorIndicator.hexagon:
      return styles.hexagon;
    case VizTooltipColorIndicator.pie_1_4:
      return styles.pie_1_4;
    case VizTooltipColorIndicator.pie_2_4:
      return styles.pie_2_4;
    case VizTooltipColorIndicator.pie_3_4:
      return styles.pie_3_4;
    case VizTooltipColorIndicator.marker_sm:
      return styles.marker_sm;
    case VizTooltipColorIndicator.marker_md:
      return styles.marker_md;
    case VizTooltipColorIndicator.marker_lg:
      return styles.marker_lg;
    default:
      return styles.value;
  }
};
