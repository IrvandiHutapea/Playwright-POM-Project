
import ExcelJS from 'exceljs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getProjectRoot() {
  return path.resolve(__dirname, '..');
}

function normalizeCellValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    if ('result' in value) {
      return normalizeCellValue(value.result);
    }

    if (Array.isArray(value.richText)) {
      return value.richText.map(item => item.text).join('');
    }

    if ('text' in value) {
      return value.text;
    }
  }

  return value;
}

export async function readExcel(fileName, sheetName) {
  const filePath = path.join(
    getProjectRoot(),
    'test_data',
    fileName
  );

  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(sheetName);

  if (!worksheet) {
    throw new Error(
      `Worksheet "${sheetName}" tidak ditemukan di ${fileName}`
    );
  }

  const headerRow = worksheet.getRow(1);

  const headers = [];

  for (let column = 1; column <= worksheet.columnCount; column++) {
    const header = normalizeCellValue(
      headerRow.getCell(column).value
    );

    headers.push(
      header === '' ? `__EMPTY_${column}` : String(header).trim()
    );
  }

  const data = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const record = {};

    headers.forEach((header, index) => {
      record[header] = normalizeCellValue(
        row.getCell(index + 1).value
      );
    });

    const isEmpty = Object.values(record).every(
      value => value === ''
    );

    if (!isEmpty) {
      data.push(record);
    }
  }

  return data;
}
