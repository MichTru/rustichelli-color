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
function heroIn(){if(!$("#h1"))return;$("#h1").classList.add("in");document.dispatchEvent(new Event("hero-in"));setTimeout(()=>{$("#hlead").classList.add("in");$("#hcta").classList.add("in")},450)}
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

/* hero: scena dei barattoli in 3D (parallasse con mappa di profondità) */
(function(){
  const cv=$("#liq");if(!cv)return;
  const box=cv.parentElement,img=box.querySelector("img");
  const gl=cv.getContext("webgl2",{alpha:false,antialias:false});
  if(!gl)return;
  const VS=`#version 300 es
in vec2 a;out vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0,1);}`;
  const FS=`#version 300 es
precision highp float;
in vec2 uv;out vec4 o;
uniform sampler2D T,Dp;uniform vec2 R,I,tilt;uniform float tm,zoom,amp;uniform vec4 P;uniform float rip;uniform vec2 RP;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
void main(){
  float ra=R.x/R.y,ia=I.x/I.y;vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
  vec2 q=(uv-.5)*s/zoom+.5;q.y=1.-q.y;
  vec2 sh=tilt*amp*vec2(1.,ia);
  vec2 p=q;
  for(int i=0;i<4;i++){float d=texture(Dp,p).r;p=q-sh*(d-.3);}
  vec3 dm=texture(Dp,p).rgb;
  float t=tm*.2,paint=dm.g;
  vec2 fl=vec2(vn(p*8.+vec2(t,0.))-.5,vn(p*8.+vec2(0.,t)+17.)-.5)+.5*vec2(vn(p*19.-t)-.5,vn(p*19.+t+3.)-.5);
  p+=fl*.0028*paint;
  vec2 dp=(q-P.xy)*vec2(ia,1.);float dd=length(dp);
  p+=normalize(dp+1e-5)*sin(dd*55.-tm*7.)*exp(-dd*9.)*.006*P.z*paint/vec2(ia,1.);
  vec2 dr=(q-RP)*vec2(ia,1.);float d2=length(dr);
  p+=normalize(dr+1e-5)*sin(d2*40.-rip*10.)*exp(-d2*5.-rip*1.6)*.01*step(0.,rip)*(.3+paint)/vec2(ia,1.);
  vec3 c=texture(T,p).rgb;
  float metal=dm.b;
  float glint=pow(max(0.,sin((p.x*1.3+p.y)*9.+tilt.x*5.-tilt.y*3.)),14.);
  c+=metal*glint*.35;
  float l=dot(c,vec3(.3,.59,.11));
  c+=paint*smoothstep(.72,1.,l)*.07*(.5+.5*sin(tm*1.3+p.x*9.+p.y*5.));
  float sdw=dm.r;c*=1.-.06*smoothstep(.2,.9,sdw)*(abs(tilt.x)+abs(tilt.y));
  o=vec4(c,1.);
}`;
  function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(x));return null}return x}
  const v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,FS);if(!v||!f)return;
  const pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const U={};["T","Dp","R","I","tilt","tm","zoom","amp","P","rip","RP"].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
  const mkTex=(unit,el)=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,el);
    gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t};
  const dimg=new Image();dimg.src="assets/hero-depth.png";
  let ready=false;
  const both=()=>img.complete&&img.naturalWidth&&dimg.complete&&dimg.naturalWidth;
  function load(){if(ready||!both())return;mkTex(0,img);mkTex(1,dimg);gl.uniform1i(U.T,0);gl.uniform1i(U.Dp,1);ready=true;size();box.classList.add("live")}
  img.addEventListener("load",load);dimg.addEventListener("load",load);load();
  function size(){const dpr=Math.min(2,devicePixelRatio||1),r=cv.getBoundingClientRect();cv.width=Math.max(2,r.width*dpr|0);cv.height=Math.max(2,r.height*dpr|0);gl.viewport(0,0,cv.width,cv.height)}
  addEventListener("resize",size);
  let zoom=innerWidth<600?1.03:1.06;
  const toUV=(cx,cy)=>{const r=cv.getBoundingClientRect(),ra=r.width/r.height,ia=img.naturalWidth/img.naturalHeight,s=ra>ia?[1,ia/ra]:[ra/ia,1];
    const u=(cx-r.left)/r.width,v=1-(cy-r.top)/r.height;return[(u-.5)*s[0]/zoom+.5,1-((v-.5)*s[1]/zoom+.5)]};
  let ptx=0,pty=0,usr=0,gx=0,gy=0,gyro=false,tx=0,ty=0,px=.5,py=.5,pz=0,mx=.5,my=.5,on=0,rip=-1,rp=[.5,.5],t0=null,lastUser=-1e9;
  box.addEventListener("pointermove",e=>{const r=box.getBoundingClientRect();ptx=((e.clientX-r.left)/r.width-.5)*2;pty=((e.clientY-r.top)/r.height-.5)*2;[mx,my]=toUV(e.clientX,e.clientY);on=e.pointerType==="mouse"?1:0;lastUser=performance.now()},{passive:true});
  box.addEventListener("pointerleave",()=>{on=0});
  box.addEventListener("pointerdown",e=>{rp=toUV(e.clientX,e.clientY);rip=0;
    if(!gyro&&window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().then(s=>{if(s==="granted")listenGyro()}).catch(()=>{})},{passive:true});
  function listenGyro(){addEventListener("deviceorientation",e=>{if(e.gamma==null)return;gyro=true;gx=Math.max(-1,Math.min(1,e.gamma/30));gy=Math.max(-1,Math.min(1,(e.beta-40)/30));lastUser=performance.now()})}
  if(!(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"))listenGyro();
  let vis=true;new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(box);
  function frame(now){
    requestAnimationFrame(frame);if(!ready||!vis||document.hidden)return;
    if(t0===null)t0=now;const tm=(now-t0)/1000;
    const idle=Math.min(1,Math.max(0,(now-lastUser-1500)/1500));
    const ix=Math.sin(tm*.45)*.85,iy=Math.sin(tm*.31+1)*.6;
    const ux=gyro?gx:ptx,uy=gyro?gy:pty;
    const gxT=reduce?0:ux*(1-idle)+ix*idle,gyT=reduce?0:uy*(1-idle)+iy*idle;
    tx+=(gxT-tx)*.06;ty+=(gyT-ty)*.06;
    px+=(mx-px)*.12;py+=(my-py)*.12;pz+=((on?1:0)-pz)*.05;if(rip>=0){rip+=1/60;if(rip>2.5)rip=-1}
    gl.uniform2f(U.R,cv.width,cv.height);gl.uniform2f(U.I,img.naturalWidth,img.naturalHeight);gl.uniform1f(U.tm,reduce?0:tm);gl.uniform1f(U.zoom,zoom);
    gl.uniform1f(U.amp,.018);gl.uniform2f(U.tilt,tx,-ty);
    gl.uniform4f(U.P,px,py,pz,0);gl.uniform1f(U.rip,rip);gl.uniform2f(U.RP,rp[0],rp[1]);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  requestAnimationFrame(frame);
})();

/* catalogo: filtri */
(function(){
  const f=$(".filt");if(!f)return;const cards=$$("#pgrid .prc");
  f.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    f.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));const k=b.dataset.f;
    cards.forEach(c=>c.classList.toggle("hid",k!=="tutti"&&!c.dataset.cats.split(" ").includes(k)))});
})();
/* scheda: barattolo che segue il puntatore */
(function(){
  const t=$("#tilt");if(!t||reduce)return;const host=t.parentElement;
  host.addEventListener("pointermove",e=>{const r=host.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`rotateY(${x*24}deg) rotateX(${-y*16}deg)`});
  host.addEventListener("pointerleave",()=>t.style.transform="");
})();
/* scheda: calcolo quantità */
(function(){
  const c=$("#calc");if(!c)return;
  const r1=+c.dataset.r1,r2=+c.dataset.r2,u=c.dataset.u,F=c.dataset.f?c.dataset.f.split(",").map(Number).filter(Boolean):[];
  const m2=$("#cm2"),out=$("#cres"),seg=$("#cmani");let mani=+(seg.querySelector(".on")||seg.querySelector("button")).dataset.m;
  const fmt=x=>(Math.round(x*10)/10).toLocaleString("it-IT");
  function pack(q){if(!F.length)return"";let best=null;const s=[...F].sort((a,b)=>b-a);
    const rec=(i,left,used,cnt)=>{if(cnt>8)return;if(left<=0){const tot=used.reduce((a,[f,n])=>a+f*n,0);if(!best||tot<best.tot-1e-9||(Math.abs(tot-best.tot)<1e-9&&cnt<best.cnt))best={tot,cnt,used:[...used]};return}
      if(i>=s.length)return;for(let n=Math.ceil(left/s[i]);n>=0;n--){rec(i+1,left-n*s[i],n?[...used,[s[i],n]]:used,cnt+n)}};
    rec(0,q,[],0);if(!best)return"";return best.used.map(([f,n])=>`${n} × ${fmt(f)} ${u==="kg"?"kg":"L"}`).join(" + ")}
  function upd(){const a=Math.max(0,parseFloat(String(m2.value).replace(",","."))||0);if(!a){out.innerHTML="";return}
    const hi=a*mani/r1,lo=a*mani/r2,U=u==="kg"?"kg":"litri";
    const p=pack(hi);out.innerHTML=`<b>${lo===hi?fmt(hi):fmt(lo)+"–"+fmt(hi)} ${U}</b>${p?"Ti consigliamo "+p+".":""}`}
  m2.addEventListener("input",upd);
  seg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;mani=+b.dataset.m;seg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));upd()});
  upd();
})();
