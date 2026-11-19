from pathlib import Path

files = sorted(Path("src").rglob("*.sql"))
out = []
for f in files:
    text = f.read_text(encoding="utf-8").rstrip()
    if not text.upper().endswith("GO"):
        text += "\nGO"
    out.append(f"\n{text}\n")

Path("dist").mkdir(exist_ok=True)
Path("dist/Team_53.sql").write_text("\n".join(out), encoding="utf-8")