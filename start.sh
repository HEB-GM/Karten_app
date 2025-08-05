#!/usr/bin/env bash
set -euo pipefail

# Alte Lock-Dateien entfernen
rm -f data.fs.lock data.fs.lock~

# Virtualenv aktivieren
source venv/bin/activate

# (Optional) ORS-API-Key setzen:
# export ORS_API_KEY="DEIN_RICHTIGER_KEY"

echo "Starte Karten_APP auf http://127.0.0.1:5000/"
python3 app.py
