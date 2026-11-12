
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
