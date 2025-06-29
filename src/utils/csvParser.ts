import Papa from 'papaparse';
import { CSVRow } from '../types';

export const parseCSV = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          const data = results.data as CSVRow[];
          validateCSVStructure(data);
          resolve(data.filter(row => row.Task && row.Description));
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
};

const validateCSVStructure = (data: CSVRow[]) => {
  if (!data || data.length === 0) {
    throw new Error('CSV file is empty or invalid');
  }

  const requiredColumns = ['Task', 'Description', 'Actions', 'Objects'];
  const firstRow = data[0];
  
  const missingColumns = requiredColumns.filter(column => 
    !(column in firstRow) || firstRow[column as keyof CSVRow] === undefined
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `CSV must contain the following columns: ${requiredColumns.join(', ')}. ` +
      `Missing: ${missingColumns.join(', ')}`
    );
  }
};