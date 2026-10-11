import {test} from 'node:test';
import assert from 'node:assert/strict';
import {REGIONS,overpassQuery,extractProspects,isValidPublicProspect} from '../src/prospects.js';
const sample={elements:[
 {type:'node',id:2142825905,tags:{name:'La Bombonella',phone:'+54 11 4371-0633',shop:'confectionery','addr:street':'Av Corrientes'}},
 {type:'node',id:12,tags:{name:'Web present',phone:'+54 11 5555-2222',shop:'bakery',website:'https://example.com'}},
 {type:'node',id:13,tags:{name:'Sin teléfono',shop:'books'}},
 {type:'node',id:14,tags:{name:'McDonalds',phone:'+54 11 2222-3333',shop:'fast_food'}},
 {type:'node',id:15,tags:{name:'Cafetería Sur',phone:'+54 11 5555-1234',amenity:'cafe'}},
]};
test('construye consulta Overpass acotada a Argentina',()=>{const q=overpassQuery();assert.match(q,/out 35/);assert.match(q,/-34\.61/);assert.throws(()=>overpassQuery({bbox:'0,0,90,90'}))});
test('detecta comercios públicos sin web registrada en OSM',()=>{
 const a=extractProspects(sample);assert.equal(a.length,2);assert.equal(a[0].name,'La Bombonella');assert.equal(a[0].category,'confitería');assert.equal(a[1].category,'cafetería');
});
test('filtra cadenas, teléfonos ausentes y empresas con web registrada',()=>assert.equal(extractProspects(sample).length,2));
test('las propuestas no afirman falsamente que el negocio carece de web',()=>{
 const a=extractProspects(sample)[0];assert.ok(a.reason.includes('NO demuestra'));assert.doesNotMatch(a.pitch,/no ten[eé]s|sin p[aá]gina|carece de web/i);
});
test('conserva atribución verificable de OpenStreetMap',()=>{
 const a=extractProspects(sample)[0];assert.equal(isValidPublicProspect(a),true);assert.equal(a.osmUrl,'https://www.openstreetmap.org/node/2142825905');
});
test('rechaza respuestas de origen desconocido',()=>assert.throws(()=>extractProspects({})));
