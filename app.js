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
function heroIn(){if(!$("#h1"))return;$("#h1").classList.add("in");setTimeout(()=>{$("#hlead").classList.add("in");$("#hcta").classList.add("in")},450)}
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

/* barattolo 3D */
(function(){
  const cv=$("#can3d");if(!cv)return;
  const heroEl=$("#hero"),stage=cv.parentElement,pc=$("#pour2"),tap=$("#tapHint"),tname=$("#tname");
  const gl=cv.getContext("webgl2",{antialias:true,alpha:true});
  if(!gl){document.documentElement.classList.add("nocan");return}
  const ctx=pc.getContext("2d");

  /* matrici (column-major) */
  const mul=(a,b)=>{const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o};
  const persp=(f,a,n,fa)=>{const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0]};
  const tr=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
  const rx=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]};
  const ry=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]};
  const rz=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]};
  const ap=(m,v)=>[0,1,2,3].map(i=>m[i]*v[0]+m[4+i]*v[1]+m[8+i]*v[2]+m[12+i]);
  const M=(...ms)=>ms.reduce((a,b)=>mul(a,b));

  /* geometrie */
  function lathe(prof,seg){
    const P=[],N=[],I=[],n=prof.length;
    const sn=[];for(let i=0;i<n-1;i++){const dr=prof[i+1][0]-prof[i][0],dy=prof[i+1][1]-prof[i][1],l=Math.hypot(dr,dy)||1;sn.push([dy/l,-dr/l])}
    const vn=prof.map((_,i)=>{const a=sn[Math.max(0,i-1)],b=sn[Math.min(sn.length-1,i)];const x=a[0]+b[0],y=a[1]+b[1],l=Math.hypot(x,y)||1;return[x/l,y/l]});
    for(let j=0;j<=seg;j++){const t=j/seg*Math.PI*2,c=Math.cos(t),s=Math.sin(t);
      for(let i=0;i<n;i++){P.push(prof[i][0]*c,prof[i][1],prof[i][0]*s);N.push(vn[i][0]*c,vn[i][1],vn[i][0]*s)}}
    for(let j=0;j<seg;j++)for(let i=0;i<n-1;i++){const a=j*n+i,b=a+n;I.push(a,b,a+1,a+1,b,b+1)}
    return{P,N,I};
  }
  function tube(pts,r,sides){
    const P=[],N=[],I=[];
    pts.forEach(([p,nrm])=>{for(let k=0;k<=sides;k++){const t=k/sides*Math.PI*2,c=Math.cos(t),s=Math.sin(t);
      const n=[nrm[0]*c,nrm[1]*c,s];P.push(p[0]+n[0]*r,p[1]+n[1]*r,p[2]+n[2]*r);N.push(...n)}});
    for(let i=0;i<pts.length-1;i++)for(let k=0;k<sides;k++){const a=i*(sides+1)+k,b=a+sides+1;I.push(a,b,a+1,a+1,b,b+1)}
    return{P,N,I};
  }
  function vao(g){
    const v=gl.createVertexArray();gl.bindVertexArray(v);
    const put=(data,loc)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)};
    put(g.P,0);put(g.N,1);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(g.I),gl.STATIC_DRAW);
    gl.bindVertexArray(null);return{v,n:g.I.length};
  }
  const body=vao(lathe([[0,-.62],[.97,-.62],[1,-.59],[1,.58],[1.03,.6],[1.03,.645],[.985,.66],[.96,.63],[.96,.47]],96));
  const lid=vao(lathe([[.99,.635],[1.06,.635],[1.06,.685],[1.02,.705],[.93,.705],[.9,.69],[.87,.705],[0,.705]],96));
  const paint=vao(lathe([[.96,.5],[0,.5]],64));
  const arc=[];for(let i=0;i<=40;i++){const t=i/40*Math.PI,c=Math.cos(t),s=Math.sin(t);arc.push([[1.07*c,1.07*s,0],[c,s]])}
  const handle=vao(tube(arc,.026,10));
  const ear=vao(lathe([[0,.0],[.09,.0],[.09,.03],[0,.03]],24));

  /* shader */
  const VS=`#version 300 es
layout(location=0) in vec3 p;layout(location=1) in vec3 n;
uniform mat4 uM,uVP;out vec3 vN,vW,vO;
void main(){vO=p;vec4 w=uM*vec4(p,1.);vW=w.xyz;vN=mat3(uM)*n;gl_Position=uVP*w;}`;
  const FSC=`#version 300 es
precision highp float;
in vec3 vN,vW,vO;out vec4 o;
uniform int uMat;uniform vec3 uEye,uPaint;uniform sampler2D uTex;uniform float uA;
vec3 env(vec3 r){float h=r.y*.5+.5;
 vec3 c=mix(vec3(.10,.10,.42),vec3(.93,.94,1.),smoothstep(.35,.85,h));
 c=mix(c,vec3(.45,.45,.8),smoothstep(.5,.0,h)*.6);
 c+=vec3(1.,.95,.35)*pow(max(dot(r,normalize(vec3(.8,.25,.55))),0.),6.)*.55;
 c+=vec3(1.)*pow(max(dot(r,normalize(vec3(-.5,.7,.6))),0.),40.)*1.2;
 return c;}
void main(){
 vec3 v=normalize(uEye-vW);vec3 n=normalize(vN);bool front=dot(n,v)>0.;if(!front)n=-n;vec3 r=reflect(-v,n);
 vec3 L=normalize(vec3(-.5,.8,.7));float d=max(dot(n,L),0.);
 float fr=pow(1.-max(dot(n,v),0.),3.);
 vec3 col;
 vec3 metal=env(r)*vec3(.86,.88,.95)*(.75+.25*d)+fr*.25;
 if(uMat==0){
  col=metal;
  if(!front)col=vec3(.25,.26,.36)*(.4+.6*d);
  float rad=length(vO.xz);
  if(front&&rad>.995&&vO.y>-.5&&vO.y<.47){
   float u=.5-atan(vO.z,vO.x)/6.28318,vv=(vO.y+.5)/.97;
   vec4 t=texture(uTex,vec2(u,1.-vv));
   if(t.a>.5){float spec=pow(max(dot(r,normalize(vec3(-.5,.7,.6))),0.),60.)*.5;col=t.rgb*(.62+.45*d)+spec+fr*.12;}
  }
 }else if(uMat==1){col=metal*.95;}
 else if(uMat==2){col=uPaint*(.7+.35*d)+pow(max(dot(r,L),0.),50.)*.6;}
 else{col=vec3(.16,.17,.3)*(.5+.7*d)+pow(max(dot(r,L),0.),30.)*.5;}
 o=vec4(col,uA);
}`;
  function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));return x}
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FSC));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){document.documentElement.classList.add("nocan");return}
  gl.useProgram(pr);
  const U={};["uM","uVP","uMat","uEye","uPaint","uTex","uA"].forEach(k=>U[k]=gl.getUniformLocation(pr,k));

  /* etichetta */
  const lc=document.createElement("canvas");lc.width=2048;lc.height=560;const lx=lc.getContext("2d");
  const logo=new Image();logo.src="assets/logo.png";
  const tex=gl.createTexture();
  let tint=null;
  function label(){
    const W=lc.width,Hh=lc.height;lx.clearRect(0,0,W,Hh);
    lx.fillStyle="#fff";lx.fillRect(0,0,W,Hh);
    lx.fillStyle="#171796";lx.fillRect(0,26,W,46);
    lx.fillStyle="#F5E617";lx.fillRect(0,72,W,14);
    lx.fillStyle="#ED2E38";lx.fillRect(0,Hh-72,W,46);
    [.75,.25].forEach(cx=>{
      const x=cx*W;
      if(logo.complete&&logo.naturalWidth){const w=560,h=w*logo.naturalHeight/logo.naturalWidth;lx.drawImage(logo,x-w/2,140,w,h)}
      lx.fillStyle="#14143A";lx.textAlign="center";
      lx.font='italic 900 44px "Archivo", "Arial Black", sans-serif';
      lx.fillText("Pitture · Vernici · Smalti",x,350);
      lx.fillStyle=tint?tint.c:"#F5E617";
      lx.beginPath();lx.roundRect(x-150,390,300,60,30);lx.fill();
      lx.fillStyle=tint&&tint.dark?"#fff":"#14143A";lx.font='800 30px "Hanken Grotesk", Arial, sans-serif';
      lx.fillText(tint?tint.n:"Dal 1991",x,431);
    });
    gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,lc);
    gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    const af=gl.getExtension("EXT_texture_filter_anisotropic");if(af)gl.texParameterf(gl.TEXTURE_2D,af.TEXTURE_MAX_ANISOTROPY_EXT,8);
    dirty=true;
  }
  let dirty=true;
  label();logo.onload=label;if(document.fonts)document.fonts.ready.then(label);

  /* stato */
  const TINTE=[{n:"Giallo Pavaglione",c:"#F5E617",v:[.96,.9,.09]},{n:"Rosso color",c:"#ED2E38",v:[.93,.18,.22],dark:1},{n:"Azzurro Canale",c:"#7FA8FF",v:[.5,.66,1.]},{n:"Verde Pineta",c:"#5E8F4A",v:[.37,.56,.29],dark:1}];
  let ti=-1,yaw=-.35,pitch=0,vyaw=0,auto=1,open=0,target=0,t0=0,pourT=0,pool=0,land=null,lastFrame=performance.now();
  let W=0,H=0,dpr=1;
  function size(){dpr=Math.min(2,devicePixelRatio||1);const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr|0;cv.height=H*dpr|0;
    const hr=heroEl.getBoundingClientRect();pc.width=hr.width*dpr|0;pc.height=hr.height*dpr|0;dirty=true}
  size();addEventListener("resize",size);

  /* interazione */
  let down=null;
  cv.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,t:performance.now(),yaw};cv.setPointerCapture(e.pointerId);cv.classList.add("drag")});
  cv.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-down.x;yaw=down.yaw+dx*.012;vyaw=0;auto=0;dirty=true});
  const up=e=>{if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y),dt=performance.now()-down.t;cv.classList.remove("drag");
    if(moved<8&&dt<500)toggle();down=null;setTimeout(()=>auto=1,2500)};
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",()=>{down=null;cv.classList.remove("drag")});
  cv.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
  function toggle(){
    if(target===0){ti=(ti+1)%TINTE.length;tint=TINTE[ti];label();target=1;t0=performance.now();pourT=0;pool=0;land=null;heroEl.style.setProperty("--pour",tint.c);
      heroEl.classList.remove("poured");tname.textContent=tint.n;tname.classList.add("on");if(tap)tap.classList.add("gone")}
    else{target=0;t0=performance.now();heroEl.classList.remove("poured");tname.classList.remove("on")}
    cv.setAttribute("aria-pressed",target===1);
  }

  /* animazione */
  const cl=(x,a,b)=>Math.min(1,Math.max(0,(x-a)/(b-a))),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,eo=t=>1-Math.pow(1-t,3);
  let vis=true;new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(heroEl);
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.max(0,Math.min(.05,(now-lastFrame)/1000));lastFrame=now;
    if(!vis||document.hidden)return;
    if(auto&&!reduce)yaw+=dt*.35*(target?0:1);
    const k=(now-t0)/1000;
    let tiltP,lidP;
    if(target){lidP=eo(cl(k,0,.7));tiltP=ease(cl(k,.45,1.3));if(k>1.25)pourT=Math.min(1,pourT+dt*2.2);if(pourT>=1)pool=Math.min(1,pool+dt*.55);if(pool>.55&&!heroEl.classList.contains("poured"))heroEl.classList.add("poured")}
    else{lidP=1-eo(cl(k,.5,1.2));tiltP=1-ease(cl(k,0,.8));pourT=Math.max(0,pourT-dt*3);pool=Math.max(0,pool-dt*.9)}
    if(reduce){lidP=target?1:0;tiltP=target?1:0}
    draw(lidP,tiltP);
  }
  function draw(lidP,tiltP){
    gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    const asp=W/H,P=persp(.52,asp,.1,50);
    const V=M(tr(0,-.05,-7.4),rx(.28+pitch));
    const VP=mul(P,V);const eye=ap(rx(-.28-pitch),[0,.05,7.4,1]);
    gl.uniformMatrix4fv(U.uVP,false,VP);
    gl.uniform3fv(U.uEye,eye.slice(0,3));
    gl.uniform3fv(U.uPaint,tint?tint.v:[.96,.9,.09]);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(U.uTex,0);
    const tilt=tiltP*1.1,shift=tiltP*.75;
    const piv=[-1,-.62,0];
    const base=M(tr(shift,-tiltP*.35,0),tr(piv[0],piv[1],piv[2]),rz(tilt),tr(-piv[0],-piv[1],-piv[2]));
    const Mb=mul(base,ry(yaw));
    const drawM=(m,mat,o,a=1)=>{gl.uniformMatrix4fv(U.uM,false,m);gl.uniform1i(U.uMat,mat);gl.uniform1f(U.uA,a);gl.bindVertexArray(o.v);gl.drawElements(gl.TRIANGLES,o.n,gl.UNSIGNED_SHORT,0)};
    drawM(Mb,0,body);
    if(lidP>0)drawM(Mb,2,paint);
    const hang=-1.25+tiltP*.0;
    const Mh=M(Mb,tr(0,.32,0),rx(hang));
    drawM(Mh,3,handle);
    drawM(M(Mb,tr(1.0,.32,0),rz(-Math.PI/2)),3,ear);drawM(M(Mb,tr(-1.0,.32,0),rz(Math.PI/2)),3,ear);
    if(lidP<1){const l=lidP;drawM(M(base,tr(l*2.4,l*2.6,-l*.6),tr(0,.7,0),rz(-l*2.2),rx(l*.9),tr(0,-.7,0),ry(yaw)),1,lid,1-cl(l,.6,1))}
    /* colata */
    const hr=heroEl.getBoundingClientRect(),cr=cv.getBoundingClientRect();
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,pc.width,pc.height);
    if(tint&&(pourT>0||pool>0)){
      const lw=ap(base,[-1.0,.62,0,1]);const c=ap(VP,lw);
      const sx=(c[0]/c[3]*.5+.5)*cr.width+cr.left-hr.left,sy=(1-(c[1]/c[3]*.5+.5))*cr.height+cr.top-hr.top;
      const Hh=hr.height,bottom=Hh;ctx.scale(dpr,dpr);
      ctx.fillStyle=ctx.strokeStyle=tint.c;
      if(pourT>0){
        const endY=sy+(bottom-sy)*pourT,w=Math.max(10,cr.width*.045);
        ctx.lineWidth=w;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(sx,sy);
        ctx.bezierCurveTo(sx-w*1.6,sy+20,sx-w*1.8,sy+70,sx-w*1.8,Math.max(sy+70,endY));ctx.stroke();
        land=sx-w*1.8;
      }
      if(pool>0&&land!==null){
        const half=pool*hr.width*1.1,ph=8+pool*46;
        ctx.beginPath();ctx.ellipse(land,bottom,half,ph,0,Math.PI,0);ctx.fill();
        ctx.fillRect(land-half,bottom-2,half*2,2);
      }
    }
  }
  requestAnimationFrame(frame);
})();
