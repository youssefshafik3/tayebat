from pathlib import Path

files = sorted(Path("src").rglob("*.sql"))
out = []
for f in files:
    text = f.read_text(encoding="utf-8").rstrip()
    if not text.upper().endswith("GO"):
        text += "\nGO"
    out.append(f"-- ===== {f} =====\n{text}\n")

header = "-- If you have the DB previously created please drop it first by uncommenting the following lines!\n-- DROP DATABASE LocalDeliveryMarketplace_Team_53;\n-- GO\n\n"
Path("dist").mkdir(exist_ok=True)
Path("dist/Team_53.sql").write_text(header + "\n".join(out), encoding="utf-8")