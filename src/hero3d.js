
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
