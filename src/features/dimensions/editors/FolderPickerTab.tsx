// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/dimensions/editors/FolderPickerTab.tsx
import * as React from 'react';
import { css } from '@emotion/css';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Field, FilterInput, Combobox, useStyles2, type ComboboxOption } from '@grafana/ui';

import { MediaType, ResourceFolderName } from '../types';
import { getPublicOrAbsoluteUrl } from '../resource';
import { ICON_MANIFEST } from '../../../img/icons/manifest';
import { BG_MANIFEST } from '../../../img/bg/manifest';

import { ResourceCards } from './ResourceCards';

const getFolders = (mediaType: MediaType) => {
  if (mediaType === MediaType.Icon) {
    return [ResourceFolderName.Icon, ResourceFolderName.IOT, ResourceFolderName.Marker];
  } else {
    return [ResourceFolderName.BG];
  }
};

const getFolderIfExists = (folders: Array<ComboboxOption<string>>, path: string) => {
  return folders.find((folder) => path.startsWith(folder.value!)) ?? folders[0];
};

export interface ResourceItem {
  label: string;
  value: string; // includes folder
  search: string;
  imgUrl: string;
}

interface Props {
  value?: string;
  mediaType: MediaType;
  folderName: ResourceFolderName;
  newValue: string;
  setNewValue: Dispatch<SetStateAction<string>>;
  maxFiles?: number;
}

const MANIFEST: Record<string, Record<string, true>> = { ...ICON_MANIFEST, ...BG_MANIFEST };

export const FolderPickerTab = (props: Props) => {
  const { value, mediaType, folderName, newValue, setNewValue } = props;
  const styles = useStyles2(getStyles);

  const folders = getFolders(mediaType).map((v) => ({
    label: v,
    value: v,
  }));

  const [searchQuery, setSearchQuery] = useState<string>();

  const [currentFolder, setCurrentFolder] = useState<ComboboxOption<string>>(
    getFolderIfExists(folders, value?.length ? value : folderName)
  );

  const directoryIndex = useMemo<ResourceItem[]>(() => {
    const folder = currentFolder?.value;
    if (!folder) {
      return [];
    }
    return Object.keys(MANIFEST[folder] ?? {}).map((filename) => {
      const idx = filename.lastIndexOf('.');
      return {
        value: `${folder}/${filename}`,
        label: filename,
        search: (idx > 0 ? filename.substring(0, idx) : filename).toLowerCase(),
        imgUrl: getPublicOrAbsoluteUrl(`${folder}/${filename}`),
      };
    });
  }, [currentFolder]);

  const filteredIndex = useMemo<ResourceItem[]>(() => {
    if (!searchQuery) {
      return directoryIndex;
    }
    const q = searchQuery.toLowerCase();
    return directoryIndex.filter((card) => card.search.includes(q));
  }, [directoryIndex, searchQuery]);

  return (
    <>
      <Field>
        <Combobox
          options={folders}
          onChange={setCurrentFolder}
          value={currentFolder}
          aria-label={t('dimensions.folder-picker-tab.label-folder', 'Folder')}
        />
      </Field>
      <Field>
        <FilterInput
          value={searchQuery ?? ''}
          placeholder={t('dimensions.folder-picker-tab.placeholder-search', 'Search')}
          escapeRegex={false}
          onChange={(v) => {
            setSearchQuery(v);
          }}
        />
      </Field>
      {filteredIndex && (
        <div className={styles.cardsWrapper}>
          <ResourceCards cards={filteredIndex} onChange={(v) => setNewValue(v)} value={newValue} />
        </div>
      )}
    </>
  );
};

const getStyles = (_theme: GrafanaTheme2) => ({
  cardsWrapper: css({
    height: '30vh',
    minHeight: '50px',
    marginTop: '5px',
    maxWidth: '680px',
  }),
});
