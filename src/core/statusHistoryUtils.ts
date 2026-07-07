// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/status-history/utils.ts
// TODO: `getFieldDisplayLinks` in @grafana/ui has a different signature to `getDataLinks` here
// (it takes different args and returns a different shape). These are NOT interchangeable.
// To remove this file, CanvasTooltip.tsx must be refactored to use the @grafana/ui API directly.
import { type Field, type LinkModel } from '@grafana/data';

export const getDataLinks = (field: Field, rowIdx: number) => {
  const links: Array<LinkModel<Field>> = [];

  if ((field.config.links?.length ?? 0) > 0 && field.getLinks != null) {
    const v = field.values[rowIdx];
    const disp = field.display ? field.display(v) : { text: `${v}`, numeric: +v };

    const linkLookup = new Set<string>();

    field.getLinks({ calculatedValue: disp, valueRowIndex: rowIdx }).forEach((link) => {
      const key = `${link.title}/${link.href}`;
      if (!linkLookup.has(key)) {
        links.push(link);
        linkLookup.add(key);
      }
    });
  }

  return links;
};
