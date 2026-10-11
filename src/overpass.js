import {overpassQuery} from './prospects.js';

// Public community servers are best-effort, not guaranteed uptime.
// Queries are small and rate-limited by the caller, with original OSM attribution.
export const OVERPASS_SERVERS=Object.freeze([
 {name:'Overpass principal',url:'https://overpass-api.de/api/interpreter'},
 {name:'Overpass secundario',url:'https://overpass.kumi.systems/api/interpreter'},
 {name:'Overpass comunitario',url:'https://overpass.private.coffee/api/interpreter'}
]);
export async function fetchProspectsWithFallback(region,fetcher=fetch,{
 servers=OVERPASS_SERVERS,timeoutMs=10500
}={}){
 const query=overpassQuery(region),errors=[];
 for(const srv of servers){
  try{
   const response=await fetcher(srv.url,{
    method:'POST',
    headers:{
     'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',
     Accept:'application/json',
     'User-Agent':'ZenixAutoWorker/2.4 (OSM public business metadata; ODbL)'
    },
    body:new URLSearchParams({data:query}).toString(),
    signal:AbortSignal.timeout(timeoutMs)
   });
   if(!response?.ok){errors.push(srv.name+': HTTP '+(response?.status||'desconocido'));continue}
   const raw=await response.text();
   if(raw.length>450000)throw Error('datos demasiado extensos');
   let payload;try{payload=JSON.parse(raw)}catch{throw Error('formato JSON inválido')}
   if(!Array.isArray(payload?.elements))throw Error('respuesta de datos inválida');
   return {data:payload,provider:srv.name,attempts:errors.length+1};
  }catch(e){
   const msg=e?.name==='TimeoutError'?'tiempo de espera agotado':
    e?.message==='formato JSON inválido'?'formato JSON inválido':
    e?.message==='respuesta de datos inválida'?'respuesta de datos inválida':
    e?.message==='datos demasiado extensos'?'respuesta demasiado grande':'sin conexión';
   errors.push(srv.name+': '+msg);
  }
 }
 return {data:null,provider:null,attempts:servers.length,errors};
}
