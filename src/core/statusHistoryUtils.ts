// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/status-history/utils.ts
// TODO: Publish getDataLinks from @grafana/ui and delete this duplicate file
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
