// Jobicy free public feed: remote employment and contract listings, not coding bounties.
// Attribution and original Jobicy URLs are mandatory. API currently covers last 7 days.
// Source: https://jobicy.com/jobs-rss-feed (terms permit reuse and require credit).
const DEVELOPMENT=/(?:\b(?:developer|development|software|frontend|front.end|backend|back.end|full.stack|engineer|programmer|wordpress|shopify|website|web\s+designer|react|flutter|android|ios\s+developer|python|javascript|automation|devops|qa\s+automation|api\s+integration|ux\/ui|product\s+designer)\b|desarrollador|programador|aplicaciones|aplicaci[oó]n)/i;
const QUALIFIED_TYPE=/(?:\b(?:contract|contractor|freelance|freelancer|project.based|temporary|consultant)\b)/i;
// Conservative location fit for a candidate residing in Argentina.
// Remote does not mean globally available: preserve only explicitly global or LATAM offers.
const ALLOWED_GEO=/(?:\b(?:worldwide|global|anywhere|latam|latin\s+america|south\s+america|argentina|americas|international|remote\s+worldwide)\b)/i;
const RESTRICTED_GEO=/(?:\b(?:usa|u\.s\.a\.|united\s+states|us\s+only|north\s+america|europe|european|emea|italy|italia|canada|uk|united\s+kingdom|australia|india|apac|germany|france|spain|netherlands|ireland)\b)/i;
const TITLE_RESTRICTION=/\b(?:remote\s+in|based\s+in|located\s+in|only\s+in|anywhere\s+in)\s+(?:italy|europe|usa|uk|canada|india|australia)\b/i;
export function suitableForArgentina(geo,title=''){
 const place=String(geo||'').trim(),name=String(title||'');
 if(!place||TITLE_RESTRICTION.test(name))return false;
 if(RESTRICTED_GEO.test(place))return false;
 return ALLOWED_GEO.test(place);
}
const SIMPLE_HTML=/<[^>]*>/g;
function stripHtml(text,max=540){return String(text||'').replace(SIMPLE_HTML,' ').replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi,' ').replace(/\s+/g,' ').trim().slice(0,max)}
export function screenJobicy(payload,now=Date.now()){
 if(!Array.isArray(payload?.jobs)||payload.success===false)throw Error('La API Jobicy devolvió un formato distinto');
 const result=[];
 for(const j of payload.jobs.slice(0,150)){
  const id=Number(j?.id),title=String(j?.jobTitle||'').trim().slice(0,160),
  types=Array.isArray(j?.jobType)?j.jobType.map(String):[String(j?.jobType||'')],
  typeText=types.join(' / '),geo=String(j?.jobGeo||'').slice(0,90);
  const when=Date.parse(j?.pubDate||'');
  const source=String(j?.url||'');
  if(!Number.isSafeInteger(id)||id<1||title.length<7||!DEVELOPMENT.test(title)||
    !QUALIFIED_TYPE.test(typeText)||!suitableForArgentina(geo,title)||
    !Number.isFinite(when)||when>now+3600000||now-when>8*86400000||
    !/^https:\/\/(?:www\.)?jobicy\.com\/jobs\//i.test(source))continue;
  const company=String(j?.companyName||'Empresa sin nombre publicado').trim().slice(0,100);
  result.push({id:'jobicy:'+id,source:'Jobicy',title,company,url:source,
    jobType:typeText.slice(0,75),location:geo||'Ubicación por verificar',
    publishedAt:new Date(when).toISOString(),
    summary:stripHtml(j?.jobExcerpt||j?.jobDescription,580),
    salaryText:Number.isFinite(Number(j?.salaryMin))&&Number(j.salaryMin)>0?
     String(j.salaryCurrency||'moneda no indicada')+' '+Number(j.salaryMin)+
      (Number(j.salaryMax)>0?'–'+Number(j.salaryMax):'')+' por '+String(j.salaryPeriod||'período no indicado'):'Salario no publicado',
    note:'Vacante reciente de contrato/freelance. No es un microtrabajo garantizado. Requiere postulación humana y verificación de requisitos, ubicación y pago.'});
 }
 return [...new Map(result.map(x=>[x.id,x])).values()];
}
