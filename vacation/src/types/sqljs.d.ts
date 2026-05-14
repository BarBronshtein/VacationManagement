declare module 'sql.js' {
  export interface InitSqlJsOptions {
    locateFile?: (file: string) => string;
  }

  export type SqlJsDriver = unknown;

  export default function initSqlJs(
    options?: InitSqlJsOptions,
  ): Promise<SqlJsDriver>;
}
