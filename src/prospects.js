// OpenStreetMap/Overpass: public business metadata, not proof of having no website.
// OpenStreetMap contributors; ODbL 1.0. Caller must retain attribution.
export const REGIONS=[
 {name:'Centro de Buenos Aires',city:'Buenos Aires',bbox:'-34.61,-58.40,-34.60,-58.38'},
 {name:'Palermo, Buenos Aires',city:'Buenos Aires',bbox:'-34.60,-58.44,-34.58,-58.41'},
 {name:'Centro de Córdoba',city:'Córdoba',bbox:'-31.426,-64.196,-31.408,-64.168'},
 {name:'Centro de Rosario',city:'Rosario',bbox:'-32.962,-60.656,-32.938,-60.628'},
 {name:'Centro de Mar del Plata',city:'Mar del Plata',bbox:'-38.015,-57.554,-37.990,-57.528'}
];
const BLOCKED_NAMES=/^(?:mcdonald(?:'s|s)?|starbucks|burger king|subway|carrefour|coto|jumbo|dia\s?%|shell|ypf|farmacity|mostaza)\b/i;
const TYPE_LABELS={
 bakery:'panadería',confectionery:'confitería',clothes:'indumentaria',bicycle:'bicicletería',
 books:'librería',optician:'óptica',hairdresser:'peluquería',beauty:'estética',
 shoes:'calzado',gift:'regalería',furniture:'muebles',pet:'mascotas',
 electronics:'electrónica',variety_store:'comercio',restaurant:'restaurante',
 cafe:'cafetería',fast_food:'comidas',butcher:'carnicería',florist:'florería',
 hardware:'ferretería',stationery:'librería comercial',mobile_phone:'telefonía'
};
export function overpassQuery(region=REGIONS[0]){
 if(!REGIONS.some(r=>r.bbox===region?.bbox))throw Error('Región no autorizada');
 // Limit area and results. OSM is collaborative; do not bulk-harvest.
 return '[out:json][timeout:16];('+
  'node["shop"]["name"]["phone"][!"website"][!"contact:website"]('+region.bbox+');'+
  'node["amenity"~"^(restaurant|cafe|fast_food)$"]["name"]["phone"][!"website"][!"contact:website"]('+region.bbox+');'+
  ');out 35;';
}
function bounded(value,max=160){return String(value||'').replace(/\s+/g,' ').trim().slice(0,max)}
export function extractProspects(data,region=REGIONS[0]){
 if(!Array.isArray(data?.elements))throw Error('Formato de OpenStreetMap no reconocido');
 return data.elements.slice(0,100).flatMap(el=>{
  const tags=el?.tags||{},kind=tags.shop||tags.amenity||'comercio',name=bounded(tags.name);
  const phone=bounded(tags.phone||tags['contact:phone'],45);
  if(!['node','way','relation'].includes(el?.type)||!Number.isSafeInteger(Number(el.id))||
    !name||name.length<3||BLOCKED_NAMES.test(name)||tags.brand||tags.website||tags['contact:website']||
    phone.replace(/\D/g,'').length<8)return [];
  if(/(?:t\.me\/|http|@)/i.test(phone))return [];
  const category=TYPE_LABELS[kind]||'comercio local';
  const url='https://www.openstreetmap.org/'+el.type+'/'+Number(el.id);
  const addr=bounded([tags['addr:street'],tags['addr:housenumber']].filter(Boolean).join(' '),125);
  const lead={id:'osm:'+el.type+':'+Number(el.id),name,phone,category,city:region.city,
    address:addr,osmUrl:url,
    reason:'No tiene web registrada en OpenStreetMap. Esto NO demuestra que carezca de sitio: verificar antes de contactar.',
    // A draft for the owner, never an automatic unsolicited message.
    pitch:'Hola, ¿cómo va? Soy de Zenix AR. Estoy buscando comercios de '+region.city+
     ' a los que podamos ayudar a conseguir más consultas y pedidos por internet. Me gustaría mostrarles una propuesta concreta para '+
     name+', con una página rápida para celulares y acceso directo a WhatsApp. ¿Con quién podría conversar sobre esto?'
  };
  return [lead];
 });
}
export function isValidPublicProspect(x){
 return x&&/^osm:(node|way|relation):\d+$/.test(x.id)&&typeof x.name==='string'&&
  x.name.length<=160&&typeof x.phone==='string'&&x.phone.length<=45&&
  /^https:\/\/www\.openstreetmap\.org\/(node|way|relation)\/\d+$/.test(x.osmUrl);
}
