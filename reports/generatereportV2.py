from pathlib import Path
import json
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "Reports"

def main():
    if not REPORTS.exists():
        print("Belum ada folder Reports.")
        return

    json_files = list(REPORTS.rglob("*.json"))
    print(f"Found {len(json_files)} JSON report file(s).")

    for file in json_files:
        try:
            data = json.loads(file.read_text(encoding="utf-8"))
            print(f"- {data.get('testName', file.name)}: {data.get('status', 'UNKNOWN')}")
        except Exception as exc:
            print(f"- {file.name}: ERROR - {exc}")

if __name__ == "__main__":
    main()
