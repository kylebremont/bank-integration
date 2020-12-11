const csvParse = require('csv-parse/lib/sync'); // tslint:disable-line

// Helper for parsing CSV response body, including header row if present.
export const parseCSV = (
  data: string,
): Array<Array<string>> => csvParse(data);

// TODO: implement extractTransactions
