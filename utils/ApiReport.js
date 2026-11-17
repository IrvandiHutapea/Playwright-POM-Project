import fs from 'node:fs/promises';
import path from 'node:path';
const dir = path.resolve(process.cwd(), 'Reports', 'API');
const file = path.join(dir, 'api-test-details.jsonl');
export async function resetApiReport() {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, '', 'utf8');
}
export async function saveApiReport(record) {
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(
    file,
    JSON.stringify(record) + '\n',
    'utf8'
  );
}