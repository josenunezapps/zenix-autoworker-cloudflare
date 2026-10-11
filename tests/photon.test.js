import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starterProspects} from '../src/prospectSeeds.js';
import {selectNearbyPhoton,candidateFromOsmNode,discoverWithPhoton} from '../src/photon.js';
import {REGIONS} from '../src/prospects.js';
const region=REGIONS[0];
const p={features:[
 {properties:{name:'La Bombonella',osm_type:'N',osm_id:2142825905,osm_key:'shop'},geometry:{coordinates:[-58.3876105,-34.6039566]}},
 {properties:{name:'Cafe Far',osm_type:'N',osm_id:200,osm_key:'amenity'},geometry:{coordinates:[-60.0,-32.0]}},
 {properties:{name:'No match',osm_type:'N',osm_id:201,osm_key:'highway'},geometry:{coordinates:[-58.39,-34.605]}}
]};
test('starter contains verified public business leads with OSM attribution',()=>{
 const v=starterProspects();assert.equal(v.length,6);
 assert.equal(v[0].name,'La Bombonella');assert.ok(v[0].phone.startsWith('+54'));
 assert.ok(v.every(x=>x.osmUrl.startsWith('https://www.openstreetmap.org/')));
});
test('Photon selects only nearby POIs',()=>{
 const n=selectNearbyPhoton(p,region);
 assert.equal(n.length,1);assert.equal(n[0].id,2142825905);
});
test('OSM detail without phone is only research lead, never invented phone',()=>{
 const p=candidateFromOsmNode({elements:[{type:'node',id:200,tags:{name:'Local de prueba',shop:'bakery'}}]},region);
 assert.ok(p);assert.equal(p.phone,'');assert.match(p.reason,/sin teléfono/);
});
test('discard places with existing website',()=>{
 const r=candidateFromOsmNode({elements:[{type:'node',id:201,tags:{name:'Con Página Web',shop:'bakery',website:'https://example.com'}}]},region);
 assert.equal(r,null);
});
test('finds a business and verifies original OSM tags',async()=>{
 const fetcher=async url=>({ok:true,status:200,text:async()=>JSON.stringify(url.includes('photon.')?p:{elements:[{type:'node',id:2142825905,tags:{name:'La Bombonella',shop:'confectionery',phone:'+54 11 4371-0633'}}]})});
 const r=await discoverWithPhoton(region,fetcher,0);
 assert.equal(r.leads.length,1);assert.equal(r.leads[0].name,'La Bombonella');assert.equal(r.provider,'Photon + OpenStreetMap');
});
