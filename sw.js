if(!self.define){let s,e={};const i=(i,n)=>(i=new URL(i+".js",n).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(n,r)=>{const l=s||("document"in self?document.currentScript.src:"")||location.href;if(e[l])return;let t={};const o=s=>i(s,l),u={module:{uri:l},exports:t,require:o};e[l]=Promise.all(n.map((s=>u[s]||o(s)))).then((s=>(r(...s),t)))}}define(["./workbox-28fe7b12"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"404.html",revision:"8862f5e423daf4ff226daca6ce8404d9"},{url:"assets/index-246691aa.css",revision:null},{url:"assets/index-e31c8070.js",revision:null},{url:"assets/links-de-4a92a1fe.js",revision:null},{url:"assets/links-fr-929aae2c.js",revision:null},{url:"assets/links-it-eeb5cf20.js",revision:null},{url:"assets/sections-de-0bac107b.js",revision:null},{url:"assets/sections-fr-42186d83.js",revision:null},{url:"assets/sections-it-da27b1c0.js",revision:null},{url:"assets/start-page-de-253819fa.js",revision:null},{url:"assets/start-page-fr-910c757f.js",revision:null},{url:"assets/start-page-it-d6bc2cbc.js",revision:null},{url:"assets/web-vitals-867e2ef8.js",revision:null},{url:"index.html",revision:"cdd5d3d8736bababde23f1333208d1e4"},{url:"registerSW.js",revision:"f294c23f3839727e8f4f3ab55ecfee09"},{url:"manifest.webmanifest",revision:"a7d58352071c9ea56499e3524db5905f"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
