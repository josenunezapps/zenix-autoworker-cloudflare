// Verified against official OSM node JSON endpoints on 2026-10-11.
// Cached starter examples: phone / website may change; must be rechecked before contacting.
// Attribution: © OpenStreetMap contributors, ODbL 1.0.
import {REGIONS,extractProspects} from './prospects.js';
const CACHED=[
 [2142825905,'La Bombonella','confectionery','+54 11 4371-0633','Avenida Corrientes','471'],
 [4353158623,'Bike Shop','bicycle','+54 11 4383-3925','Talcahuano','10'],
 [4454200989,'OPTICIENS','optician','+54 11 4371-2289','Teniente General Juan Domingo Perón','1507'],
 [4675151220,'Dickens','books','+54 11 4375-1702','Avenida Corrientes','1375'],
 [7143054285,'LaGolosineria','variety_store','+54 11 5263-9520','Avenida Rivadavia','2181'],
 [9981800863,'Le Cuer','leather','+54 11 43827878','Paraná','282']
];
export function starterProspects(){
 return extractProspects({elements:CACHED.map(([id,name,shop,phone,street,number])=>({
  type:'node',id,tags:{name,shop,phone,'addr:street':street,'addr:housenumber':number}
 }))},REGIONS[0]).map(x=>({...x,
  reason:'Contacto publicado en OpenStreetMap y verificado el 11/10/2026. La ficha no registraba página web entonces; comprobar datos vigentes antes de escribirle.'}));
}
