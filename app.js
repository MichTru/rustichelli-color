const FS=`#version 300 es
precision highp float;
uniform vec2 R;uniform float T;uniform vec4 P[8];
out vec4 o;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453)*2.-1.;}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
 return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)),dot(h2(i+1.),f-1.),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
float field(vec2 q){
 float t=T*.035;
 vec2 a=vec2(fbm(q+vec2(0,t)),fbm(q+vec2(5.2,1.3)-t));
 vec2 b=vec2(fbm(q+2.2*a+vec2(1.7,9.2)+t*.7),fbm(q+2.2*a+vec2(8.3,2.8)-t*.5));
 return fbm(q+2.6*b);
}
void main(){
 vec2 uv=gl_FragCoord.xy/R;float asp=R.x/R.y;
 vec2 q=vec2(uv.x*asp,uv.y);
 for(int i=0;i<8;i++){
  vec2 c0=vec2(P[i].x*asp,P[i].y);vec2 d=q-c0;float r2=dot(d,d);
  float f=exp(-r2*14.);
  q-=P[i].zw*f*.9;
  float s=length(P[i].zw)*6.;float c=cos(s*f),sn=sin(s*f);
  q=c0+mat2(c,-sn,sn,c)*(q-c0);
 }
 q*=1.35;
 float v=field(q);
 float e=.004;
 float vx=field(q+vec2(e,0)),vy=field(q+vec2(0,e));
 vec3 nrm=normalize(vec3((v-vx)/e*.05,(v-vy)/e*.05,1.));
 float k=v*2.2+.5;
 vec3 notte=vec3(.043,.043,.29),blu=vec3(.09,.09,.59),cel=vec3(.38,.45,.95),gia=vec3(.96,.9,.09),ros=vec3(.93,.18,.22),bia=vec3(.97,.97,1.);
 vec3 col=notte;
 col=mix(col,blu,smoothstep(.15,.42,k));
 col=mix(col,cel,smoothstep(.55,.63,k)*(1.-smoothstep(.66,.72,k)));
 col=mix(col,bia,smoothstep(.69,.72,k)*(1.-smoothstep(.74,.78,k)));
 col=mix(col,gia,smoothstep(.76,.8,k));
 col=mix(col,ros,smoothstep(.02,-.04,k)*.95);
 vec3 L=normalize(vec3(-.4,.6,.7));
 float dif=clamp(dot(nrm,L),0.,1.);
 float spec=pow(clamp(dot(reflect(-L,nrm),vec3(0,0,1)),0.,1.),28.);
 col*=.78+.32*dif;
 col+=spec*.35;
 col*=1.-.25*length(uv-.5);
 o=vec4(col,1.);
}`;
const CATN={"interni": "Pitture per interni", "esterni": "Pitture per esterni", "smalti": "Smalti", "restauro": "Restauro", "impermeabilizzazione": "Impermeabilizzazione", "isolamento-termico": "Isolamento termico", "isolamento-acustico": "Isolamento acustico", "deumidificazione": "Deumidificazione", "cartongesso": "Cartongesso", "pavimenti": "Pavimenti e rivestimenti", "carta-da-parati": "Carta da parati e cornici", "antincendio": "Antincendio", "antinfortunistica": "Antinfortunistica", "detergenti": "Detergenti", "elettroutensili": "Elettroutensili", "strumenti": "Strumenti per applicazione"};
const STORES=[{"k": "lugo", "city": "Lugo", "tag": "Sede", "addr": "Via Piratello 108/1-2", "cap": "48022", "town": "Lugo", "prov": "RA", "tel": "0545 22075", "wa": "", "col": "#171796", "ink": "#fff", "wk": [["8:00", "12:30"], ["14:30", "19:00"]], "sat": [["8:00", "12:30"]], "txt": "La sede storica, dove tutto è cominciato. Banco vendita, tintometro e il magazzino da cui partono le forniture all'ingrosso."}, {"k": "faenza", "city": "Faenza", "tag": "Punto vendita", "addr": "Via Marcello Malpighi 88/10", "cap": "48018", "town": "Faenza", "prov": "RA", "tel": "0546 623396", "wa": "", "col": "#ED2E38", "ink": "#fff", "wk": [["8:00", "12:30"], ["14:30", "18:30"]], "sat": [["8:30", "12:00"]], "txt": "Il punto vendita per Faenza e la collina: pitture, smalti, attrezzi e tinte preparate al momento."}, {"k": "cervia", "city": "Cervia", "tag": "Punto vendita", "addr": "Via Levico 9", "cap": "48015", "town": "Cervia", "prov": "RA", "tel": "0544 71633", "wa": "", "col": "#F5E617", "ink": "#14143A", "wk": [["8:00", "12:30"], ["14:30", "19:00"]], "sat": [["8:00", "12:30"]], "txt": "Sulla costa, dove salsedine e sole mettono alla prova facciate, ringhiere e legno."}, {"k": "riccione", "city": "Riccione", "tag": "Ingrosso", "addr": "Via San Leo 8", "cap": "47838", "town": "Riccione", "prov": "RN", "tel": "0541 607916", "wa": "", "col": "#0B0B4A", "ink": "#fff", "wk": [["8:00", "12:00"], ["14:30", "18:30"]], "sat": [], "txt": "La filiale all'ingrosso per imprese e professionisti della Riviera."}];
const I={clock:`<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm68-84a12,12,0,0,1-12,12H128a12,12,0,0,1-12-12V72a12,12,0,0,1,24,0v44h44A12,12,0,0,1,196,128Z"></path></svg>`,x:`<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>`,list:`<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,76H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24ZM216,180H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"></path></svg>`};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine=matchMedia("(pointer:fine)").matches;

/* split words */
$$(".split").forEach(el=>{let i=0;el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="w"><span style="--i:${i++}">${w}</span></span>`).join(" ")});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.2,rootMargin:"0px 0px -6% 0px"});
$$(".split,.fade").forEach(el=>{if(el.closest(".hero"))return;io.observe(el)});
function heroIn(){if(!$("#h1"))return;$("#h1").classList.add("in");document.dispatchEvent(new Event("hero-in"));setTimeout(()=>{$("#hlead").classList.add("in");$("#hcta").classList.add("in")},$("#paintTitle")?1700:450)}
(function(){
  const it=$("#intro");if(!it){heroIn();return}let seen=false;try{if(sessionStorage.getItem("rc-nav")==="1")seen=true}catch(e){}try{seen=sessionStorage.getItem("rc-intro")==="1"}catch(e){}
  if(reduce||seen){it.remove();requestAnimationFrame(()=>setTimeout(heroIn,150));return}
  document.documentElement.classList.add("intro-on");
  const T=[];const at=(ms,f)=>T.push(setTimeout(f,ms));let done=false;
  function end(){if(done)return;done=true;T.forEach(clearTimeout);it.classList.add("s1","s2","s3");document.documentElement.classList.remove("intro-on");setTimeout(heroIn,350);setTimeout(()=>it.remove(),1300);try{sessionStorage.setItem("rc-intro","1")}catch(e){}}
  at(250,()=>it.classList.add("s1"));
  at(850,()=>it.classList.add("s2"));
  at(2200,end);
  it.addEventListener("click",end);
})();

/* header */
const hdr=$("#hdr"),hero=$("#hero")||$("#phead"),mbar=$("#mbar"),mb=$(".menu-btn"),panel=$("#panel");let lastY=0;
function onScroll(){const y=scrollY,hh=hero.offsetHeight-80;
  hdr.classList.toggle("solid",y>hh||document.body.classList.contains("lighthead"));
  hdr.classList.toggle("hide",y>hh&&y>lastY&&!panel.classList.contains("on"));
  mbar.classList.toggle("on",y>hero.offsetHeight*.6);lastY=y}
addEventListener("scroll",onScroll,{passive:true});onScroll();
mb.onclick=()=>{const on=panel.classList.toggle("on");hdr.classList.toggle("menu",on);mb.setAttribute("aria-expanded",on);mb.setAttribute("aria-label",on?"Chiudi il menu":"Apri il menu");mb.innerHTML=on?I.x:I.list;document.body.style.overflow=on?"hidden":""};
panel.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{if(panel.classList.contains("on"))mb.click()}));

/* button ink follows pointer */
$$(".btn,.cats a").forEach(b=>b.addEventListener("pointerenter",e=>{const r=b.getBoundingClientRect();b.style.setProperty("--x",e.clientX-r.left+"px");b.style.setProperty("--y",e.clientY-r.top+"px")}));

/* cursor */
if(fine&&!reduce){const c=$("#cur");let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y;
  addEventListener("pointermove",e=>{x=e.clientX;y=e.clientY});
  document.addEventListener("pointerover",e=>c.classList.toggle("big",!!e.target.closest("a,button,label")));
  (function f(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(f)})();}

/* WebGL paint */
(function(){
  const cv=$("#paint");if(!cv)return;const gl=cv.getContext("webgl2",{antialias:false,powerPreference:"high-performance"});
  if(!gl||reduce){document.documentElement.classList.add("nogl");return}
  const vs=`#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0,1);}`;
  function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(x));return null}return x}
  const v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,FS);
  if(!v||!f){document.documentElement.classList.add("nogl");return}
  const pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const al=gl.getAttribLocation(pr,"a");gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  const uR=gl.getUniformLocation(pr,"R"),uT=gl.getUniformLocation(pr,"T"),uP=gl.getUniformLocation(pr,"P");
  const N=8,pts=new Float32Array(N*4);let head=0;
  const scale=innerWidth<700?.5:.6;
  function size(){const w=cv.clientWidth,h=cv.clientHeight;cv.width=Math.max(2,w*scale|0);cv.height=Math.max(2,h*scale|0);gl.viewport(0,0,cv.width,cv.height)}
  size();addEventListener("resize",size);
  let last=null,lastT=0;
  function push(x,y,dx,dy){pts[head*4]=x;pts[head*4+1]=y;pts[head*4+2]=dx;pts[head*4+3]=dy;head=(head+1)%N}
  function move(e){const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=1-(e.clientY-r.top)/r.height;
    const now=performance.now();if(!last){last=[x,y];lastT=now;return}
    if(now-lastT>16){let dx=x-last[0],dy=y-last[1];const m=Math.hypot(dx,dy);if(m>.002){const k=Math.min(1,.12/m);push(x,y,dx*k*1.4,dy*k*1.4)}lastT=now;last=[x,y]}}
  hero.addEventListener("pointermove",move,{passive:true});
  hero.addEventListener("pointerleave",()=>last=null);
  hero.addEventListener("pointerdown",e=>{last=null;move(e)});
  let vis=true;new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(hero);
  const t0=performance.now();let tick=0;
  function frame(now){
    requestAnimationFrame(frame);
    if(!vis||document.hidden)return;
    for(let i=0;i<N;i++){pts[i*4+2]*=.975;pts[i*4+3]*=.975}
    tick++;if(tick%14===0&&!last){const s=now/1000;push(.5+Math.cos(s*.5)*.3,.5+Math.sin(s*.7)*.25,Math.cos(s*.9)*.03,Math.sin(s*1.1)*.03)}
    gl.uniform2f(uR,cv.width,cv.height);gl.uniform1f(uT,(now-t0)/1000+20.);gl.uniform4fv(uP,pts);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  requestAnimationFrame(frame);
})();

/* can story */
(function(){
  const sec=$("#story"),stage=$(".stage"),can=$("#can"),lid=$("#lid"),stream=$("#stream"),fill=$("#pourfill"),top=$("#paintTop"),lip=$("#lip"),lines=$$(".lines p");if(!sec)return;
  const cl=(x,a,b)=>Math.min(1,Math.max(0,(x-a)/(b-a)));
  const ease=t=>1-Math.pow(1-t,3);
  function upd(p){
    const enter=ease(cl(p,0,.14)),lidp=ease(cl(p,.18,.36)),tilt=ease(cl(p,.38,.56)),pour=cl(p,.52,.72),flood=ease(cl(p,.7,.95));
    can.style.transform=`translate(-50%,-50%) translateY(${(1-enter)*24-tilt*6}vh) translateX(${tilt*12}vw) scale(${.82+enter*.18}) rotate(${-tilt*68}deg)`;
    lid.style.transform=`translate(${lidp*190}px,${-lidp*280}px) rotate(${lidp*85}deg)`;
    lid.style.opacity=1-cl(p,.31,.38);
    top.setAttribute("opacity",cl(p,.28,.34));
    const sr=stage.getBoundingClientRect(),lr=lip.getBoundingClientRect();
    const x=lr.left-sr.left,y=lr.top-sr.top,H=sr.height,w=Math.max(10,Math.min(34,sr.width*.07));
    const end=y+(H-y+40)*pour;
    stream.setAttribute("d",`M${x} ${y} C ${x-26} ${y+30}, ${x-30} ${y+60}, ${x-30} ${Math.max(y+60,end)}`);
    stream.setAttribute("stroke-width",w);
    stream.style.opacity=pour>0&&tilt>.85?1-cl(p,.9,.97):0;
    fill.style.clipPath=`circle(${flood*160}% at ${((x-30)/sr.width*100).toFixed(1)}% 100%)`;
    can.style.opacity=1-cl(p,.9,.98);
    lines.forEach(l=>{const[a,b]=l.dataset.r.split(",").map(Number);l.classList.toggle("on",p>=a&&p<b)});
  }
  if(reduce){upd(.12);lines[0].classList.add("on");return}
  const DUR=7000,HOLD=1600;let vis=false,start=null,raf=0;
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis&&!raf){start=null;raf=requestAnimationFrame(loop)}},{threshold:.35}).observe(sec);
  function loop(now){
    if(!vis||document.hidden){raf=0;return}
    if(start===null)start=now;
    const t=now-start;
    if(t<DUR)upd(t/DUR);
    else if(t<DUR+HOLD){upd(1);if(t>DUR+HOLD-600)fill.classList.add("out")}
    else{start=now;fill.classList.remove("out");upd(0)}
    raf=requestAnimationFrame(loop);
  }
  upd(0);
})();

/* services carousel buttons */
const svc=$("#svc");
if(svc&&$("#next")){$("#next").onclick=()=>svc.scrollBy({left:svc.querySelector("article").offsetWidth+22,behavior:"smooth"});
$("#prev").onclick=()=>svc.scrollBy({left:-(svc.querySelector("article").offsetWidth+22),behavior:"smooth"})}

/* 1991 fill */
const y91=$("#y91");
if(y91)io.observe(y91);

/* stores */
function now(){const p=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Rome",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());const g=k=>p.find(x=>x.type===k).value;return{d:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday")),m:(+g("hour")%24)*60+ +g("minute")}}
const mm=s=>{const[h,m]=s.split(":").map(Number);return h*60+m};
const slots=(s,d)=>d>=1&&d<=5?s.wk:d===6?s.sat:[];
const fmt=sl=>sl.length?sl.map(([a,b])=>a.replace(":00","")+"–"+b.replace(":00","")).join(", "):"Chiuso";
function states(){const{d,m}=now();STORES.forEach(s=>{const sl=slots(s,d),open=sl.some(([a,b])=>m>=mm(a)&&m<mm(b));
  $$(`[data-open="${s.k}"]`).forEach(el=>{el.classList.toggle("open",open);el.textContent=open?"Aperto ora":"Chiuso ora"});
  $$(`[data-today="${s.k}"]`).forEach(el=>el.innerHTML=`<span class="ico">${I.clock}</span>Oggi `+fmt(sl))})}
states();setInterval(states,60000);

/* sheet */
const sheet=$("#sheet"),sT=$("#sheetT"),sL=$("#sheetL");
const tel=t=>"tel:+39"+t.replace(/\s/g,"");
const maps=s=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent("Rustichelli Color "+s.addr+" "+s.cap);
function openSheet(kind){
  sT.textContent={call:"Chi vuoi chiamare?",wa:"Scrivi su WhatsApp",map:"Dove vuoi andare?"}[kind];
  sL.innerHTML=STORES.map(s=>kind==="call"?`<a href="${tel(s.tel)}">${s.city}<span>${s.tel}</span></a>`:kind==="wa"?`<a href="${s.wa||"#"}">${s.city}<span>${s.wa?"Apri chat":"In arrivo"}</span></a>`:`<a href="${maps(s)}">${s.city}<span>${s.addr}</span></a>`).join("");
  sheet.classList.add("on");sheet.querySelector(".x").focus();
}
$$("[data-sheet]").forEach(b=>b.onclick=()=>openSheet(b.dataset.sheet));
$$("[data-close]").forEach(b=>b.onclick=()=>sheet.classList.remove("on"));
addEventListener("keydown",e=>{if(e.key==="Escape")sheet.classList.remove("on")});

/* form */
const form=$("#form"),msg=$("#msg");
if(form){
{const h=decodeURIComponent(location.hash.slice(1));if(h&&[...form.store.options].some(o=>o.value===h))form.store.value=h;else if(h.startsWith("cat-")){const c=CATN[h.slice(4)];if(c&&form.msg)form.msg.value="Mi interessa: "+c+". "}}
form.foto.addEventListener("change",()=>{const n=form.foto.files.length;$("#fileTxt").textContent=n?(n===1?"1 foto aggiunta":n+" foto aggiunte"):"Aggiungi foto del lavoro"});
form.addEventListener("submit",e=>{e.preventDefault();
  const bad=[form.nome,form.tel].find(x=>!x.value.trim());
  if(bad){msg.textContent=bad===form.nome?"Scrivi il tuo nome.":"Lascia un numero di telefono per essere richiamato.";bad.focus();return}
  if(!form.privacy.checked){msg.textContent="Serve il consenso privacy per inviare la richiesta.";form.privacy.focus();return}
  /* DA FORNIRE: endpoint di invio */
  msg.textContent="L'invio non è ancora attivo: chiama il punto vendita per ora.";});
}

/* transizione tra pagine */
(function(){
  const c=$("#curtain");if(!c)return;
  const root=document.documentElement;
  if(root.classList.contains("nav-in")){
    try{sessionStorage.removeItem("rc-nav")}catch(e){}
    requestAnimationFrame(()=>requestAnimationFrame(()=>{root.classList.remove("nav-in");c.classList.add("lift")}));
  }
  document.addEventListener("click",e=>{
    const a=e.target.closest("a");
    if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target==="_blank"||a.hasAttribute("download"))return;
    const href=a.getAttribute("href");
    if(!href||href.startsWith("#")||/^[a-z]+:/i.test(href))return;
    const url=new URL(href,location.href);
    if(url.origin!==location.origin||url.pathname===location.pathname)return;
    if(reduce)return;
    e.preventDefault();
    try{sessionStorage.setItem("rc-nav","1")}catch(err){}
    if(panel&&panel.classList.contains("on"))mb.click();
    c.classList.remove("lift");c.classList.add("down");
    setTimeout(()=>{location.href=url.href},600);
  });
  addEventListener("pageshow",e=>{if(e.persisted){c.classList.remove("down");c.classList.add("lift");root.classList.remove("nav-in")}});
})();

/* hero: tipografia dipinta */
(function(){
  const host=$("#paintTitle");if(!host)return;
  const cv=host.querySelector("canvas"),g=cv.getContext("2d");
  if(!g){document.documentElement.classList.add("nopaint");return}
  const FONT=s=>`italic 900 ${s}px Archivo, "Arial Black", sans-serif`;
  const C={blu:"#171796",bluL:"#4B4BE6",bluD:"#07074A",gia:"#F5E617",giaL:"#FFF59A",giaD:"#C9B400",ros:"#ED2E38",rosD:"#B3121C",rosL:"#FF7A80"};
  const mk=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c};
  function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function noise1(seed,k){const r=rng(seed),v=Array.from({length:k+2},()=>r()*2-1);return t=>{const x=Math.min(.9999,Math.max(0,t))*k,i=x|0,f=x-i,u=f*f*(3-2*f);return v[i]*(1-u)+v[i+1]*u}}
  function path(xa,ya,xb,yb,bend,n){const p=[];for(let i=0;i<=n;i++){const t=i/n;p.push([xa+(xb-xa)*t,ya+(yb-ya)*t-Math.sin(t*Math.PI)*bend])}return p}
  function frameAt(P,i){const n=P.length-1,a=P[Math.max(0,i-1)],c=P[Math.min(n,i+1)];let tx=c[0]-a[0],ty=c[1]-a[1];const l=Math.hypot(tx,ty)||1;return[tx/l,ty/l]}
  function along(ctx,P,o,t0,t1,wob,ph){const n=P.length-1;let st=false;for(let i=Math.floor(t0*n);i<=Math.floor(t1*n);i++){const[tx,ty]=frameAt(P,i),oo=o+Math.sin(i/n*7+ph)*wob,x=P[i][0]-ty*oo,y=P[i][1]+tx*oo;st?ctx.lineTo(x,y):(ctx.moveTo(x,y),st=true)}}

  function brushPoly(P,w,seed,tEnd){
    const n=P.length-1,nl=noise1(seed,9),nr=noise1(seed+1,9),hl=noise1(seed+2,70),hr=noise1(seed+3,70),L=[],R=[];
    const last=Math.floor(tEnd*n);
    for(let i=0;i<=last;i++){const t=i/n,[tx,ty]=frameAt(P,i);
      const tap=Math.min(1,.84+t*5)*(t>tEnd-.2?Math.max(.3,1-(t-(tEnd-.2))/.2*.7):1);
      const a=w/2*tap*(1+nl(t)*.08+hl(t)*.03),b=w/2*tap*(1+nr(t)*.08+hr(t)*.03);
      L.push([P[i][0]+ty*a,P[i][1]-tx*a]);R.push([P[i][0]-ty*b,P[i][1]+tx*b])}
    const p=new Path2D();p.moveTo(L[0][0],L[0][1]);
    for(const q of L)p.lineTo(q[0],q[1]);for(let i=R.length-1;i>=0;i--)p.lineTo(R[i][0],R[i][1]);
    const[sx,sy]=P[0],[tx,ty]=frameAt(P,0),r=w/2*.84,cn=noise1(seed+5,8);
    for(let k=1;k<24;k++){const a=k/24*Math.PI,rr=r*(1+cn(k/24)*.06);p.lineTo(sx+ty*(-Math.cos(a))*rr-tx*Math.sin(a)*rr*.55,sy-tx*(-Math.cos(a))*rr-ty*Math.sin(a)*rr*.55)}
    p.closePath();return p;
  }
  function streaks(ctx,P,w,seed,cols,count,aMin,aMax,thMin,thMax,tA,tB){
    const r=rng(seed);ctx.lineCap="round";
    for(let k=0;k<count;k++){const o=(r()-.5)*w,s=tA+r()*.25*(tB-tA),e=tB-r()*.3*(tB-tA);
      ctx.beginPath();along(ctx,P,o,s,e,w*.006,r()*6);ctx.strokeStyle=cols[(r()*cols.length)|0];ctx.globalAlpha=aMin+r()*(aMax-aMin);ctx.lineWidth=thMin+r()*(thMax-thMin);ctx.stroke()}
    ctx.globalAlpha=1;
  }
  function revealer(P,w,seed){const r=rng(seed),N=70,bs=[];for(let b=0;b<N;b++){const u=b/(N-1)-.5;bs.push({o:u*w*1.04,th:w/N*3.2,lag:r()*.07+Math.abs(u)*.06})}return{P,bs}}
  function reveal(ctx,R,p){
    const W=ctx.canvas.width,H=ctx.canvas.height;ctx.clearRect(0,0,W,H);if(p<=0)return;
    if(p>=1){ctx.fillStyle="#000";ctx.fillRect(0,0,W,H);return}
    ctx.strokeStyle="#000";ctx.lineCap="round";
    for(const b of R.bs){const e=p*1.13-b.lag;if(e<=0)continue;ctx.beginPath();along(ctx,R.P,b.o,0,Math.min(1,e),0,0);ctx.lineWidth=b.th;ctx.stroke()}
  }

  let dpr,lines,layers,buf;
  function build(){
    dpr=Math.min(2.5,devicePixelRatio||1);
    const cw=host.clientWidth,mob=cw<600;
    lines=mob?["Il","colore","giusto"]:["Il colore","giusto"];
    g.font=FONT(100);
    const widest=Math.max(...lines.map((l,i)=>g.measureText(l).width+(i===lines.length-1?52:0)));
    const fs=Math.min(cw*.9/(widest/100),innerHeight*(mob?.19:.32),270);
    const lh=fs*.9,Hc=Math.round(lh*lines.length+fs*.46);
    cv.width=Math.round(cw*dpr);cv.height=Math.round(Hc*dpr);cv.style.height=Hc+"px";
    const F=fs*dpr,LH=lh*dpr,x0=F*.1,W=cv.width,H=cv.height;
    layers=[];
    lines.forEach((txt,i)=>{
      const base=F*.86+i*LH,c=mk(W,H),x=c.getContext("2d");x.font=FONT(F);const tw=x.measureText(txt).width,t0=i*640;
      const P=path(x0-F*.08,base-F*.3,x0+tw+F*.1,base-F*.33,F*.02,220);
      const art=mk(W,H),a=art.getContext("2d");
      a.fillStyle=C.blu;a.fillRect(0,0,W,H);
      streaks(a,P,F*1.1,31+i,[C.bluL,C.bluL,C.bluD],Math.round(F*1.1/dpr),.05,.17,.5*dpr,2*dpr,0,1);
      const gl=a.createLinearGradient(0,base-F*.8,0,base+F*.2);gl.addColorStop(0,"rgba(255,255,255,.18)");gl.addColorStop(.4,"rgba(255,255,255,0)");gl.addColorStop(1,"rgba(0,0,40,.14)");a.fillStyle=gl;a.fillRect(0,0,W,H);
      x.fillText(txt,x0,base);x.globalCompositeOperation="source-in";x.drawImage(art,0,0);x.globalCompositeOperation="source-over";
      if(i===lines.length-1){
        const swW=F*.46,SP=path(x0-F*.08,base-F*.04,x0+tw+F*.66,base-F*.2,F*.05,260);
        const s=mk(W,H),sx=s.getContext("2d"),poly=brushPoly(SP,swW,7,.86);
        sx.save();sx.clip(poly);
        const yg=sx.createLinearGradient(0,base-F*.36,0,base+F*.18);yg.addColorStop(0,C.giaL);yg.addColorStop(.32,C.gia);yg.addColorStop(1,C.giaD);sx.fillStyle=yg;sx.fillRect(0,0,W,H);
        streaks(sx,SP,swW,13,[C.giaL,C.giaD,"#ffffff"],Math.round(swW/dpr*1.1),.07,.28,.5*dpr,2.2*dpr,0,.9);
        sx.restore();
        const rr=rng(99),nn=SP.length-1;sx.lineCap="round";
        for(let k=0;k<110;k++){const o=(rr()-.5)*swW*.6,e=.88+rr()*.12,ph=rr()*9;sx.beginPath();let st=false;
          for(let j=Math.floor(.76*nn);j<=Math.floor(e*nn);j++){if(j/nn>.84&&Math.sin(j*.55+ph)>.86-((j/nn)-.84)*3){st=false;continue}const[tx,ty]=frameAt(SP,j),X=SP[j][0]-ty*o,Y=SP[j][1]+tx*o;st?sx.lineTo(X,Y):(sx.moveTo(X,Y),st=true)}
          sx.strokeStyle=rr()<.72?C.gia:C.giaD;sx.globalAlpha=.6+rr()*.4;sx.lineWidth=(.7+rr()*2.3)*dpr;sx.stroke()}
        sx.globalAlpha=1;
        layers.push({kind:"img",img:s,R:revealer(SP,swW*1.6,77),t0:t0-120,dur:950});
        const dr=rng(5),drops=[.2,.45,.69].map((u,k)=>{const j=Math.floor(u*nn),[tx,ty]=frameAt(SP,j);return{x:SP[j][0]-ty*swW*.4,y:SP[j][1]+tx*swW*.4,len:F*(.09+dr()*.16),w:F*(.045+dr()*.02),d:k*170}});
        layers.push({kind:"drips",drops,t0:t0+760,dur:1300});
        layers.push({kind:"img",img:c,R:revealer(P,F*1.2,90+i),t0,dur:900});
        layers.push({kind:"dot",x:x0+tw+F*.2,y:base-F*.1,r:F*.1,seed:3,t0:t0+880,dur:420});
      }else layers.push({kind:"img",img:c,R:revealer(P,F*1.2,90+i),t0,dur:900});
    });
    buf={mask:mk(W,H),tmp:mk(W,H)};
  }
  function dab(ctx,x,y,r,seed,s){
    const nz=noise1(seed,14);ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    ctx.beginPath();for(let k=0;k<=120;k++){const a=k/120*Math.PI*2,R=r*(1+nz(k/120)*.12);k?ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R*.94):ctx.moveTo(Math.cos(a)*R,Math.sin(a)*R*.94)}ctx.closePath();
    const gr=ctx.createRadialGradient(-r*.35,-r*.4,r*.05,0,0,r*1.15);gr.addColorStop(0,'#F4535B');gr.addColorStop(.5,C.ros);gr.addColorStop(1,'#D4202B');ctx.fillStyle=gr;ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.28)";ctx.beginPath();ctx.ellipse(-r*.32,-r*.4,r*.2,r*.08,-.6,0,Math.PI*2);ctx.fill();
    const sp=rng(seed+9);ctx.fillStyle=C.ros;for(let k=0;k<8;k++){const a=sp()*Math.PI*2,d=r*(1.35+sp()*.9),q=r*(.035+sp()*.08);ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d,q,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  }
  function drip(ctx,d,p){
    const L=d.len*p,w=d.w;if(L<=0)return;
    const gr=ctx.createLinearGradient(d.x-w,0,d.x+w,0);gr.addColorStop(0,C.giaD);gr.addColorStop(.38,C.gia);gr.addColorStop(1,C.giaD);ctx.fillStyle=gr;
    ctx.beginPath();ctx.moveTo(d.x-w*1.1,d.y-w*.8);ctx.bezierCurveTo(d.x-w*.5,d.y,d.x-w*.42,d.y+L*.65,d.x-w*.5,d.y+L);
    ctx.arc(d.x,d.y+L,w*.6,Math.PI,0,true);ctx.bezierCurveTo(d.x+w*.42,d.y+L*.65,d.x+w*.5,d.y,d.x+w*1.1,d.y-w*.8);ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.6)";ctx.beginPath();ctx.ellipse(d.x-w*.2,d.y+L-w*.1,w*.13,w*.2,0,0,Math.PI*2);ctx.fill();
  }
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,back=t=>{const c=1.9;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
  function draw(T){
    const W=cv.width,H=cv.height,m=buf.mask.getContext("2d"),tx=buf.tmp.getContext("2d");
    g.clearRect(0,0,W,H);
    for(const L of layers){
      const p=Math.min(1,Math.max(0,(T-L.t0)/L.dur));if(p<=0)continue;
      if(L.kind==="img"){
        if(p>=1){g.drawImage(L.img,0,0);continue}
        reveal(m,L.R,ease(p));tx.clearRect(0,0,W,H);tx.drawImage(L.img,0,0);tx.globalCompositeOperation="destination-in";tx.drawImage(buf.mask,0,0);tx.globalCompositeOperation="source-over";g.drawImage(buf.tmp,0,0);
      }else if(L.kind==="drips"){L.drops.forEach(d=>{const q=Math.min(1,Math.max(0,(T-L.t0-d.d)/L.dur));drip(g,d,1-Math.pow(1-q,2.2))})}
      else dab(g,L.x,L.y,L.r,L.seed,Math.max(.01,back(p)));
    }
  }
  let started=false,t0=null;
  function play(){host.classList.add("ready");const END=Math.max(...layers.map(l=>l.t0+l.dur+(l.drops?400:0)))+60;
    if(reduce){draw(1e6);return}
    const tick=t=>{if(t0===null)t0=t;const T=t-t0;draw(T);if(T<END)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
  function begin(){if(started)return;started=true;const go=()=>{build();play()};
    (document.fonts?Promise.race([document.fonts.load(FONT(120)).then(()=>document.fonts.ready),new Promise(r=>setTimeout(r,2500))]):Promise.resolve()).then(go,go)}
  document.addEventListener("hero-in",begin);
  if($("#h1")&&$("#h1").classList.contains("in"))begin();
  let rt,lw=host.clientWidth;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!started||host.clientWidth===lw)return;lw=host.clientWidth;build();draw(1e6)},180)});
})();
