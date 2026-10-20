const RELEASE = "b190463f1e69";
/* No install-time downloads: the first visit is never gated by this worker. */
const CACHE = 'underdogs-shell-' + RELEASE;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
 const keys=(await caches.keys()).filter(k=>k.startsWith('underdogs-shell-'));
 // Retain one previous release for open tabs; never touch other apps' caches.
 for(const key of keys.slice(0,-2)) if(key!==CACHE) await caches.delete(key);
 await self.clients.claim();
})()));
function eligible(request) {
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||request.headers.has('RSC')||url.searchParams.has('_rsc')) return false;
 return request.mode==='navigate' || url.pathname.startsWith('/_next/static/') || /^(\/models\/v\/|\/media\/v\/)/.test(url.pathname);
}
async function refresh(request, cache) { const response=await fetch(request);if(response.ok&&response.type!=='opaque'&&!response.headers.get('content-type')?.includes('text/x-component')) await cache.put(request,response.clone());return response; }
self.addEventListener('fetch',event=>{
 if(!eligible(event.request))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(event.request);const network=refresh(event.request,cache);event.waitUntil(network.then(()=>{}).catch(()=>{}));return cached||network;})());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='WARM'||!Array.isArray(event.data.urls))return;
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(const url of event.data.urls){const u=new URL(url,self.location.origin);if(u.origin!==self.location.origin||u.pathname.startsWith('/api/'))continue;try{const response=await fetch(u,{cache:'force-cache'});if(response.ok)await cache.put(u,response);}catch{}}})());
});
