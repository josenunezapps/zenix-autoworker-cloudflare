// Convert opportunity feeds into an honest work queue.
// A "ready" opportunity means only that the agent can attempt a draft.
// It is NOT a paid order, a completed deliverable, or a verified payment.
// Title must clearly describe development work, not merely mention an app in the description.
// "iOS UGC Campaign", "app marketing", and technical writing are not software contracts.
const SOFTWARE_TARGET=/(?:\b(?:website|web\s*site|web\s*app|landing\s+page|application|app|android|ios|react|vue|node\.?js|python|software|saas|api|dashboard|automation|script|csv|excel|database|frontend|backend|plugin|wordpress|shopify|woocommerce|chatbot|bot|server|ecommerce|e-commerce)\b|p[aá]gina\s+web|sitio\s+web|tienda\s+online|aplicaci[oó]n|automatiz|desarrollo\s+web)/i;
const DEVELOPMENT_INTENT=/(?:\b(?:build|create|develop|implement|fix|debug|maintain|rewrite|integrate|customi[sz]e|deploy|redesign|migrate|code|coding|program|configure|refactor|developer|programmer|engineer|ui\s+(?:design|specialist)|web\s+design|developing)\b|crear|programar|desarrollar|corregir|automatizar|implementar|arreglar|diseñar)/i;
const NOT_SOFTWARE=/(?:\b(?:ugc|user.generated.content|campaign|local gems|content creator|influencer|social media|tiktok|instagram|video\s+clips?|video\s+editing|ad\s+creatives?|paid\s+reviews?|app\s+downloads?|app\s+marketing|research\s+brief|writing\s+brief|technical\s+writing|data\s+entry|manual\s+testing|user\s+testing)\b)/i;
export function isSoftwareContract(title,description=''){
 const t=asText(title,250),d=asText(description,500);
 if(NOT_SOFTWARE.test(t))return false;
 if(!SOFTWARE_TARGET.test(t))return false;
 // Explicit technical job titles count even without a verb.
 const role=/(?:\b(?:developer|programmer|software\s+engineer|web\s+designer|ui\s+specialist|api\s+integrator)\b)/i.test(t);
 return role||DEVELOPMENT_INTENT.test(t)||DEVELOPMENT_INTENT.test(d);
}
const BUSINESS=/\b(?:casino|gambling|sportsbook|captcha|click\s+ads?|watch\s+ads?|fake\s+reviews?|surveys?\s+for\s+pay)\b/i;
const asText=(v,max=200)=>String(v??'').trim().slice(0,max);
const number=v=>Number.isFinite(Number(v))?Number(v):0;
const isTrue=x=>x===true||x===1||x==='1';
function parseAge(when,now){const date=Date.parse(String(when||''));return Number.isFinite(date)?Math.max(0,Math.floor((now-date)/86400000)):null}
export function buildWorkboard({microtasks=[],bounties=[],artifacts=[],applications=[]},now=Date.now()){
 const agent=[],handoff=[],verify=[],discard=[],seen=new Set();
 let archived=0,notSoftware=0;
 const prepared=new Set(artifacts.map(a=>a.taskId||a.task_id));
 const submitted=new Map(applications.map(a=>[a.taskId||a.task_id,asText(a.status,36)]));
 for(const item of microtasks){
  const id=asText(item.id,130);
  if(!/^ugig:[a-f0-9-]{36}$/i.test(id)||seen.has(id))continue;seen.add(id);
  const title=asText(item.name,165),brief=asText(item.brief,900);
  if(BUSINESS.test(title+' '+brief)){discard.push(id);continue}
  const age=parseAge(item.createdAt||item.created_at,now);
  const amount=number(item.budgetMax??item.budget_max);
  const currency=asText(item.currency||'POR_CONFIRMAR',18);
  const draft=prepared.has(id),application=submitted.get(id)||null;
  const common={id,title,source:'ugig',url:asText(item.url,450),
   description:brief,amount,currency,ageDays:age,
   postedBy:asText(item.poster,80),reason:asText(item.reason,220),
   draftExists:draft,application};
  const ready=isTrue(item.ready)&&age!==null&&age<=45&&amount>=1&&amount<=50&&currency!=='POR_CONFIRMAR';
  if(ready){agent.push({...common,status:draft?'borrador_pendiente_de_prueba':'puede_intentar_borrador',
   note:'Solo es posible preparar un resultado; aceptar el trabajo, probarlo y cobrar son etapas distintas.'});continue}
  // Old public listings should not overwhelm the dashboard as if still hiring.
  if(age!==null&&age>95){archived++;continue}
  const software=isSoftwareContract(title,brief);
  if(software&&age!==null&&amount>=1){
   handoff.push({...common,status:'para_evaluar',note:'Posible encargo de desarrollo para vos. Confirmá que la contratación siga abierta y el pago antes de postularte.'});continue;
  }
  if(!software)notSoftware++;
  if(age!==null&&amount>=1){
   verify.push({...common,status:'por_verificar',note:'No es un encargo de software claramente confirmado. Solo valorar si es un trabajo real y reciente.'});
  }else discard.push(id);
 }
 for(const item of bounties){
  const id=asText(item.id,130);if(!id||seen.has(id))continue;seen.add(id);
  const title=asText(item.title,165),description=asText(item.description,900);
  if(!isSoftwareContract(title,description)||BUSINESS.test(title+' '+description)){notSoftware++;continue}
  const common={id,title,source:asText(item.source,36),url:asText(item.url,450),
   description,amount:number(item.amount),currency:asText(item.currency,20),
   ageDays:null,postedBy:null,reason:asText(item.reason,220),draftExists:false,application:null};
  if(isTrue(item.permitted))verify.push({...common,status:'por_verificar',note:'Autoriza agentes, pero faltan verificar requisitos y condiciones de cobro.'});
  else handoff.push({...common,status:'para_evaluar',note:'Posible encargo de software. Verificá si está abierto, el pago y las condiciones antes de postularte.'});
 }
 const high=(arr)=>arr.sort((a,b)=>Number(b.amount)-Number(a.amount));
 const stats={agentCandidates:agent.length,needsYou:handoff.length,toVerify:verify.length,
  draftsPendingReview:agent.filter(x=>x.draftExists).length,
  applicationsSubmitted:applications.filter(x=>asText(x.status,32)==='submitted').length,
  archivedOldListings:archived,excludedNonSoftware:notSoftware,
  paymentsConfirmed:0,paymentTracking:'sin_sistema_de_verificacion'};
 return {agent:high(agent).slice(0,20),handoff:high(handoff).slice(0,25),
  verify:verify.slice(0,14),stats,
  warning:'No hay cobros validados. Un anuncio o una postulación no son ingresos.'};
}
