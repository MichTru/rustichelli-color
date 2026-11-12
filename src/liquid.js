
/* hero: logo liquefatto */
(function(){
  const cv=$("#melt");if(!cv)return;
  const heroEl=$("#hero");
  const gl=cv.getContext("webgl2",{premultipliedAlpha:true,alpha:true,antialias:false});
  if(!gl){document.documentElement.classList.add("nomelt");return}
  const MAXD=16;
  const VS=`#version 300 es
in vec2 a;out vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0,1);}`;
  const FS=`#version 300 es
precision highp float;
in vec2 uv;out vec4 o;
uniform sampler2D T;uniform float tm,asp,edge;uniform vec4 P,box;
uniform vec4 D[${MAXD}];uniform vec3 DC[${MAXD}];uniform int ND;
float h(float n){return fract(sin(n*127.1)*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=h(i.x+i.y*57.),b=h(i.x+1.+i.y*57.),c=h(i.x+(i.y+1.)*57.),d=h(i.x+1.+(i.y+1.)*57.);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float smin(float a,float b,float k){float hh=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,hh)-k*hh*(1.-hh);}
float sdSeg(vec2 p,vec2 a,vec2 b,float r){vec2 pa=p-a,ba=b-a;float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*hh)-r;}
vec4 tex(vec2 q){return(q.x<0.||q.x>1.||q.y<0.||q.y>1.)?vec4(0):texture(T,q);}
void main(){
  vec2 q=(uv-box.xy)/box.zw;
  float t=tm*.22;
  q+=vec2(vn(q*vec2(5.,2.5)+t)-.5,vn(q*vec2(4.,3.)-t+9.)-.5)*.004;
  vec2 pp=(P.xy-box.xy)/box.zw;vec2 d=q-pp;d.x*=asp;
  float f=exp(-dot(d,d)*30.)*P.z;float an=f*1.1;float c=cos(an),s=sin(an);
  q=pp+mat2(c,-s,s,c)*(q-pp);q.y-=f*.04;
  vec4 tx=tex(q);
  float sdL=(.5-tx.a)*edge;
  vec2 p=vec2(q.x*asp,q.y);
  float sdD=1e3;vec3 dcol=vec3(0);
  for(int i=0;i<${MAXD};i++){if(i>=ND)break;vec4 k=D[i];if(k.z<=0.)continue;
    float r=k.w,L=k.z;
    vec2 A=vec2(k.x,k.y+r*1.4),B=vec2(k.x,k.y-L);
    float tt=clamp((A.y-p.y)/max(A.y-B.y,.001),0.,1.);
    float sd=sdSeg(p,A,B,r*(1.-.22*tt));
    sd=smin(sd,length(p-B)-r*1.2*min(1.,L/(r*2.5)+.35),r*.7);
    if(sd<sdD){sdD=sd;dcol=DC[i];}
  }
  float sd=smin(sdL,sdD,.03);
  float fw=max(fwidth(sd),1e-5);
  float a=clamp(.5-sd/fw,0.,1.);
  if(a<=0.){o=vec4(0);return;}
  vec3 base=tx.a>.02?tx.rgb/tx.a:dcol;
  float wD=smoothstep(.01,-.01,sdD-sdL);
  if(tx.a<.9&&wD<.5){vec4 deep=tex(q+vec2(0.,.015));if(deep.a>.9)base=mix(deep.rgb/deep.a,base,.2);}
  base=mix(base,dcol,wD);
  float hgt=smoothstep(0.,-.04,sd);
  vec3 n=normalize(vec3(-dFdx(hgt),-dFdy(hgt),fw*1.6));
  vec3 L=normalize(vec3(-.45,.6,.8));
  float dif=max(dot(n,L),0.),spec=pow(max(dot(reflect(-L,n),vec3(0,0,1)),0.),36.);
  vec3 col=base*(.84+.2*dif)+spec*.42;
  o=vec4(col*a,a);
}`;
  function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(x));return null}return x}
  const v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,FS);if(!v||!f){document.documentElement.classList.add("nomelt");return}
  const pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const U={};["T","tm","asp","edge","P","box","D","DC","ND"].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
  const tex=gl.createTexture();let ready=false,iw=1,ih=1,drips=[];
  function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const img=new Image();
  img.onload=()=>{
    const pad=24;iw=img.naturalWidth+pad*2;ih=img.naturalHeight+pad*2;
    const c=document.createElement("canvas");c.width=iw;c.height=ih;const x=c.getContext("2d");x.drawImage(img,pad,pad);
    const px=x.getImageData(0,0,iw,ih).data,A=(X,Y)=>px[(Y*iw+X)*4+3],RGB=(X,Y)=>{const i=(Y*iw+X)*4,a=Math.max(1,px[i+3])/255;return[px[i]/255/a,px[i+1]/255/a,px[i+2]/255/a].map(v=>Math.min(1,v))};
    const bottom=X=>{for(let Y=ih-1;Y>=0;Y--)if(A(X,Y)>235)return Y;return -1};
    const cand=[];
    for(let X=Math.round(iw*.05);X<iw*.96;X+=3){const y0=bottom(X),yl=bottom(X-8),yr=bottom(X+8);if(y0<0||yl<0||yr<0)continue;
      if(Math.abs(yl-y0)>ih*.02||Math.abs(yr-y0)>ih*.02)continue;
      const ys=Math.max(0,y0-Math.round(ih*.035));if(A(X,ys)<240)continue;
      const cc=RGB(X,ys);let col=null;
      if(cc[2]>.4&&cc[0]<.35&&cc[1]<.35)col=[.09,.09,.59];else if(cc[0]>.85&&cc[1]>.78&&cc[2]<.4)col=[.96,.9,.09];
      if(!col)continue;
      cand.push({X,Y:y0,col})}
    const r=rng(1991),pick=[];
    for(const k of cand.sort(()=>r()-.5)){if(pick.length>=9)break;if(pick.every(p=>Math.abs(p.X-k.X)>iw*.07))pick.push(k)}
    const as=iw/ih;
    drips=pick.map(k=>({x:k.X/iw*as,yb:1-k.Y/ih,L:.12+Math.pow(r(),1.5)*.42,r:.03+r()*.032,col:k.col,del:r()*1.6,sp:.7+r()*.6}));
    gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    ready=true;size();heroEl.classList.add("melt-on")};
  img.src="assets/logo-hd.png";
  let box=[0,0,1,1];
  function size(){const dpr=Math.min(2,devicePixelRatio||1),rc=cv.getBoundingClientRect();cv.width=Math.max(2,rc.width*dpr|0);cv.height=Math.max(2,rc.height*dpr|0);gl.viewport(0,0,cv.width,cv.height);
    const as=iw/ih,W=cv.width,H=cv.height;let bw=W*.98,bh=bw/as;if(bh>H*.6){bh=H*.6;bw=bh*as}
    box=[(1-bw/W)/2,1-(H*.02+bh)/H,bw/W,bh/H]}
  addEventListener("resize",size);
  let px=-9,py=-9,pz=0,tx=-9,ty=-9,on=0;
  const mv=e=>{const rc=cv.getBoundingClientRect();tx=(e.clientX-rc.left)/rc.width;ty=1-(e.clientY-rc.top)/rc.height;on=1};
  cv.addEventListener("pointermove",mv,{passive:true});cv.addEventListener("pointerdown",mv,{passive:true});
  cv.addEventListener("pointerleave",()=>on=0);cv.addEventListener("pointerup",e=>{if(e.pointerType!=="mouse")on=0});
  let vis=true;new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(heroEl);
  let t0=null,startAt=null;
  document.addEventListener("hero-in",()=>{startAt=performance.now()});
  if($("#h1")&&$("#h1").classList.contains("in"))startAt=performance.now();
  const Dv=new Float32Array(MAXD*4),Cv=new Float32Array(MAXD*3);
  function frame(now){
    requestAnimationFrame(frame);
    if(!ready||!vis||document.hidden)return;
    if(t0===null)t0=now;
    const tm=(now-t0)/1000,gs=startAt===null?0:(now-startAt)/1000;
    drips.forEach((d,i)=>{let g=reduce?1:Math.min(1,Math.max(0,(gs-d.del)/(4.5*d.sp)));g=1-Math.pow(1-g,2.4);
      const creep=reduce?0:Math.min(.12,Math.max(0,gs-d.del-4.5*d.sp)*.004);
      Dv[i*4]=d.x;Dv[i*4+1]=d.yb;Dv[i*4+2]=g>0?d.L*g+creep:0;Dv[i*4+3]=d.r;Cv[i*3]=d.col[0];Cv[i*3+1]=d.col[1];Cv[i*3+2]=d.col[2]});
    px+=(tx-px)*.12;py+=(ty-py)*.12;pz+=((on?1:0)-pz)*.06;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(U.T,0);
    gl.uniform1f(U.tm,tm);gl.uniform1f(U.asp,iw/ih);gl.uniform1f(U.edge,10/ih);
    gl.uniform4f(U.P,px,py,pz,0);gl.uniform4f(U.box,box[0],box[1],box[2],box[3]);
    gl.uniform4fv(U.D,Dv);gl.uniform3fv(U.DC,Cv);gl.uniform1i(U.ND,drips.length);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  requestAnimationFrame(frame);
})();
