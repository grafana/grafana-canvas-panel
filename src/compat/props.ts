// Props that @grafana/ui added after 12.4. The plugin compiles against the 12.4 types, so these are passed
// by spreading the helpers' results. Some are safely ignored by older components;
// useFieldset must only originate from a host options builder via getUseFieldset.
// See src/compat/index.ts before changing.
import { type IconName } from '@grafana/data';

/** Combobox `noOptionsMessage`, added in 13.0.0. 12.4 shows its default "No options found" text. */
export function noOptionsMessageProps(noOptionsMessage: string | undefined) {
  return noOptionsMessage === undefined ? {} : { noOptionsMessage };
}

/**
 * Field `useFieldset`, added in 13.1.0. Older Field components spread unknown props onto the DOM.
 * Only pass values obtained from getUseFieldset: older host builders never set this capability.
 */
export function fieldsetProps(useFieldset: boolean | undefined) {
  return useFieldset === undefined ? {} : { useFieldset };
}

/** Reads the host builder's fieldset capability; absent on pre-13.1 builders. */
export function getUseFieldset(item: object): boolean | undefined {
  return 'useFieldset' in item && typeof item.useFieldset === 'boolean' ? item.useFieldset : undefined;
}

/** ComboboxOption `icon`, added in 13.0.0. 12.4 ignores it. */
export type ComboboxOptionIcon = { icon?: IconName };
