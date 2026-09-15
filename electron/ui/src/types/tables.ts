/**
 * Input parameter tables store columns as arrays. Leading columns identify
 * facilities/options; later columns contain values or planning periods. Keep
 * empty tables, blank cells and numeric strings representable until validation.
 */

/** Common scalar types seen in tables */
export type Scalar = string | number | boolean | null;

/** Common cell value in data table arrays (often numbers or "" placeholders) */
export type Cell = string | number | null;

/** A column in a dataframe-like object */
export type Column<T = Cell> = T[];

/** Generic dataframe-like object: keys map to columns (arrays) */
export type DataFrameLike = Record<string, Column<Cell>>;

/**
 * Generic "dimension column + value columns" table shape.
 * Example:
 * {
 *   TreatmentCapacities: ["CB", "CB-EV"],
 *   J0: [0, 0],
 *   J1: [10000, 10000]
 * }
 */
export type DimensionIndexedTable<
  TDimensionKey extends string = string,
  TDimensionValue = string,
  TValue = Cell
> = DataFrameLike & {
  [K in TDimensionKey]: Column<TDimensionValue>;
} & Record<string, Column<TValue | TDimensionValue>>;

/** Generic output map where each key maps to a vector of values. */
export type SeriesByKey<TKey extends string = string, TValue = Cell> = Record<TKey, TValue[]>;

/**
 * `df_sets` is a dictionary of set-name -> list of set members.
 * Example: ProductionPads: ["PP01", "PP02", ...]
 */
export type DfSets = Record<string, string[]>;

/**
 * Many `df_parameters` entries look like:
 * {
 *   "ProductionPads": ["PP01", ...],
 *   "N01": [1, "", "", ""],
 *   ...
 * }
 * i.e. dimension columns (string arrays) + row vectors of Cell[].
 *
 * Some parameter tables can be empty objects {}.
 */
export type ParameterTable =
  | Record<string, string[] | Cell[]>
  | Record<string, never>;
 // empty object

/** Legacy v3 readers also saved scalar metadata under Units and DesalinationSurrogate. */
export type ScalarParameterData = Record<string, Cell>;
export type ParameterData = ParameterTable | ScalarParameterData;
export type DfParameters = Record<string, ParameterData>;

/** display_units is a map from variable/table name -> unit string */
export type DisplayUnits = Record<string, string>;

/**
 * Results tables are arrays-of-arrays:
 * - first row is often headers
 * - rows mix strings/numbers/null
 */
export type ResultsTable = Array<Array<Scalar>>;

/** Results.data is a map: tableName -> ResultsTable */
export interface ScenarioResultsData {
  [tableName: string]: ResultsTable;
}
