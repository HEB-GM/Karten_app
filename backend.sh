#!/usr/bin/env bash
set -euo pipefail

# 1) Skript-Verzeichnis ermitteln und dahin wechseln
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 2) Alte Lock-Dateien entfernen
rm -f data.fs.lock data.fs.lock~

# 3) Virtualenv anlegen, falls noch nicht vorhanden
[ -d venv ] || python3 -m venv venv

# 4) venv aktivieren
# shellcheck disable=SC1091
source venv/bin/activate

# 5) Abhängigkeiten installieren
pip install flask ZODB flask-swagger-ui pytest

# 6) Tests mit In-Memory-DB laufen lassen
export TEST_DB=1
pytest tests.py
