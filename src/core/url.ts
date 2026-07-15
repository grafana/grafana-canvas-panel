// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/alerting/unified/utils/url.ts
// TODO: Publish createAbsoluteUrl from @grafana/runtime and delete this duplicate file
import { config } from '@grafana/runtime';

export type RelativeUrl = `/${string}`;

export function isRelativeUrl(url: string): url is RelativeUrl {
  return url.startsWith('/') && !url.startsWith('//');
}

export function createRelativeUrl(
  path: RelativeUrl,
  queryParams?: string[][] | Record<string, string> | string | URLSearchParams,
  options: { skipSubPath?: boolean } = { skipSubPath: false }
) {
  const searchParams = new URLSearchParams(queryParams);
  const searchParamsString = searchParams.toString();
  const subPath = options.skipSubPath ? '' : config.appSubUrl;
  return `${subPath}${path}${searchParamsString ? `?${searchParamsString}` : ''}`;
}

export function createAbsoluteUrl(
  path: RelativeUrl,
  queryParams?: string[][] | Record<string, string> | string | URLSearchParams
) {
  const searchParams = new URLSearchParams(queryParams);
  const searchParamsString = searchParams.toString();
  try {
    const baseUrl = new URL(config.appSubUrl + path, config.appUrl);
    return `${baseUrl.href}${searchParamsString ? `?${searchParamsString}` : ''}`;
  } catch (err) {
    return createRelativeUrl(path, queryParams);
  }
}
