
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
