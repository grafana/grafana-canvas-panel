// Props that @grafana/ui added after 12.4. The plugin compiles against the 12.4 types, so these are passed
// by spreading the helpers' results: on 13.x the props keep working, and on 12.4 they are left out.
// See src/compat/index.ts before changing.
import { type IconName } from '@grafana/data';

/** Combobox `noOptionsMessage`, added in 13.0.0. 12.4 shows its default "No options found" text. */
export function noOptionsMessageProps(noOptionsMessage: string | undefined) {
  return noOptionsMessage === undefined ? {} : { noOptionsMessage };
}

/**
 * Field `useFieldset`, added in 13.0.0. 12.4's Field spreads unknown props onto its <div>, so only pass the prop
 * when it is set. 12.4's options builder never sets it.
 */
export function fieldsetProps(useFieldset: boolean | undefined) {
  return useFieldset === undefined ? {} : { useFieldset };
}

/** Reads `useFieldset` from an options editor item; 13.0.0+ builders set it, 12.4 ones do not. */
export function getUseFieldset(item: object): boolean | undefined {
  return 'useFieldset' in item && typeof item.useFieldset === 'boolean' ? item.useFieldset : undefined;
}

/** ComboboxOption `icon`, added in 13.0.0. 12.4 ignores it. */
export type ComboboxOptionIcon = { icon?: IconName };
