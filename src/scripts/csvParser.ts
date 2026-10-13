import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

export function parseCsv<T = Record<string, string>>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    bom: true,
  });

  return records as T[];
}