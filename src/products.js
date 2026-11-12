
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
