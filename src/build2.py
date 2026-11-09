"""Build multipagina Rustichelli Color: estrae CSS/JS/parti dalla home e genera tutte le pagine."""
import json, os, re, shutil, urllib.parse, html as H
D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, "site2")
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(os.path.join(OUT, "assets"))
for f in os.listdir(os.path.join(D, "assets")):
    shutil.copy(os.path.join(D, "assets", f), os.path.join(OUT, "assets", f))
IC = json.load(open(os.path.join(D, "icons.json")))
BASE = "https://michtru.github.io/rustichelli-color/"
T = open(os.path.join(D, "home.tpl.html")).read()

def between(s, a, b, inc=False):
    i = s.index(a); j = s.index(b, i + len(a))
    return s[i:j + len(b)] if inc else s[i + len(a):j]

CSS = between(T, "<style>\n", "</style>")
SHADER = between(T, '<script id="fs" type="x-shader">', "</script>").strip()
JS = between(T, "<script>\nconst STORES", "</script>\n</body>")
JS = "const STORES" + JS
INTRO = between(T, '<div id="intro"', '<div class="cur" id="cur"></div>')
INTRO = '<div id="intro"' + INTRO
MAIN = between(T, '<main id="top">', "</main>")
MBAR = between(T, '<div class="mbar"', '<script id="fs"')
MBAR = '<div class="mbar"' + MBAR
SVC = open(os.path.join(D, "svc.html")).read().replace(' class="rv"', "")
LOOPS = open(os.path.join(D, "loops.css")).read()

STORES = [
 dict(k="lugo", city="Lugo", tag="Sede", addr="Via Piratello 108/1-2", cap="48022", town="Lugo", prov="RA", tel="0545 22075", wa="", col="#171796", ink="#fff",
      wk=[["8:00","12:30"],["14:30","19:00"]], sat=[["8:00","12:30"]],
      txt="La sede storica, dove tutto è cominciato. Banco vendita, tintometro e il magazzino da cui partono le forniture all'ingrosso."),
 dict(k="faenza", city="Faenza", tag="Punto vendita", addr="Via Marcello Malpighi 88/10", cap="48018", town="Faenza", prov="RA", tel="0546 623396", wa="", col="#ED2E38", ink="#fff",
      wk=[["8:00","12:30"],["14:30","18:30"]], sat=[["8:30","12:00"]],
      txt="Il punto vendita per Faenza e la collina: pitture, smalti, attrezzi e tinte preparate al momento."),
 dict(k="cervia", city="Cervia", tag="Punto vendita", addr="Via Levico 9", cap="48015", town="Cervia", prov="RA", tel="0544 71633", wa="", col="#F5E617", ink="#14143A",
      wk=[["8:00","12:30"],["14:30","19:00"]], sat=[["8:00","12:30"]],
      txt="Sulla costa, dove salsedine e sole mettono alla prova facciate, ringhiere e legno."),
 dict(k="riccione", city="Riccione", tag="Ingrosso", addr="Via San Leo 8", cap="47838", town="Riccione", prov="RN", tel="0541 607916", wa="", col="#0B0B4A", ink="#fff",
      wk=[["8:00","12:00"],["14:30","18:30"]], sat=[],
      txt="La filiale all'ingrosso per imprese e professionisti della Riviera."),
]
CATS = [
 ("interni","Pitture per interni","PiPaintRollerBold","Idropitture traspiranti e lavabili, pitture antimuffa e finiture decorative per pareti e soffitti."),
 ("esterni","Pitture per esterni","PiHouseLineBold","Pitture per facciate, rivestimenti silossanici e al quarzo, sistemi a cappotto."),
 ("smalti","Smalti","PiPaintBrushBold","Smalti all'acqua e a solvente, antiruggine e fondi per ferro, legno e metalli."),
 ("restauro","Restauro","PiBankBold","Calci, malte e prodotti per consolidare e recuperare edifici storici."),
 ("impermeabilizzazione","Impermeabilizzazione","PiDropBold","Guaine liquide e sistemi impermeabilizzanti per terrazzi, coperture e fondazioni."),
 ("isolamento-termico","Isolamento termico","PiThermometerSimpleBold","Pannelli e sistemi per isolare pareti e coperture e ridurre i consumi."),
 ("isolamento-acustico","Isolamento acustico","PiSpeakerSimpleSlashBold","Materiali per isolare dal rumore pareti, solai e pavimenti."),
 ("deumidificazione","Deumidificazione","PiDropSlashBold","Intonaci deumidificanti e trattamenti contro l'umidità di risalita."),
 ("cartongesso","Cartongesso","PiWallBold","Lastre, profili, stucchi e accessori per pareti e controsoffitti."),
 ("pavimenti","Pavimenti e rivestimenti","PiSquaresFourBold","Pavimenti resilienti, vernici e finiture per pavimenti e rivestimenti."),
 ("carta-da-parati","Carta da parati e cornici","PiFrameCornersBold","Carte da parati, cornici decorative e collanti."),
 ("antincendio","Antincendio","PiFireExtinguisherBold","Vernici e sistemi per la protezione al fuoco di legno, acciaio e cemento."),
 ("antinfortunistica","Antinfortunistica","PiHardHatBold","Guanti, mascherine, occhiali e abbigliamento da lavoro."),
 ("detergenti","Detergenti","PiSparkleBold","Pulitori e sverniciatori per superfici, attrezzi e cantiere."),
 ("elettroutensili","Elettroutensili","PiLightningBold","Levigatrici, aspiratori e utensili elettrici per preparare le superfici."),
 ("strumenti","Strumenti per applicazione","PiPaintBucketBold","Pennelli, rulli, spatole, nastri e tutto per stendere il colore."),
]
BRANDS = ["Caparol","Alligator","Festool","Bovelacci","Tarkett","Talken","Chreon","Sestriere Vernici","Renner","Akifix","Arexons","Henkel","Madras","Fidea","CIR Chimica Italiana Restauri","Befree Home","Tesa","Decor New Surfaces","Fischer","BB Distribuzione"]

ico = lambda n: f'<span class="ico">{IC[n]}</span>'
tel = lambda t: "tel:+39" + t.replace(" ", "")
full_addr = lambda s: f'{s["addr"]}, {s["cap"]} {s["town"]} ({s["prov"]})'
maps = lambda s: "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote("Rustichelli Color " + full_addr(s))
DAYS = ["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"]
def fmt(sl): return ", ".join(a.replace(":00","") + "–" + b.replace(":00","") for a, b in sl) if sl else "Chiuso"

NAV = [("servizi.html","Servizi"),("prodotti.html","Prodotti"),("punti-vendita.html","Punti vendita"),("azienda.html","Azienda")]
DRIPS = '<svg class="drips" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H100V4C97 4 96 12 94 12S92 4 88 4 84 17 81 17 79 4 72 4 66 9 63 9 61 4 52 4 46 20 43 20 41 4 33 4 27 13 24 13 22 4 14 4 9 15 6 15 4 4 0 4Z"/></svg>'

def header(active):
    nav = "".join(f'<a href="{h}"{" aria-current=page" if h==active else ""}>{t}</a>' for h, t in NAV)
    panel = '<a href="index.html">Home</a>' + "".join(f'<a href="{h}">{t}</a>' for h, t in NAV)
    return f'''<header id="hdr">
  <div class="wrap bar">
    <a class="logo" href="index.html" aria-label="Rustichelli Color, home"><img class="w" src="assets/logo-bianco.png" alt=""><img class="c" src="assets/logo.png" alt=""></a>
    <nav aria-label="Principale">{nav}</nav>
    <a class="btn rosso" href="preventivo.html">Chiedi un preventivo</a>
    <button class="menu-btn ico" type="button" aria-expanded="false" aria-controls="panel" aria-label="Apri il menu">{IC["PiListBold"]}</button>
  </div>
  <div class="panel" id="panel">{panel}<a class="btn rosso" href="preventivo.html">Chiedi un preventivo</a></div>
</header>'''

def footer():
    st = "".join(f'<a href="{s["k"]}.html">{s["city"]}</a> · <a href="{tel(s["tel"])}">{s["tel"]}</a><br>' for s in STORES)
    return f'''<footer>
  <div class="wrap">
    <div><img src="assets/logo-bianco.png" alt="Rustichelli Color" width="533" height="129">Rustichelli Color Srl<br>Via Piratello 108/1-2, 48022 Lugo (RA)</div>
    <div><strong>Punti vendita</strong>{st}</div>
    <div><strong>Sito</strong><a href="servizi.html">Servizi</a><br><a href="prodotti.html">Prodotti</a><br><a href="azienda.html">Azienda</a><br><a href="preventivo.html">Preventivo</a></div>
    <div><strong>Seguici</strong><a href="https://www.facebook.com/rustichellicolorsrl">Facebook</a><br><!-- DA FORNIRE: Instagram --></div>
    <div class="legal"><span>P.IVA e C.F. 02464580394</span><span>REA 204151</span><span>Capitale sociale 25.000 € i.v.</span><a href="privacy.html">Privacy e cookie</a></div>
  </div>
  <div class="mega" aria-hidden="true">Rustichelli</div>
</footer>'''

ORG = {"@type":"Organization","@id":BASE+"#org","name":"Rustichelli Color Srl","url":BASE,"logo":BASE+"assets/logo.png",
       "vatID":"IT02464580394","sameAs":["https://www.facebook.com/rustichellicolorsrl"]}
def store_ld(s):
    spec = [{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":a.zfill(5),"closes":b.zfill(5)} for a,b in s["wk"]]
    spec += [{"@type":"OpeningHoursSpecification","dayOfWeek":"Saturday","opens":a.zfill(5),"closes":b.zfill(5)} for a,b in s["sat"]]
    return {"@type":"HardwareStore","@id":BASE+s["k"]+".html#store","name":f'Rustichelli Color {s["city"]}',"url":BASE+s["k"]+".html",
            "telephone":"+39 "+s["tel"],"image":BASE+"assets/og.jpg","parentOrganization":{"@id":BASE+"#org"},
            "address":{"@type":"PostalAddress","streetAddress":s["addr"],"postalCode":s["cap"],"addressLocality":s["town"],"addressRegion":s["prov"],"addressCountry":"IT"},
            "openingHoursSpecification":spec}

def page(fname, title, desc, body, active=None, ld=None, intro=False, cls=""):
    canon = BASE + ("" if fname == "index.html" else fname)
    ldj = ""
    if ld: ldj = '<script type="application/ld+json">' + json.dumps({"@context":"https://schema.org","@graph":ld}, ensure_ascii=False) + "</script>"
    doc = f'''<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0B0B4A">
<title>{title}</title>
<meta name="description" content="{H.escape(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="Rustichelli Color">
<meta property="og:title" content="{H.escape(title)}">
<meta property="og:description" content="{H.escape(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{BASE}assets/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Rustichelli">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,100..125,700..900;1,100..125,800..900&family=Hanken+Grotesk:wght@400..600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<script>try{{if(sessionStorage.getItem("rc-nav")==="1")document.documentElement.classList.add("nav-in")}}catch(e){{}}</script>
{ldj}
</head>
<body class="{cls}">
<a class="skip" href="#contenuto">Vai al contenuto</a>
<div id="curtain" aria-hidden="true"><div class="cs">{DRIPS}</div></div>
{INTRO if intro else ""}
<div class="cur" id="cur"></div>
{header(active)}
<main id="contenuto">
{body}
</main>
{footer()}
{fill(MBAR)}
<script src="app.js"></script>
</body>
</html>'''
    open(os.path.join(OUT, fname), "w").write(doc)

def phead(title, lead="", extra=""):
    return f'''<section class="phead" id="phead">
  <div class="wrap"><h1 class="disp split">{title}</h1>{f'<p class="lead fade">{lead}</p>' if lead else ""}{extra}</div>
  {DRIPS}
</section>'''

def store_card(s):
    return f'''<article class="st fade">
  <h3><a href="{s["k"]}.html">{s["city"]}</a></h3><span class="tag">{s["tag"]}</span>
  <span class="state" data-open="{s["k"]}">&nbsp;</span>
  <span class="addr">{s["addr"]}<br>{s["cap"]} {s["town"]} ({s["prov"]})</span>
  <span class="today" data-today="{s["k"]}"></span>
  <div class="acts">
    <a class="call" href="{tel(s["tel"])}">{ico("PiPhoneBold")}Chiama</a>
    <a href="#" data-wa="{s["k"]}"><!-- DA FORNIRE: WhatsApp {s["city"]} -->{ico("PiWhatsappLogoBold")}WhatsApp</a>
    <a href="{maps(s)}">{ico("PiMapPinBold")}Indicazioni</a>
  </div>
</article>'''
STORECARDS = "".join(store_card(s) for s in STORES)

brand_items = ['<span class="cc">Caparol Center</span>'] + [f"<span>{b}</span>" for b in BRANDS[1:]]
BRANDS_HTML = "".join(brand_items) + "".join(x.replace("<span", '<span aria-hidden="true"', 1) for x in brand_items)
OPTS = "".join(f'<option value="{s["k"]}">{s["city"]}</option>' for s in STORES)
ROAD = "".join(f'<rect x="{x}" y="220" width="30" height="6" rx="3"/>' for x in range(0, 520, 60))
SVC = SVC.replace("{{ROAD}}", ROAD)

def fill(s):
    for k, v in dict(SVC=SVC, LOOPS=LOOPS, STORES=STORECARDS, BRANDS=BRANDS_HTML, OPTS=OPTS, ROAD=ROAD, STOREJSON=json.dumps(STORES, ensure_ascii=False),
                     CATS="".join(f'<a href="prodotti.html#{k}">{ico(ic)}<span>{n}</span></a>' for k, n, ic, _ in CATS)).items():
        s = s.replace("{{" + k + "}}", v)
    s = re.sub(r"\{\{(Pi\w+)\}\}", lambda m: IC[m.group(1)], s)
    return s

# ---------- CSS ----------
EXTRA_CSS = open(os.path.join(D, "inner.css")).read() + open(os.path.join(D, "hero.css")).read()
open(os.path.join(OUT, "style.css"), "w").write(fill(CSS) + EXTRA_CSS)

# ---------- JS ----------
js = fill(JS)
js = js.replace('$("#fs").textContent.trim()', "FS")
js = js.replace('function heroIn(){$("#h1").classList.add("in");', 'function heroIn(){if(!$("#h1"))return;$("#h1").classList.add("in");')
js = js.replace('const it=$("#intro");let seen=false;', 'const it=$("#intro");if(!it){heroIn();return}let seen=false;try{if(sessionStorage.getItem("rc-nav")==="1")seen=true}catch(e){}')
js = js.replace('const hdr=$("#hdr"),hero=$("#hero"),', 'const hdr=$("#hdr"),hero=$("#hero")||$("#phead"),')
js = js.replace('hdr.classList.toggle("solid",y>hh);','hdr.classList.toggle("solid",y>hh||document.body.classList.contains("lighthead"));')
js = js.replace('addEventListener("scroll",onScroll,{passive:true});','addEventListener("scroll",onScroll,{passive:true});onScroll();')
js = js.replace('const cv=$("#paint");const gl=', 'const cv=$("#paint");if(!cv)return;const gl=')
js = js.replace('lines=$$(".lines p");', 'lines=$$(".lines p");if(!sec)return;', 1)
js = js.replace('const svc=$("#svc");\n$("#next")', 'const svc=$("#svc");\nif(svc&&$("#next")){$("#next")')
js = js.replace('behavior:"smooth"});\n\n/* 1991 fill */', 'behavior:"smooth"})}\n\n/* 1991 fill */')
js = js.replace('const y91=$("#y91");\nio.observe(y91);', 'const y91=$("#y91");\nif(y91)io.observe(y91);')
js = js.replace('const form=$("#form"),msg=$("#msg");\nform.foto', 'const form=$("#form"),msg=$("#msg");\nif(form){\n{const h=decodeURIComponent(location.hash.slice(1));if(h&&[...form.store.options].some(o=>o.value===h))form.store.value=h;else if(h.startsWith("cat-")){const c=CATN[h.slice(4)];if(c&&form.msg)form.msg.value="Mi interessa: "+c+". "}}\nform.foto')
assert js.rstrip().endswith('});'), js[-200:]
js = js.rstrip() + "\n}\n"
js = "const FS=`" + SHADER + "`;\n" + "const CATN=" + json.dumps({k: n for k, n, _, _ in CATS}, ensure_ascii=False) + ";\n" + js
js += open(os.path.join(D, "nav.js")).read() + open(os.path.join(D, "can3d.js")).read()
for chk in ['if(!cv)return', 'if(!sec)return', 'if(y91)', 'if(form){', 'if(svc&&', 'if(!it){']:
    assert chk in js, chk
open(os.path.join(OUT, "app.js"), "w").write(js)

# ---------- HOME ----------
home = fill(MAIN)
home = home.replace('href="#preventivo">Chiedi un preventivo', 'href="preventivo.html">Chiedi un preventivo')
home = home.replace('<a class="btn ghost" href="#negozi">Trova il negozio</a>', '<a class="btn ghost" href="punti-vendita.html">Trova il negozio</a>')
aud_links = iter(["servizi.html#imprese", "servizi.html#progettisti", "servizi.html#casa"])
home = re.sub(r'<li class="fade"><a href="#preventivo">', lambda m: f'<li class="fade"><a href="{next(aud_links)}">', home)
home = home.replace('<h2 class="split">Non ti vendiamo solo il barattolo.</h2>', '<h2 class="split">Non ti vendiamo solo il barattolo.</h2>', 1)
home = home.replace('<div class="wrap drag">', '<div class="wrap drag"><a class="btn ink" href="servizi.html">Tutti i servizi</a>')
home = home.replace('<div class="badges fade"><span>Caparol Center</span><span>Rete Energia &amp; Habitat</span></div>', '<div class="badges fade"><span>Caparol Center</span><span>Rete Energia &amp; Habitat</span></div><a class="btn ghost fade" style="margin-top:30px" href="azienda.html">La nostra storia</a>')
home = home.replace('<a href="#negozi"><span class="ico">', '<a href="punti-vendita.html"><span class="ico">')
assert "{{" not in home
home_ld = [ORG] + [store_ld(s) for s in STORES]
page("index.html", "Rustichelli Color · Colorificio a Lugo, Faenza, Cervia e Riccione",
     "Pitture, vernici, smalti e attrezzature per imprese, progettisti e privati. Dal 1991 a Lugo, Faenza, Cervia e Riccione.",
     home, None, home_ld, intro=True, cls="home")

# ---------- PRODOTTI ----------
pc = "".join(f'''<article class="pc fade" id="{k}">
  {ico(ic)}
  <h2>{n}</h2>
  <p>{d}</p>
  <!-- DA FORNIRE: marchi e prodotti principali per "{n}" -->
  <a class="more" href="preventivo.html#cat-{k}">Chiedi disponibilità {ico("PiArrowRightBold")}</a>
</article>''' for k, n, ic, d in CATS)
idx = "".join(f'<a href="#{k}">{n}</a>' for k, n, _, _ in CATS)
prod = phead("Prodotti", "Dalla pittura per la camera ai sistemi per l'edilizia. Se non lo vedi in negozio, lo ordiniamo.", f'<nav class="chips fade" aria-label="Categorie">{idx}</nav>') + f'''
<section class="sec"><div class="wrap"><div class="pgrid">{pc}</div></div></section>
<section class="brands-s">
  <div class="wrap"><h2 class="split">I marchi che trattiamo</h2></div>
  <div class="marquee" aria-label="Marchi trattati"><div class="mtrack">{BRANDS_HTML}</div></div>
</section>
{open(os.path.join(D,"cta.html")).read()}'''
page("prodotti.html", "Prodotti · Rustichelli Color", "Pitture per interni ed esterni, smalti, restauro, impermeabilizzazione, isolamento, cartongesso, antincendio e attrezzi. Marchi come Caparol, Festool e Fischer.", prod, "prodotti.html", [ORG])

# ---------- SERVIZI ----------
arts = re.findall(r'<article>(.*?)</article>', SVC.replace("<article >", "<article>"), re.S)
if not arts: arts = re.findall(r'<article[^>]*>(.*?)</article>', SVC, re.S)
SV = [
 ("sopralluogo","Sopralluogo e preventivo gratuito",["Veniamo a vedere il lavoro, in casa o in cantiere, e misuriamo con te superfici e condizioni dei supporti.","Ti diciamo quali prodotti servono, in che quantità e con quale ciclo di applicazione. Il preventivo è gratuito e senza impegno."],"Prenota il sopralluogo"),
 ("tintometria","Tintometria",["Prepariamo la tinta al momento, scegliendo tra migliaia di colori delle mazzette dei produttori.","Puoi portarci un campione, un pezzo di intonaco o una foto: cerchiamo la tinta più vicina e la riproduciamo anche a distanza di tempo."],"Chiedi una tinta"),
 ("campionature","Campionature",["Vedi colori e finiture dal vivo, sulla superficie vera, prima di scegliere.","Per architetti e progettisti prepariamo campioni da portare al cliente."],"Chiedi i campioni"),
 ("corsi","Corsi di formazione",["Incontri periodici su prodotti nuovi e tecniche di applicazione, insieme ai produttori.","<!-- DA FORNIRE: calendario corsi -->Chiedi in negozio le prossime date."],"Chiedi le prossime date"),
 ("consegna","Consegna a domicilio e in cantiere",["Portiamo il materiale dove serve, a casa o direttamente in cantiere, così non perdi una mattina a caricare il furgone."],"Organizza una consegna"),
]
rows = ""
for i, (k, t, ps, cta) in enumerate(SV):
    loop = re.search(r'(<!--.*?-->\s*)?<div class="loop.*?</svg></div>', arts[i], re.S).group(0)
    rows += f'''<article class="srow fade{" rev" if i%2 else ""}" id="{k}">
  <div class="sv">{loop}</div>
  <div class="st2"><h2>{t}</h2>{"".join(f"<p>{p}</p>" for p in ps)}<a class="btn rosso" href="preventivo.html">{cta}</a></div>
</article>'''
AUD = [
 ("imprese","Imprese, industria e artigiani",["Forniture all'ingrosso con prezzi dedicati","Sopralluoghi e preventivi sul cantiere","Consegna in cantiere","Edilizia e bioedilizia, ferro e legno, carrozzerie e nautica"],"#171796","#fff"),
 ("progettisti","Architetti, ingegneri e designer",["Consulenza sulle finiture e sui cicli applicativi","Tintometria su misura","Campionature da portare al cliente","Schede tecniche dei produttori"],"#F5E617","#14143A"),
 ("casa","Casa, fai da te e belle arti",["Consigli su prodotti e quantità","Tinte preparate al momento","Attrezzi giusti per il lavoro","Colori e pennelli per belle arti"],"#ED2E38","#fff"),
]
aud = "".join(f'''<article class="ab fade" id="{k}" style="--bg:{bg};--fg:{fg}"><h3>{t}</h3><ul>{"".join(f"<li>{ico('PiCheckBold')}{x}</li>" for x in li)}</ul><a class="btn ghost" href="preventivo.html">Parla con noi</a></article>''' for k, t, li, bg, fg in AUD)
STEPS = [("Ci chiami o ci scrivi","Dal modulo, al telefono o passando in negozio."),("Veniamo sul posto","Guardiamo superfici, misure e condizioni."),("Ricevi il preventivo","Prodotti, quantità e costi, senza impegno.")]
steps = "".join(f'<li class="fade"><b>{a}</b><span>{b}</span></li>' for a, b in STEPS)
serv = phead("Servizi", "Non ti vendiamo solo il barattolo.") + f'''
<section class="sec"><div class="wrap">{rows}</div></section>
<section class="sec flow"><div class="wrap"><h2 class="split">Come funziona il sopralluogo</h2><ol class="steps">{steps}</ol></div></section>
<section class="sec"><div class="wrap"><h2 class="split" style="color:var(--blu)">Per chi lavoriamo</h2><div class="abs">{aud}</div></div></section>
{open(os.path.join(D,"cta.html")).read()}'''
page("servizi.html", "Servizi · Rustichelli Color", "Sopralluogo e preventivo gratuito, tintometria, campionature, corsi di formazione e consegna in cantiere.", serv, "servizi.html", [ORG])

# ---------- PUNTI VENDITA ----------
pv = phead("Punti vendita", "Quattro negozi tra Romagna e Riviera.") + f'''
<section class="sec"><div class="wrap"><div class="stores">{STORECARDS}</div></div></section>
{open(os.path.join(D,"cta.html")).read()}'''
page("punti-vendita.html", "Punti vendita · Rustichelli Color", "Colorifici Rustichelli Color a Lugo, Faenza, Cervia e Riccione: indirizzi, orari e telefoni.", pv, "punti-vendita.html", [ORG] + [store_ld(s) for s in STORES])

# ---------- NEGOZI ----------
for s in STORES:
    trs = ""
    for i, dn in enumerate(DAYS):
        sl = s["wk"] if i < 5 else (s["sat"] if i == 5 else [])
        trs += f'<tr data-day="{(i+1)%7}"><th scope="row">{dn}</th><td>{fmt(sl)}</td></tr>'
    others = "".join(f'<a href="{o["k"]}.html" style="--bg:{o["col"]};--fg:{o["ink"]}">{o["city"]}</a>' for o in STORES if o["k"] != s["k"])
    body = f'''<section class="phead shead" id="phead" style="--bg:{s["col"]};--fg:{s["ink"]}">
  <div class="wrap">
    <span class="kick fade">{s["tag"]}</span>
    <h1 class="disp split">{s["city"]}</h1>
    <p class="lead fade">{s["txt"]}</p>
    <span class="state fade" data-open="{s["k"]}">&nbsp;</span>
    <div class="cta fade"><a class="btn rosso" href="{tel(s["tel"])}">{ico("PiPhoneBold")}Chiama {s["tel"]}</a><a class="btn ghost" href="{maps(s)}">{ico("PiMapPinBold")}Indicazioni</a></div>
  </div>
  {DRIPS}
</section>
<section class="sec"><div class="wrap sinfo">
  <div class="fade"><h2>Orari</h2><table>{trs}</table></div>
  <div class="fade">
    <h2>Dove siamo</h2>
    <p class="addr">{s["addr"]}<br>{s["cap"]} {s["town"]} ({s["prov"]})</p>
    <ul class="clist">
      <li><a href="{tel(s["tel"])}">{ico("PiPhoneBold")}{s["tel"]}</a></li>
      <li><a href="#" data-wa="{s["k"]}"><!-- DA FORNIRE: WhatsApp {s["city"]} -->{ico("PiWhatsappLogoBold")}WhatsApp</a></li>
      <li><a href="{maps(s)}">{ico("PiMapPinBold")}Apri in Google Maps</a></li>
    </ul>
    <a class="btn rosso" href="preventivo.html#{s["k"]}">Chiedi un preventivo a {s["city"]}</a>
  </div>
</div></section>
<!-- DA FORNIRE: foto del negozio di {s["city"]} -->
<section class="sec others-s"><div class="wrap"><h2 class="split">Gli altri negozi</h2><div class="others fade">{others}</div></div></section>'''
    page(f'{s["k"]}.html', f'Colorificio a {s["city"]} · Rustichelli Color',
         f'Rustichelli Color a {s["city"]}: {full_addr(s)}. Tel. {s["tel"]}. Orari, indicazioni e preventivi.',
         body, "punti-vendita.html", [ORG, store_ld(s)], cls="store" + (" lighthead" if s["ink"] != "#fff" else ""))

# ---------- AZIENDA ----------
az_story = between(MAIN, '<section class="since" id="azienda">', '</section>', inc=True)
az_story = az_story.replace('<section class="since" id="azienda">', '<section class="since">')
az = phead("Dal 1991.", "Un colorificio di Lugo che è cresciuto senza cambiare modo di lavorare.") + f'''
{fill(az_story)}
<section class="sec"><div class="wrap two">
  <div class="fade"><h2>Caparol Center</h2><p>Siamo Caparol Center: trovi da noi la gamma dei sistemi Caparol per interni, facciate e isolamento, con l'assistenza per sceglierli e applicarli.</p><!-- DA FORNIRE: confermare cosa comporta essere Caparol Center --></div>
  <div class="fade"><h2>Energia &amp; Habitat</h2><p>Facciamo parte della rete d'impresa Energia &amp; Habitat, che riunisce aziende del settore edile e dell'efficienza energetica.</p><!-- DA FORNIRE: confermare descrizione della rete --></div>
</div></section>
<!-- DA FORNIRE: foto e nomi della squadra -->
<section class="sec facts-s"><div class="wrap">
  <h2 class="split">Dati aziendali</h2>
  <dl class="facts fade">
    <div><dt>Ragione sociale</dt><dd>Rustichelli Color Srl</dd></div>
    <div><dt>Sede legale</dt><dd>Via Piratello 108/1-2, 48022 Lugo (RA)</dd></div>
    <div><dt>P.IVA e codice fiscale</dt><dd>02464580394</dd></div>
    <div><dt>REA</dt><dd>204151</dd></div>
    <div><dt>Capitale sociale</dt><dd>25.000 € interamente versato</dd></div>
    <div><dt>Punti vendita</dt><dd>Lugo, Faenza, Cervia, Riccione</dd></div>
  </dl>
</div></section>
{open(os.path.join(D,"cta.html")).read()}'''
page("azienda.html", "Azienda · Rustichelli Color", "Dal 1991 l'eredità di Rustichelli e Contoli: la storia di Rustichelli Color, Caparol Center, e i dati aziendali.", az, "azienda.html", [ORG])

# ---------- PREVENTIVO ----------
q = fill(between(MAIN, '<section class="quote" id="preventivo">', '</section>', inc=True))
q = q.replace('<h2 class="split">Raccontaci il lavoro.</h2>', '<h2 class="split">Più dettagli ci dai, più il preventivo è preciso.</h2>')
q = q.replace('<a href="#negozi"><span class="ico">', '<a href="punti-vendita.html"><span class="ico">')
q = q.replace('<section class="quote" id="preventivo">', '<section class="quote qpage">')
prev = phead("Raccontaci il lavoro.", "Ti richiamiamo dal punto vendita che scegli, con un preventivo o per fissare un sopralluogo.") + q
page("preventivo.html", "Preventivo · Rustichelli Color", "Chiedi un preventivo o un sopralluogo gratuito: ti richiamiamo dal punto vendita più vicino.", prev, None, [ORG])

# ---------- PRIVACY ----------
priv = phead("Privacy e cookie") + f'''
<section class="sec"><div class="wrap legaltxt">
<p class="note">Bozza da far verificare a un consulente privacy prima della pubblicazione.</p>
<h2>Titolare del trattamento</h2>
<p>Rustichelli Color Srl, Via Piratello 108/1-2, 48022 Lugo (RA), P.IVA 02464580394. Email: <!-- DA FORNIRE -->[email da definire].</p>
<h2>Quali dati raccogliamo</h2>
<p>Con il modulo di richiesta preventivo raccogliamo nome, telefono, email se la indichi, punto vendita scelto, tipo di lavoro, metri quadri indicativi, il messaggio e le eventuali foto che alleghi.</p>
<h2>Perché li usiamo</h2>
<p>Solo per risponderti e prepararti il preventivo o fissare il sopralluogo che hai chiesto. La base giuridica è la tua richiesta (art. 6, par. 1, lett. b del Regolamento UE 2016/679). Non usiamo i dati per pubblicità e non li vendiamo.</p>
<h2>Per quanto tempo</h2>
<p>Per il tempo necessario a gestire la richiesta e l'eventuale rapporto commerciale che ne segue. <!-- DA FORNIRE: periodo di conservazione -->[periodo da definire]</p>
<h2>Chi li riceve</h2>
<p>Il personale del punto vendita che sceglierai e i fornitori tecnici che ci servono per far funzionare il sito e ricevere le richieste (hosting e servizio di invio del modulo), nominati responsabili del trattamento. <!-- DA FORNIRE: nomi dei fornitori --></p>
<h2>I tuoi diritti</h2>
<p>Puoi chiedere in ogni momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne l'uso o opporti, scrivendo al titolare. Puoi anche presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).</p>
<h2 id="cookie">Cookie</h2>
<p>Questo sito non usa cookie di profilazione né strumenti di statistica. Usa solo una memoria tecnica del browser (sessionStorage) per non ripeterti l'animazione iniziale a ogni pagina: si cancella da sola quando chiudi la scheda.</p>
<p>I caratteri tipografici sono caricati da Google Fonts: il tuo browser si collega ai server di Google, che ricevono il tuo indirizzo IP. I link a Google Maps e Facebook ti portano su quei siti, che hanno le loro regole.</p>
</div></section>'''
page("privacy.html", "Privacy e cookie · Rustichelli Color", "Informativa privacy e cookie del sito Rustichelli Color.", priv, None, [ORG])

# ---------- extra files ----------
shutil.copy(os.path.join(D, "site_manifest.json"), os.path.join(OUT, "manifest.webmanifest"))
pages = ["", "servizi.html", "prodotti.html", "punti-vendita.html"] + [s["k"] + ".html" for s in STORES] + ["azienda.html", "preventivo.html", "privacy.html"]
open(os.path.join(OUT, "sitemap.xml"), "w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{BASE}{p}</loc></url>\n" for p in pages) + "</urlset>\n")
open(os.path.join(OUT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
open(os.path.join(OUT, ".nojekyll"), "w").write("")
page("404.html", "Pagina non trovata · Rustichelli Color", "Pagina non trovata.", phead("Questa pagina non c'è.", "Forse è stata spostata. Riparti dalla home o chiedici direttamente.", '<div class="cta fade"><a class="btn rosso" href="index.html">Torna alla home</a><a class="btn ghost" href="punti-vendita.html">Punti vendita</a></div>'), None)
print(sorted(os.listdir(OUT)))
