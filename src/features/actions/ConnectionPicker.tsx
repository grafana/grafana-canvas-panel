// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/actions/ConnectionPicker.tsx
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { ActionType, type DataSourcePluginMeta } from '@grafana/data';
import { t } from '@grafana/i18n';
import { getDataSourceInstanceList } from '@grafana/plugin-compat/datasources';
import { config } from '@grafana/runtime';
import { Select } from '@grafana/ui';

import { INFINITY_DATASOURCE_TYPE } from './utils';

interface ConnectionOption {
  label: string;
  value: string;
  description?: string;
  imgUrl?: string;
  icon?: string;
}

interface ConnectionPickerProps {
  actionType: ActionType;
  datasourceUid?: string;
  onChange: (connectionType: 'direct' | DataSourceListItem) => void;
  id?: string;
}

const DIRECT_OPTION_VALUE = 'direct';

// Slim list item returned by getDataSourceInstanceList; the type isn't exported by @grafana/data 13.1
export interface DataSourceListItem {
  uid: string;
  name: string;
  type: string;
  meta: DataSourcePluginMeta;
}

const getSupportedDataSources = (): Promise<DataSourceListItem[]> =>
  getDataSourceInstanceList({
    filter: (ds: DataSourceListItem) => ds.type === INFINITY_DATASOURCE_TYPE,
  });

export const ConnectionPicker = ({ actionType, datasourceUid, onChange, id }: ConnectionPickerProps) => {
  const [supportedDataSources, setSupportedDataSources] = useState<DataSourceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(config.featureToggles.vizActionsAuth));

  useEffect(() => {
    if (!config.featureToggles.vizActionsAuth) {
      return;
    }
    let cancelled = false;
    getSupportedDataSources()
      .then((list) => {
        if (!cancelled) {
          setSupportedDataSources(list);
        }
      })
      .catch((err) => console.error('ConnectionPicker: Failed to load datasources', err))
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const connectionOptions: ConnectionOption[] = useMemo(() => {
    const options: ConnectionOption[] = [
      {
        label: t('grafana-ui.action-editor.modal.connection-direct-label', 'Direct from browser'),
        value: DIRECT_OPTION_VALUE,
        description: t(
          'grafana-ui.action-editor.modal.connection-direct-description',
          'Make request directly from browser'
        ),
        icon: 'adjust-circle',
      },
    ];

    supportedDataSources.forEach((ds) => {
      options.push({
        label: ds.name,
        value: ds.uid,
        imgUrl: ds.meta.info.logos.small,
      });
    });

    // Keep a saved connection visible even if its datasource is missing or the list failed to load
    if (
      !isLoading &&
      actionType === ActionType.Infinity &&
      datasourceUid &&
      !supportedDataSources.some((ds) => ds.uid === datasourceUid)
    ) {
      options.push({
        label: datasourceUid,
        value: datasourceUid,
        description: t('grafana-ui.action-editor.modal.connection-unknown-description', 'Datasource not found'),
        icon: 'exclamation-triangle',
      });
    }

    return options;
  }, [supportedDataSources, isLoading, actionType, datasourceUid]);

  const getCurrentValue = () => {
    if (actionType === ActionType.Fetch) {
      return DIRECT_OPTION_VALUE;
    } else if (actionType === ActionType.Infinity && datasourceUid) {
      return datasourceUid;
    }
    return DIRECT_OPTION_VALUE;
  };

  const handleConnectionChange = (selectedValue: string) => {
    if (selectedValue === DIRECT_OPTION_VALUE) {
      onChange(DIRECT_OPTION_VALUE);
    } else {
      const selectedDatasource = supportedDataSources.find((ds) => ds.uid === selectedValue);
      if (selectedDatasource) {
        onChange(selectedDatasource);
      } else {
        console.error('ConnectionPicker: Could not find datasource with UID:', selectedValue);
      }
    }
  };

  const currentValue = getCurrentValue();

  return (
    <Select
      inputId={id}
      isLoading={isLoading}
      value={currentValue}
      options={connectionOptions}
      onChange={(selected) => handleConnectionChange(selected.value!)}
      placeholder={t('grafana-ui.action-editor.modal.connection-placeholder', 'Select connection')}
    />
  );
};
