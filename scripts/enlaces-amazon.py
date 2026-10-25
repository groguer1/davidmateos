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

# --- Formatos antiguos de lista (posts de 2026 anteriores a la ficha book-item) -------------
# A) <h3>N. Título — Autor (edad)</h3> seguido de su <p>…</p>
# B) <p><strong>Título</strong> (Autor). Texto…</p>, con uno o dos libros por párrafo
LISTAS = ["post-15.html", "post-20.html", "post-24.html", "post-27.html"]
# Libros que el propio artículo desaconseja para su público: sin enlace de compra.
SIN_ENLACE = {"El guardián de espadas"}
CSS_LISTA = ('.book-buy { margin: -0.4rem 0 1.2rem; font-size: 0.9rem; }\n'
             '.book-buy a { color: #a5600f; font-weight: 600; text-decoration: underline; }\n'
             '.aviso-afiliado { font-size: 0.8rem; color: #8a7a6a; margin: 0 0 1rem; }\n')

def _a(titulo, autor):
    q = f"{titulo} {autor}".strip()
    url = "https://www.amazon.es/s?" + urllib.parse.urlencode({"k": q, "i": "stripbooks", "tag": TAG})
    return q, (f'<a href="{html.escape(url)}" target="_blank" rel="sponsored nofollow noopener">'
               f'Ver «{html.escape(titulo)}» en Amazon →</a>')

def procesa_lista(ruta, aplicar):
    s = open(ruta, encoding="utf-8").read()
    if "book-buy" in s:
        return 0
    n = 0
    def h3(m):
        nonlocal n
        cab = limpia(m.group(1))
        if "—" not in cab:
            return m.group(0)
        titulo, autor = [x.strip() for x in cab.split("—", 1)]
        titulo = re.sub(r"^\d+\.\s*", "", titulo)
        autor = re.sub(r"\s*\(.*?\)", "", autor).strip()
        if titulo in SIN_ENLACE:
            return m.group(0)
        q, a = _a(titulo, autor); print("   ", q); n += 1
        return m.group(0) + f'\n  <p class="book-buy">{a}</p>'
    s = re.sub(r"<h3>(.*?)</h3>\s*<p>.*?</p>", h3, s, flags=re.S)
    def par(m):
        nonlocal n
        pares = re.findall(r"<strong>([^<]+)</strong>\s*\(([^)]+)\)", m.group(0))
        if not pares:
            return m.group(0)
        enl = []
        for t, au in pares:
            q, a = _a(t.strip(), au.strip()); print("   ", q); n += 1; enl.append(a)
        return m.group(0) + '\n  <p class="book-buy">' + " · ".join(enl) + "</p>"
    s = re.sub(r"<p><strong>[^<]+</strong>\s*\([^)]+\).*?</p>", par, s, flags=re.S)
    if n:
        primero = s.find('<p class="book-buy">')
        ini = s.rfind("<h3>", 0, primero)
        ini = ini if ini != -1 else s.rfind("<p>", 0, primero)
        s = s[:ini] + AVISO + "\n\n  " + s[ini:]
        s = s.replace("</style>", CSS_LISTA + "</style>", 1)
    if aplicar and n:
        open(ruta, "w", encoding="utf-8").write(s)
    return n

if __name__ == "__main__":
    aplicar = "--aplicar" in sys.argv
    total = 0
    for f in sorted(glob.glob("blog/*.html")):
        n = procesa(f, False) if not aplicar else procesa(f, True)
        if n:
            print(f"{n:3d}  {f}")
            total += n
    for f in LISTAS:
        n = procesa_lista("blog/" + f, aplicar)
        if n:
            print(f"{n:3d}  blog/{f} (lista antigua)")
            total += n
    print("TOTAL", total, "(aplicado)" if aplicar else "(simulación)")
