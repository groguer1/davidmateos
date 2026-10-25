#!/usr/bin/env python3
"""Pone un enlace «Ver en Amazon» en cada libro (<div class="book-item">) de los artículos.

El enlace es una BÚSQUEDA de Amazon por título y autor con el tag de afiliado: así no hay que
leer Amazon con ningún robot (lo prohíben sus normas) ni inventar un ASIN. davidmateos.com está
dado de alta como sitio en la cuenta de afiliados desde el 25/10/2026.

  python3 scripts/enlaces-amazon.py            muestra lo que haría (no toca nada)
  python3 scripts/enlaces-amazon.py --aplicar  escribe los cambios
Es idempotente: un book-item que ya lleva «book-buy» se salta.
"""
import glob, html, re, sys, urllib.parse

TAG = "letrasespanol-21"
AVISO = ('<p class="aviso-afiliado">En calidad de Afiliado de Amazon, obtengo ingresos por las compras '
         'adscritas que cumplen los requisitos aplicables.</p>')
CSS = ('.book-item .book-buy { margin: 0.7rem 0 0; font-size: 0.9rem; }\n'
       '.book-item .book-buy a { color: #a5600f; font-weight: 600; text-decoration: underline; }\n'
       '.aviso-afiliado { font-size: 0.8rem; color: var(--muted); margin: 0 0 1rem; }\n')

def limpia(t):
    return html.unescape(re.sub(r"<[^>]+>", "", t)).strip()

# Fichas cuyo «book-meta» lleva el año en vez del autor: el autor sale de aquí.
AUTOR_DE_PAGINA = {"libros-juegos-del-hambre-en-orden.html": "Suzanne Collins"}

def enlace(item, fichero=""):
    tit = re.search(r"<h3>(.*?)</h3>", item, re.S)
    if tit:  # formato de tarjeta: <h3>N. Título</h3><div class="book-meta">Autor · ...</div>
        titulo = re.sub(r"^\s*\d+\.\s*", "", limpia(tit.group(1)))
        meta = re.search(r'<div class="book-meta">(.*?)</div>', item, re.S)
        autor = limpia(meta.group(1)).split("·")[0].strip() if meta else ""
    else:    # formato de lista: <strong>Título</strong> — Autor<p ...>
        tit = re.search(r"<strong>(.*?)</strong>", item, re.S)
        if not tit:
            return None, None
        titulo = limpia(tit.group(1))
        resto = item[tit.end():item.find("<p", tit.end())] if "<p" in item[tit.end():] else ""
        autor = limpia(resto).split("—")[-1].strip() if "—" in resto else ""
    autor = re.split(r",\s*con ", autor)[0].strip()
    if re.match(r"^\d{4}", autor):
        autor = AUTOR_DE_PAGINA.get(fichero.split("/")[-1], "")
    q = f"{titulo} {autor}".strip()
    url = "https://www.amazon.es/s?" + urllib.parse.urlencode({"k": q, "i": "stripbooks", "tag": TAG})
    a = (f'<p class="book-buy"><a href="{html.escape(url)}" target="_blank" '
         f'rel="sponsored nofollow noopener">Ver «{html.escape(titulo)}» en Amazon →</a></p>')
    return q, a

def procesa(ruta, aplicar):
    s = open(ruta, encoding="utf-8").read()
    partes = re.split(r'(<div class="book-item">)', s)
    if len(partes) < 3:
        return 0
    cambios = 0
    out = [partes[0]]
    for i in range(1, len(partes), 2):
        cuerpo = partes[i + 1]
        cierre = cuerpo.find("</div>", cuerpo.find("</p>"))  # el </div> que cierra el item, tras su texto
        item = cuerpo[:cierre]
        if "book-buy" in item or cierre < 0:
            out += [partes[i], cuerpo]
            continue
        q, a = enlace(item, ruta)
        if not a:
            out += [partes[i], cuerpo]
            continue
        print(f"   {q}")
        out += [partes[i], item.rstrip() + "\n    " + a + "\n  " + cuerpo[cierre:]]
        cambios += 1
    s2 = "".join(out)
    if cambios and "aviso-afiliado" not in s2:
        s2 = s2.replace('<div class="book-item">', AVISO + '\n\n  <div class="book-item">', 1)
        s2 = s2.replace("</style>", CSS + "</style>", 1)
    if aplicar and cambios:
        open(ruta, "w", encoding="utf-8").write(s2)
    return cambios

if __name__ == "__main__":
    aplicar = "--aplicar" in sys.argv
    total = 0
    for f in sorted(glob.glob("blog/*.html")):
        n = procesa(f, False) if not aplicar else procesa(f, True)
        if n:
            print(f"{n:3d}  {f}")
            total += n
    print("TOTAL", total, "(aplicado)" if aplicar else "(simulación)")
