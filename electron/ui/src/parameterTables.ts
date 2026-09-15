import type {DfParameters, ParameterData, ParameterTable} from './types';

/** Older v3 inputs mix scalar metadata with column tables in df_parameters. */
function isParameterTable(value: ParameterData | undefined): value is ParameterTable {
  return value != null && Object.values(value).every(Array.isArray);
}

/** Return the original table so cell edits still update the scenario draft. */
export function getParameterTable(parameters: DfParameters | undefined, name: string): ParameterTable | undefined {
  const value = parameters?.[name];
  return isParameterTable(value) ? value : undefined;
}
