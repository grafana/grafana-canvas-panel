// Compile separately against versions that publish these APIs. Unlike the
// runtime adapters, these assignments must not assert away type differences.
import * as data from '@grafana/data';
import * as ui from '@grafana/ui';

import { type OptionalDataExports } from '../src/compat/data';
import { type OptionalUIExports } from '../src/compat/ui';

const hostData: Required<OptionalDataExports> = data;
const hostUI: Required<OptionalUIExports> = ui;

void hostData;
void hostUI;
