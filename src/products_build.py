# Eseguito alla fine di build2.py: schede prodotto e pagina Prodotti con catalogo.
PRODS = json.load(open(os.path.join(D, "products.json")))
PBY = {p["slug"]: p for p in PRODS}
CATNAME = {k: n for k, n, _, _ in CATS}
CATICO = {k: ic for k, n, ic, _ in CATS}

def num(x):
    s = ("%g" % x).replace(".", ",")
    return s

def can_svg(p, big=False):
    """Barattolo illustrato con etichetta del prodotto (non riproduce la confezione reale)."""
    name = H.escape(p["nome"])
    words = p["nome"].split(" ")
    l1, l2 = (p["nome"], "") if len(p["nome"]) <= 14 else (" ".join(words[:-1]), words[-1])
    L = max(len(l1), len(l2))
    fs = min(30, round(290 / max(L, 1)))
    uid = p["slug"] + ("-b" if big else "")
    return f'''<svg class="pcan" viewBox="0 0 240 280" role="img" aria-label="{name}">
  <defs>
    <linearGradient id="m-{uid}" x1="0" x2="1"><stop offset="0" stop-color="#9DA1B6"/><stop offset=".18" stop-color="#EEF0F6"/><stop offset=".42" stop-color="#C6C9D8"/><stop offset=".78" stop-color="#F7F8FC"/><stop offset="1" stop-color="#8A8EA6"/></linearGradient>
    <linearGradient id="s-{uid}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".25" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  </defs>
  <ellipse cx="120" cy="262" rx="92" ry="12" fill="#14143A" opacity=".12"/>
  <path d="M28 46H212V246Q212 258 120 258Q28 258 28 246Z" fill="url(#m-{uid})"/>
  <path d="M28 78H212V214H28Z" fill="#fff"/>
  <path d="M28 78H212V96H28Z" fill="{p['col']}"/>
  <path d="M28 204H212V214H28Z" fill="{p['col']}" opacity=".55"/>
  <text x="120" y="122" text-anchor="middle" font-family="Hanken Grotesk,Arial,sans-serif" font-weight="700" font-size="13" letter-spacing="2" fill="#4B4D6B">{H.escape(p['marca'].upper())}</text>
  <text x="120" y="{158 if not l2 else 150}" text-anchor="middle" font-family="Archivo,Arial Black,sans-serif" font-style="italic" font-weight="900" font-size="{fs}" fill="#171796">{H.escape(l1)}</text>
  {f'<text x="120" y="176" text-anchor="middle" font-family="Archivo,Arial Black,sans-serif" font-style="italic" font-weight="900" font-size="{fs}" fill="#171796">{H.escape(l2)}</text>' if l2 else ''}
  <text x="120" y="194" text-anchor="middle" font-family="Hanken Grotesk,Arial,sans-serif" font-weight="600" font-size="11" fill="#4B4D6B">{H.escape(p['uso'])}</text>
  <path d="M28 46H212V258H28Z" fill="url(#s-{uid})" opacity=".9"/>
  <ellipse cx="120" cy="46" rx="92" ry="16" fill="#C9CCDA"/>
  <ellipse cx="120" cy="44" rx="80" ry="12" fill="#E8EAF2"/>
  <ellipse cx="120" cy="44" rx="80" ry="12" fill="none" stroke="#9DA1B6" stroke-width="2"/>
  <path d="M28 52Q14 36 40 22" fill="none" stroke="#3B3F5C" stroke-width="4" stroke-linecap="round"/>
</svg>'''

def badges(p):
    b = [p["uso"], p["finitura"]] + (["Tintometro"] if p["tinto"] else [])
    return "".join(f"<span>{H.escape(x)}</span>" for x in b if x)

def card(p):
    cats = " ".join(p["cats"])
    return f'''<a class="prc" href="p-{p["slug"]}.html" data-cats="{cats}">
  <div class="prv">{can_svg(p)}</div>
  <div class="prt"><span class="brand">{H.escape(p["marca"])}</span><h3>{H.escape(p["nome"])}</h3><p>{H.escape(p["breve"])}</p><div class="bdg">{badges(p)}</div></div>
</a>'''

# ---------- pagina Prodotti con catalogo ----------
used = [k for k, *_ in CATS if any(k in p["cats"] for p in PRODS)]
filt = '<button type="button" class="on" data-f="tutti">Tutti</button>' + "".join(f'<button type="button" data-f="{k}">{CATNAME[k]}</button>' for k in used)
grid = "".join(card(p) for p in PRODS)
pc = ""
for k, n, ic, d in CATS:
    items = [p for p in PRODS if k in p["cats"]]
    links = "".join(f'<a href="p-{p["slug"]}.html">{H.escape(p["nome"])}</a>' for p in items)
    pc += f'''<article class="pc fade" id="{k}">
  {ico(ic)}
  <h2>{n}</h2>
  <p>{d}</p>
  {f'<div class="plinks">{links}</div>' if links else '<!-- DA FORNIRE: prodotti per "' + n + '" -->'}
  <a class="more" href="preventivo.html#cat-{k}">Chiedi disponibilità {ico("PiArrowRightBold")}</a>
</article>'''
idx = "".join(f'<a href="#{k}">{n}</a>' for k, n, _, _ in CATS)
prod = phead("Prodotti", "Dalla pittura per la camera ai sistemi per l'edilizia. Se non lo vedi qui, chiedicelo: lo ordiniamo.", f'<nav class="chips fade" aria-label="Categorie">{idx}</nav>') + f'''
<section class="sec cat-s"><div class="wrap">
  <h2 class="split">Schede prodotto</h2>
  <div class="filt fade" role="group" aria-label="Filtra per categoria">{filt}</div>
  <div class="pgrid2" id="pgrid">{grid}</div>
</div></section>
<section class="sec"><div class="wrap"><h2 class="split" style="color:var(--blu);margin-bottom:48px">Tutte le categorie</h2><div class="pgrid">{pc}</div></div></section>
<section class="brands-s">
  <div class="wrap"><h2 class="split">I marchi che trattiamo</h2></div>
  <div class="marquee" aria-label="Marchi trattati"><div class="mtrack">{BRANDS_HTML}</div></div>
</section>
{open(os.path.join(D,"cta.html")).read()}'''
page("prodotti.html", "Prodotti · Rustichelli Color", "Schede prodotto di pitture per interni ed esterni, smalti, fondi, impermeabilizzanti e prodotti per il restauro. Marchi come Caparol, Festool e Fischer.", prod, "prodotti.html", [ORG])

# ---------- schede prodotto ----------
def row(label, val):
    return f"<tr><th scope=\"row\">{label}</th><td>{H.escape(val)}</td></tr>" if val else ""
for p in PRODS:
    conf = " ".join(f"<span>{H.escape(c.replace(' · ', ' – '))}</span>" for c in p["confezioni"])
    resa_txt = None
    if p["resa"]:
        a, b = p["resa"]; u = "m²/" + ("kg" if p["unita"] == "kg" else "l")
        resa_txt = (f"Circa {num(a)} {u}" if a == b else f"Circa {num(a)}–{num(b)} {u}") + " per mano"
    rows = "".join([row("Uso", p["uso"]), row("Supporti", p["supporti"]), row("Finitura", p["finitura"]), row("Colori", p["colori"]),
                    row("Resa", resa_txt), row("Diluizione", p["diluizione"]), row("Essiccazione", p["essiccazione"]),
                    row("Pulizia attrezzi", p["pulizia"]), row("VOC", p["voc"])])
    cat0 = p["cats"][0]
    crumbs = f'<a href="prodotti.html">Prodotti</a> / <a href="prodotti.html#{cat0}">{CATNAME[cat0]}</a>'
    calc = ""
    if p["resa"]:
        calc = f'''<section class="calc fade" id="calc" data-r1="{p['resa'][0]}" data-r2="{p['resa'][1]}" data-u="{p['unita']}" data-f="{','.join(str(x) for x in p['formati'])}">
      <h2>Quanto te ne serve</h2>
      <div class="crow">
        <label>Superficie<span class="inp"><input type="number" inputmode="decimal" min="1" value="40" id="cm2"><em>m²</em></span></label>
        <label>Mani<span class="seg2" id="cmani">{''.join(f'<button type="button" data-m="{m}"{" class=on" if m==p["mani"] else ""}>{m}</button>' for m in (1,2,3))}</span></label>
      </div>
      <p class="cres" id="cres" aria-live="polite"></p>
      <p class="cnote">Stima dalla resa indicata dal produttore. La quantità esatta dipende dal supporto: te la confermiamo in negozio.</p>
    </section>'''
    abb = [PBY[s] for s in p["abbinati"] if s in PBY]
    abbh = f'<section class="sec abb-s"><div class="wrap"><h2 class="split">Da usare con</h2><div class="pgrid2">{"".join(card(x) for x in abb)}</div></div></section>' if abb else ""
    price = (f'<div class="price"><span>Prezzo</span><b>da € {p["prezzo"]}</b></div>' if p["prezzo"] else '<!-- DA FORNIRE: prezzo -->')
    ld = {"@type": "Product", "name": p["nome"], "brand": {"@type": "Brand", "name": p["marca"]}, "description": p["breve"], "category": CATNAME[cat0],
          "url": BASE + f'p-{p["slug"]}.html'}
    body = f'''<section class="prhead" id="phead">
  <div class="wrap prgrid">
    <div class="prvis fade"><div class="tilt" id="tilt">{can_svg(p, True)}</div></div>
    <div class="prinfo">
      <nav class="crumbs fade" aria-label="Percorso">{crumbs}</nav>
      <span class="brand fade">{H.escape(p["marca"])}</span>
      <h1 class="disp split">{H.escape(p["nome"])}</h1>
      <p class="lead fade">{H.escape(p["breve"])}</p>
      <div class="bdg fade">{badges(p)}</div>
      {f'<div class="conf fade"><span class="lbl">Confezioni</span>{conf}</div>' if conf else ""}
      {price}
      <div class="cta fade"><a class="btn rosso" href="preventivo.html#cat-{cat0}">Chiedi disponibilità e prezzo</a><a class="btn ink" href="punti-vendita.html">Trova il negozio</a></div>
    </div>
  </div>
</section>
<section class="sec"><div class="wrap prdet">
  <div class="fade"><h2>Scheda tecnica</h2><table class="tech">{rows}</table><p class="src">Dati dalla scheda tecnica del produttore. Verifica sempre l'ultima versione prima dell'applicazione.</p></div>
  {calc}
</div></section>
{abbh}
{open(os.path.join(D,"cta.html")).read()}'''
    page(f'p-{p["slug"]}.html', f'{p["nome"]} · {p["marca"]} · Rustichelli Color', p["breve"], body, "prodotti.html", [ORG, ld], cls="prodpage lighthead")

# sitemap aggiornata
pages_all = ["", "servizi.html", "prodotti.html", "punti-vendita.html"] + [s["k"] + ".html" for s in STORES] + ["azienda.html", "preventivo.html", "privacy.html"] + [f'p-{p["slug"]}.html' for p in PRODS]
open(os.path.join(OUT, "sitemap.xml"), "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{BASE}{x}</loc></url>\n" for x in pages_all) + "</urlset>\n")
print("prodotti:", len(PRODS))
