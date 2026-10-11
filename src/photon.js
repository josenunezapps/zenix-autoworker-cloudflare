// Photon is a small text place-search service backed by OpenStreetMap.
// No scraping of web pages; place tags are verified individually at OSM official read API.
// Maximum 1 public Photon query and 8 place reads per scan.
import {REGIONS,extractProspects} from './prospects.js';
const TERMS=['cafe','panaderia','peluqueria','optica','confiteria'];
const TYPE={N:'node',W:'way',R:'relation'};
function asNumber(v){return Number.isFinite(Number(v))?Number(v):NaN}
export function selectNearbyPhoton(payload,region=REGIONS[0],max=8){
 if(!Array.isArray(payload?.features))throw Error('Photon cambió su formato');
 const [s,w,n,e]=region.bbox.split(',').map(Number);
 const seen=new Set(),result=[];
 for(const f of payload.features){
  const p=f?.properties||{},coordinates=f?.geometry?.coordinates||[];
  const [lon,lat]=coordinates.map(asNumber),id=asNumber(p.osm_id),osmType=TYPE[p.osm_type];
  const name=String(p.name||'').trim();
  if(!osmType||!Number.isSafeInteger(id)||id<=0||!Number.isFinite(lat)||!Number.isFinite(lon)||
   lat<s||lat>n||lon<w||lon>e||!/^(shop|amenity)$/.test(String(p.osm_key||''))||
   name.length<4||name.length>130||/^(?:caf[eé]|panader[ií]a|peluquer[ií]a|[oó]ptica)$/i.test(name))continue;
  const key=osmType+':'+id;if(seen.has(key))continue;seen.add(key);
  result.push({type:osmType,id,name});
  if(result.length>=max)break;
 }
 return result;
}
export function candidateFromOsmNode(data,region=REGIONS[0]){
 if(!Array.isArray(data?.elements))throw Error('Respuesta OSM no válida');
 const original=data.elements[0];
 if(!original||!original.tags)return null;
 // Respect any website annotation, even if search engine omitted it.
 if(original.tags.website||original.tags['contact:website'])return null;
 const tag=original.tags,name=String(tag.name||'').trim();
 const direct=extractProspects({elements:[original]},region)[0];
 if(direct)return direct;
 if(!name||name.length<4||!/^(node|way|relation)$/.test(original.type)||!Number.isSafeInteger(Number(original.id))||
  tag.brand||!tag.shop&&!tag.amenity||/^(?:caf[eé]|panader[ií]a|peluquer[ií]a|[oó]ptica)$/i.test(name))return null;
 const street=[tag['addr:street'],tag['addr:housenumber']].filter(Boolean).join(' ').slice(0,120);
 return {id:'osm:'+original.type+':'+original.id,name:name.slice(0,130),phone:'',
  category:String(tag.shop||tag.amenity||'comercio local').slice(0,70),city:region.city,
  address:street,osmUrl:'https://www.openstreetmap.org/'+original.type+'/'+original.id,
  reason:'Negocio localizado en OpenStreetMap sin teléfono registrado. Verificar en su ficha o en canales oficiales antes de contactar; la ausencia de web en OSM no prueba que no tenga página.',
  pitch:'Hola, ¿cómo va? Soy de Zenix AR. Me gustaría compartirles una propuesta de página web para '+name.slice(0,95)+
  ', pensada para facilitar consultas y pedidos desde el celular. ¿Con quién podría conversar sobre la propuesta?'};
}
export async function discoverWithPhoton(region=REGIONS[0],fetcher=fetch,attempt=0){
 const [s,w,n,e]=region.bbox.split(',').map(Number);
 const lat=(s+n)/2,lon=(w+e)/2;
 const term=TERMS[attempt%TERMS.length];
 const url='https://photon.komoot.io/api/?q='+encodeURIComponent(term)+'&lat='+lat+'&lon='+lon+'&limit=50';
 const response=await fetcher(url,{headers:{Accept:'application/json','User-Agent':'ZenixAutoWorker/2.5 (OSM POI research; ODbL)'},signal:AbortSignal.timeout(9000)});
 if(!response.ok)throw Error('Photon HTTP '+response.status);
 const body=await response.text();
 if(body.length>240000)throw Error('Respuesta Photon demasiado extensa');
 const nearby=selectNearbyPhoton(JSON.parse(body),region,8);
 const leads=[],errors=[];
 for(const candidate of nearby){
  try{
   const read='https://www.openstreetmap.org/api/0.6/'+candidate.type+'/'+candidate.id+'.json';
   const r=await fetcher(read,{headers:{Accept:'application/json','User-Agent':'ZenixAutoWorker/2.5 (OSM business tag verification)'},signal:AbortSignal.timeout(5500)});
   if(!r.ok){errors.push('OSM '+r.status);continue}
   const data=await r.text();if(data.length>90000)continue;
   const result=candidateFromOsmNode(JSON.parse(data),region);
   if(result)leads.push(result);
  }catch{errors.push('detalle OSM no disponible')}
 }
 return {leads,provider:'Photon + OpenStreetMap',examined:nearby.length,term,errors};
}
