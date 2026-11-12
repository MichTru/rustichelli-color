
/* hero: immagine del logo in vernice, resa liquida */
(function(){
  const cv=$("#liq");if(!cv)return;
  const box=cv.parentElement,img=box.querySelector("img");
  const gl=cv.getContext("webgl2",{alpha:false,antialias:false});
  if(!gl||reduce)return;
  const VS=`#version 300 es
in vec2 a;out vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0,1);}`;
  const FS=`#version 300 es
precision highp float;
in vec2 uv;out vec4 o;
uniform sampler2D T;uniform vec2 R,I;uniform float tm,zoom;uniform vec4 P;uniform float rip;uniform vec2 RP;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
void main(){
  float ra=R.x/R.y,ia=I.x/I.y;vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
  vec2 q=(uv-.5)*s/zoom+.5;q.y=1.-q.y;q.y-=(1.-s.y)*.05;
  vec2 q0=q;
  vec3 c0=texture(T,q0).rgb;
  float mx=max(c0.r,max(c0.g,c0.b)),mn=min(c0.r,min(c0.g,c0.b));
  float sat=(mx-mn)/max(mx,.001);
  float paint=smoothstep(.2,.55,sat);
  float t=tm*.18;
  vec2 fl=vec2(vn(q*7.+vec2(t,0.))-.5,vn(q*7.+vec2(0.,t)+17.)-.5)+.5*vec2(vn(q*17.-t)-.5,vn(q*17.+t+3.)-.5);
  q+=fl*.0042*paint;
  vec2 dp=(q0-P.xy)*vec2(ia,1.);float dd=length(dp);
  q+=normalize(dp+1e-5)*sin(dd*55.-tm*7.)*exp(-dd*9.)*.007*P.z/vec2(ia,1.);
  vec2 dr=(q0-RP)*vec2(ia,1.);float d2=length(dr);
  q+=normalize(dr+1e-5)*sin(d2*40.-rip*10.)*exp(-d2*5.-rip*1.6)*.012*step(0.,rip)/vec2(ia,1.);
  vec3 c=texture(T,q).rgb;
  float l=dot(c,vec3(.3,.59,.11));
  c+=paint*smoothstep(.75,1.,l)*.06*(.5+.5*sin(tm*1.4+q.x*9.+q.y*5.));
  o=vec4(c,1.);
}`;
  function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(x));return null}return x}
  const v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,FS);if(!v||!f)return;
  const pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const U={};["T","R","I","tm","zoom","P","rip","RP"].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
  const tex=gl.createTexture();let ready=false;
  function load(){gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
    gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    ready=true;size();box.classList.add("live")}
  if(img.complete&&img.naturalWidth)load();else img.addEventListener("load",load);
  function size(){const dpr=Math.min(2,devicePixelRatio||1),r=cv.getBoundingClientRect();cv.width=Math.max(2,r.width*dpr|0);cv.height=Math.max(2,r.height*dpr|0);gl.viewport(0,0,cv.width,cv.height)}
  addEventListener("resize",size);
  let tx=.5,ty=.5,px=.5,py=.5,pz=0,on=0,rip=-1,rp=[.5,.5],t0=null;
  const toUV=e=>{const r=cv.getBoundingClientRect(),ra=r.width/r.height,ia=img.naturalWidth/img.naturalHeight,s=ra>ia?[1,ia/ra]:[ra/ia,1],z=zoomNow;
    const u=(e.clientX-r.left)/r.width,v=1-(e.clientY-r.top)/r.height;return[(u-.5)*s[0]/z+.5,1-((v-.5)*s[1]/z+.5)]};
  let zoomNow=1;
  cv.addEventListener("pointermove",e=>{[tx,ty]=toUV(e);on=1},{passive:true});
  cv.addEventListener("pointerleave",()=>on=0);
  cv.addEventListener("pointerdown",e=>{rp=toUV(e);rip=0},{passive:true});
  let vis=true;new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(box);
  function frame(now){
    requestAnimationFrame(frame);if(!ready||!vis||document.hidden)return;
    if(t0===null)t0=now;const tm=(now-t0)/1000;
    zoomNow=1+.018*(1-Math.exp(-tm/10));
    px+=(tx-px)*.1;py+=(ty-py)*.1;pz+=((on?1:0)-pz)*.05;if(rip>=0){rip+=1/60;if(rip>2.5)rip=-1}
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(U.T,0);
    gl.uniform2f(U.R,cv.width,cv.height);gl.uniform2f(U.I,img.naturalWidth,img.naturalHeight);gl.uniform1f(U.tm,tm);gl.uniform1f(U.zoom,zoomNow);
    gl.uniform4f(U.P,px,py,pz,0);gl.uniform1f(U.rip,rip);gl.uniform2f(U.RP,rp[0],rp[1]);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  requestAnimationFrame(frame);
})();
