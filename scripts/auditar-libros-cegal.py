#!/usr/bin/env python3
"""Audita contra CEGAL (todostuslibros.com) cada libro que davidmateos recomienda con enlace de compra.

Lee título y autor de los enlaces «Ver «Título» en Amazon» (el parámetro k = título + autor), busca
el libro en CEGAL y lo clasifica:
  OK              un título que casa, del autor declarado
  AUTOR DISTINTO  el título existe pero con otro autor  -> dato probablemente mal
  NO ENCONTRADO   ni rastro en CEGAL                     -> revisar a mano (puede ser autoedición)
El veredicto es una pista, no una prueba: lo dudoso se mira a mano antes de tocar nada.
    python3 scripts/auditar-libros-cegal.py > auditoria.tsv
"""
import glob, html, re, sys, unicodedata, urllib.parse
sys.path.insert(0, "/Users/david/Documents/seo-webs/scripts")
import importlib.util
spec = importlib.util.spec_from_file_location("cegal", "/Users/david/Documents/seo-webs/scripts/cegal-buscar.py")
cegal = importlib.util.module_from_spec(spec); spec.loader.exec_module(cegal)

VACIAS = {"de","la","el","los","las","y","del","en","a","un","una","e","o","con","por","para","al","the","of"}
def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", " ", t)
def palabras(t):
    return {w for w in norm(t).split() if w not in VACIAS and len(w) > 1}
def apellidos(autor):
    partes = re.split(r",| y | e |&", autor)
    return [norm(p).split()[-1] for p in partes if norm(p).split()]

libros = {}
for f in sorted(glob.glob("blog/*.html")):
    s = open(f, encoding="utf-8").read()
    for href, tit in re.findall(r'class="book-buy"><a href="([^"]+)"[^>]*>Ver «(.*?)» en Amazon', s) + \
                     re.findall(r'<a href="(https://www\.amazon\.es/s\?[^"]+)"[^>]*>Ver «(.*?)» en Amazon', s):
        k = urllib.parse.parse_qs(urllib.parse.urlparse(html.unescape(href)).query).get("k", [""])[0]
        tit = html.unescape(tit)
        autor = k[len(tit):].strip() if k.startswith(tit) else ""
        libros.setdefault((tit, autor), set()).add(f.split("/")[-1])

print("veredicto\ttitulo\tautor_web\tencontrado_en_cegal\tpaginas")
for (tit, autor), pags in sorted(libros.items()):
    ap = apellidos(autor) if autor else []
    q = tit + (" " + ap[0] if ap else "")
    mejor, otro = None, None
    pt = palabras(tit)
    for slug in cegal.buscar(q, 8):
        fi = cegal.ficha(slug)
        if not pt or len(pt & palabras(fi["titulo"])) < max(1, min(2, len(pt))):
            continue
        a = norm(fi["autor"])
        if not ap or any(x in a for x in ap):
            mejor = fi; break
        otro = otro or fi
    if mejor:
        v, e = "OK", f'{mejor["titulo"]} | {mejor["autor"]} | {mejor["editorial"]}'
    elif otro:
        v, e = "AUTOR DISTINTO", f'{otro["titulo"]} | {otro["autor"]} | {otro["editorial"]}'
    else:
        v, e = "NO ENCONTRADO", ""
    print(f"{v}\t{tit}\t{autor}\t{e}\t{','.join(sorted(pags))}", flush=True)
