if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const l=e=>i(e,t),u={module:{uri:t},exports:o,require:l};s[t]=Promise.all(n.map((e=>u[e]||l(e)))).then((e=>(r(...e),o)))}}define(["./workbox-15aa4474"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-29a1f8b1.js",revision:null},{url:"assets/index-fae979be.css",revision:null},{url:"assets/web-vitals-7b71ae84.js",revision:null},{url:"index.html",revision:"7b4583183bb17aabd7591eaa7b87380f"},{url:"registerSW.js",revision:"f294c23f3839727e8f4f3ab55ecfee09"},{url:"manifest.webmanifest",revision:"a7d58352071c9ea56499e3524db5905f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));