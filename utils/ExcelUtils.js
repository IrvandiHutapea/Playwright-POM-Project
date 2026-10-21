import XLSX from 'xlsx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getProjectRoot() {
  return path.resolve(__dirname, '..');
}

export function readExcel(fileName, sheetName) {
  const filePath = path.join(getProjectRoot(), 'test_data', fileName);
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(`Worksheet "${sheetName}" tidak ditemukan di ${fileName}`);
  }
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
}