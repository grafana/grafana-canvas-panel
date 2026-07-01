// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/datasource/grafana/datasource.ts
// TODO: Publish GrafanaDatasource and FileElement from @grafana/runtime and delete this duplicate file
import { type Observable } from 'rxjs';

import { type DataFrameView } from '@grafana/data';
import { type DataSourceApi } from '@grafana/data';

export interface FileElement {
  name: string;
  ['media-type']: string;
}

export interface GrafanaDatasource extends DataSourceApi {
  listFiles(path: string, maxDataPoints?: number): Observable<DataFrameView<FileElement>>;
}
