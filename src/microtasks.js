// AI-friendly small job discovery. These listings are NOT proof of payment.
// No paid survey, ad-view farming, captcha, false testimonials, gambling or identity spoofing.
const REJECT=/\b(captcha|hcaptcha|recaptcha|watch\s+ads?|view\s+ads?|ad\s+clicks?|paid\s+surveys?|survey\s+respondent|human\s+opinion|personal\s+experience|human\s+only|no\s+ai|without\s+ai|prohibit.*\bai\b|fake\s+reviews?|fake\s+accounts?|kyc|seed\s+phrase|private\s+key|deposit\s+first|pay\s+first|gambl(?:e|ing)|sportsbook|odds\s+arbitrage|affiliate\s+signup|referral\s+farm|boost\s+likes|instagram\s+follows?|spam)\b/i;
const SELLER=/^\s*(i\s+will\b|i\s+can\b|offering\b|my\s+service\b|for\s+hire\b|hire\s+me\b)/i;
const SELLER_DESC=/^\s*(?:i\s*(?:will|'ll)\b|i\s+can\b|we\s+(?:will|offer|provide)\b|our\s+service\b|i\s+provide\b)/i;
const ACCEPT=/\b(?:translate|translation|proofread|summari[sz]e|categorize|categorise|classify|format\s+text|write\s+a\s+description|create\s+product\s+copy|extract\s+from\s+the\s+following)\b/i;
const NEEDS_INPUT=/\b(?:upload|attached|attachments?|send\s+(?:me\s+)?(?:a\s+)?file|send\s+(?:me\s+)?(?:the\s+)?(?:csv|pdf|video)|provide\s+(?:me\s+)?(?:a\s+)?(?:dataset|document|file)|need\s+access|access\s+to\s+(?:our|my)|login|password|source\s+repo|github\s+repo|website\s+credentials)\b/i;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function screenGig(g,now=Date.now()){
 if(!g||typeof g!=='object'||!UUID.test(String(g.id||''))||g.status!=='active'||g.listing_type!=='hiring')return null;
 const name=String(g.title||'').trim().slice(0,160);
 const brief=String(g.description||'').trim().slice(0,5000);
 if(name.length<9||brief.length<55||SELLER.test(name)||SELLER_DESC.test(brief)||REJECT.test(name+' '+brief))return null;
 if(!['Development','Data','Design','Writing','Research','development','data','design','writing','research'].includes(String(g.category||'')))return null;
 const date=Date.parse(g.created_at||'');
 if(!Number.isFinite(date)||date>now+86400000||now-date>365*86400000)return null;
 const ageDays=Math.floor((now-date)/86400000);
 const min=Number(g.budget_min),max=Number(g.budget_max);
 if(!Number.isFinite(min)||!Number.isFinite(max)||min<1||max>500||max<min)return null;
 const seller=String(g.poster?.username||'Anunciante').slice(0,70);
 const postedByHuman=g.poster?.account_type==='human';
 if(!postedByHuman)return null;
 const verified=g.poster?.verified===true;
 // Do not treat bare numeric budgets as dollars when their unit is missing.
 const unit=String(g.budget_unit||'').toUpperCase(),coin=String(g.payment_coin||'').toUpperCase();
 const currency=['USD','USDC'].includes(unit)?unit:coin==='USDC'||coin.startsWith('USDC_')?'USDC':'POR_CONFIRMAR';
 const aiTools=Array.isArray(g.ai_tools_preferred)?g.ai_tools_preferred.filter(x=>typeof x==='string').slice(0,6):[];
 const aiAllowed=aiTools.length>0&&!/\b(no\s+ai|without\s+ai|human\s+only)\b/i.test(brief);
 const complete=ACCEPT.test(name+' '+brief)&&!NEEDS_INPUT.test(brief)&&brief.length>=125&&/\b(?:text:|content:|input:|following\s+text|below|the\s+following)\b/i.test(brief);
 const recent=ageDays<=45;
 const microBudget=max<=50;
 const ready=verified&&aiAllowed&&currency!=='POR_CONFIRMAR'&&complete&&recent&&microBudget;
 let reason=ready?'Solicitud reciente, anunciante verificado, uso de IA indicado y requisitos con datos completos. Aún hay que verificar el pago.':
  !recent?'Anuncio antiguo ('+ageDays+' días). Comprobar si todavía contrata; no postular automáticamente.':
  !microBudget?'Presupuesto superior al rango de microtrabajos (USD 1–50); revisión manual.':
  !verified?'Anunciante sin verificación pública. No postular automáticamente.':
  currency==='POR_CONFIRMAR'?'La moneda del presupuesto no está confirmada.':
  !aiAllowed?'No indicó expresamente las herramientas de IA que acepta.':
  !complete?'Faltan datos necesarios para completar el trabajo sin hablar con el cliente.':'Revisar condiciones.';
 return {id:'ugig:'+g.id,externalId:g.id,source:'ugig',name,brief,category:String(g.category),
  url:'https://ugig.net/gigs/'+g.id,poster:seller,budgetMin:min,budgetMax:max,
  currency,verified,aiAllowed,ready,complete,reason,ageDays,createdAt:new Date(date).toISOString()};
}
export function screenUgigList(payload,now=Date.now()){
 if(!payload||!Array.isArray(payload.gigs))throw Error('Respuesta ugig inválida');
 return payload.gigs.slice(0,50).map(x=>screenGig(x,now)).filter(Boolean);
}
export function makeHonestApplication(job){
 if(!job?.ready||job.source!=='ugig')throw Error('Trabajo no apto para solicitud automática');
 return {gig_id:job.externalId,
  cover_letter:'Hola, soy Zenix AutoWorker, agente de IA de Zenix AR. Puedo preparar una solución para esta tarea utilizando herramientas de IA y compartir resultados verificables. No afirmo que el encargo esté terminado ni que haya comprobado el pago. Si te interesa, confirmame los criterios de aceptación y el método de pago antes de la entrega.',
  proposed_rate:job.budgetMin,proposed_timeline:'A coordinar según requisitos',
  ai_tools_to_use:['Cloudflare Workers AI']};
}