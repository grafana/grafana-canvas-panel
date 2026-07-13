// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/canvas/editor/element/utils.ts
import { AppEvents, textUtil, type LegacyEmitter } from '@grafana/data';
import { type BackendSrvRequest, getBackendSrv, getTemplateSrv, getAppEvents } from '@grafana/runtime';
import { createAbsoluteUrl, type RelativeUrl } from '../../core/url';

import { HttpRequestMethod } from '../../panelcfg.gen';

import { type APIEditorConfig } from './APIEditor';

type IsLoadingCallback = (loading: boolean) => void;

export const callApi = (api: APIEditorConfig, updateLoadingStateCallback?: IsLoadingCallback) => {
  if (!api.endpoint) {
    (getAppEvents() as unknown as LegacyEmitter).emit(AppEvents.alertError, ['API endpoint is not defined.']);
    return;
  }

  const request = getRequest(api);

  getBackendSrv()
    .fetch(request)
    .subscribe({
      error: (error) => {
        (getAppEvents() as unknown as LegacyEmitter).emit(AppEvents.alertError, [
          'An error has occurred. Check console output for more details.',
        ]);
        console.error('API call error: ', error);
        updateLoadingStateCallback && updateLoadingStateCallback(false);
      },
      complete: () => {
        const message = api.successMessage || 'API call was successful';
        (getAppEvents() as unknown as LegacyEmitter).emit(AppEvents.alertSuccess, [message]);
        updateLoadingStateCallback && updateLoadingStateCallback(false);
      },
    });
};

// NOTE: `scopedVars` omitted here (not in source) because `panelInEdit` is not
// accessible outside Grafana core. Variable interpolation is less specific as a result.
export const interpolateVariables = (text: string) => {
  return getTemplateSrv().replace(text);
};

export const getRequest = (api: APIEditorConfig) => {
  const endpoint = getEndpoint(interpolateVariables(api.endpoint));
  const url = new URL(endpoint);

  const requestHeaders: Record<string, string> = {};

  let request: BackendSrvRequest = {
    url: url.toString(),
    method: api.method,
    data: getData(api),
    headers: requestHeaders,
  };

  if (api.headerParams) {
    api.headerParams.forEach(([name, value]) => {
      requestHeaders[interpolateVariables(name)] = interpolateVariables(value);
    });
  }

  if (api.queryParams) {
    api.queryParams?.forEach(([name, value]) => {
      url.searchParams.append(interpolateVariables(name), interpolateVariables(value));
    });

    request.url = url.toString();
  }

  if (api.method === HttpRequestMethod.POST) {
    requestHeaders['Content-Type'] = api.contentType!;
  }

  requestHeaders['X-Grafana-Action'] = '1';
  request.headers = requestHeaders;

  return request;
};

const getData = (api: APIEditorConfig) => {
  let data: string | undefined = api.data ? interpolateVariables(api.data) : '{}';
  if (api.method === HttpRequestMethod.GET) {
    data = undefined;
  }

  return data;
};

const getEndpoint = (endpoint: string) => {
  const isRelativeUrl = endpoint.startsWith('/');
  if (isRelativeUrl) {
     
    const sanitizedRelativeURL = textUtil.sanitizeUrl(endpoint) as RelativeUrl;
    endpoint = createAbsoluteUrl(sanitizedRelativeURL, []);
  }

  return endpoint;
};
