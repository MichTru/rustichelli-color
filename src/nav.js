
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
