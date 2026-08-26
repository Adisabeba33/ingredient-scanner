from pathlib import Path

src = Path('.github/workflows/tmp-royal-canin-cats-120-140.yml').read_text(encoding='utf-8')
marker = "          python - <<'PY'\n"
start = src.index(marker) + len(marker)
end = src.index("\n          PY\n", start)
block = src[start:end]
code = '\n'.join(line[10:] if line.startswith('          ') else line for line in block.splitlines()) + '\n'
compiled = compile(code, 'royal-canin-cats-renal-gi', 'exec')
exec(compiled, {'__name__': '__main__'})
