// Convert opportunity feeds into an honest work queue.
// A "ready" opportunity means only that the agent can attempt a draft.
// It is NOT a paid order, a completed deliverable, or a verified payment.
const SOFTWARE=/(?:web(?:site|page| app)?|landing\s+page|application|app\b|android|ios\b|mobile|react|vue|node\.?js|python|software|saas|api\b|dashboard|automation|automatiz|script|csv|spreadsheet|excel|database|frontend|backend|program|desarroll|sitio|página|tienda\s+online|shopify|wordpress|woocommerce|bot\b)/i;
const BUSINESS=/\b(?:casino|gambling|sportsbook|captcha|click\s+ads?|watch\s+ads?|fake\s+reviews?|surveys?\s+for\s+pay)\b/i;
const asText=(v,max=200)=>String(v??'').trim().slice(0,max);
const number=v=>Number.isFinite(Number(v))?Number(v):0;
const isTrue=x=>x===true||x===1||x==='1';
function parseAge(when,now){const date=Date.parse(String(when||''));return Number.isFinite(date)?Math.max(0,Math.floor((now-date)/86400000)):null}
export function buildWorkboard({microtasks=[],bounties=[],artifacts=[],applications=[]},now=Date.now()){
 const agent=[],handoff=[],verify=[],discard=[],seen=new Set();
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
  const software=SOFTWARE.test(title+' '+brief);
  if(software&&age!==null&&age<=95&&amount>=1){
   handoff.push({...common,status:'para_evaluar',note:'Proyecto potencial para vos. Confirmá vigencia, alcance, cliente y forma de pago antes de aceptar.'});continue;
  }
  if(age!==null&&age<=365&&amount>=1){
   verify.push({...common,status:'por_verificar',note:age>95?'Anuncio antiguo: podría estar cerrado.':'No reúne condiciones para que la IA se haga cargo automáticamente.'});
  }else discard.push(id);
 }
 for(const item of bounties){
  const id=asText(item.id,130);if(!id||seen.has(id))continue;seen.add(id);
  const title=asText(item.title,165),description=asText(item.description,900);
  if(!SOFTWARE.test(title+' '+description)||BUSINESS.test(title+' '+description))continue;
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
  paymentsConfirmed:0,paymentTracking:'sin_sistema_de_verificacion'};
 return {agent:high(agent).slice(0,20),handoff:high(handoff).slice(0,25),
  verify:verify.slice(0,14),stats,
  warning:'No hay cobros validados. Un anuncio o una postulación no son ingresos.'};
}
