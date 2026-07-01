// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/query/state/PanelQueryRunner.ts
// TODO: Delete this shim — getNextRequestId inlined in Step 5
let counter = 0;
export const getNextRequestId = () => 'Q' + counter++;
