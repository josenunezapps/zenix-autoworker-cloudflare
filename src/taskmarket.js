// Taskmarket public funded task feed. USD amounts are six-decimal USDC base units.
// Read-only discovery; claiming/submission requires a wallet signature and verified tests.
const RISK=/(?:\b(?:wallets?|deposit|stake|buy\s+tokens?|purchase|swap|trading|airdrop|promot(?:e|ion)|social\s+media|follow\s+on|like\s+the|referral|trust\s+triangle|install\s+container|install\s+.+runtime|private\s+key|seed\s+phrase|KYC|captcha|account\s+creation|pay\s+for|spend|fee\s+required|X402\s+payment)\b)/i;
const CODING=/(?:\b(?:github|issue|bug|fix|python|typescript|javascript|react|android|frontend|backend|api|code|software|program|database|automation|script|build|website|csv|JSON|test\s+suite|smart\s+contract)\b|desarrollar|aplicaci[oó]n|p[aá]gina\s+web)/i;
// A self-contained HTML/SVG deliverable is work the agent may be able to prepare,
// even if its creative brief does not mention typical software keywords.
const SELF_CONTAINED_ARTIFACT=/\b(?:self-contained|standalone|offline)(?:\s+(?:static|offline|interactive|single))?\s+(?:svg|html)\b/i;
const ID=/^0x[a-fA-F0-9]{64}$/;
export function screenTaskmarket(payload,now=Date.now()){
 if(!payload||!Array.isArray(payload.tasks))throw Error('Taskmarket: estructura no reconocida');
 const stats={seen:0,open:0,escrow:0,safeSoftware:0,excludedRisk:0};
 const entries=[];
 for(const t of payload.tasks.slice(0,60)){
  stats.seen++;
  const description=String(t?.description||'').slice(0,4000),id=String(t?.id||'');
  const reward=Number(t?.reward)/1000000;
  const expiry=Date.parse(t?.expiryTime||'');
  const created=Date.parse(t?.createdAt||'');
  if(!ID.test(id)||t?.status!=='open'||t?.phase!=='active'||t?.taskVisibility!=='public'||
    !['bounty','claim'].includes(t?.mode)||t?.claimedBy||t?.stakeRequired===true||
    !Number.isFinite(reward)||reward<1||reward>1000||description.length<60||
    !Number.isFinite(expiry)||expiry<now+6*3600000||!Number.isFinite(created)||created>now+3600000||
    now-created>14*86400000)continue;
  stats.open++;
  if(!/^0x[a-fA-F0-9]{64}$/.test(String(t?.escrowTxHash||'')))continue;
  stats.escrow++;
  if(RISK.test(description)){stats.excludedRisk++;continue}
  if(!CODING.test(description)&&!SELF_CONTAINED_ARTIFACT.test(description))continue;
  stats.safeSoftware++;
  const name=description.split('\n').find(x=>x.trim())?.trim().slice(0,150)||'Encargo de software';
  entries.push({id,title:name,description:description.slice(0,1500),
   reward:Math.round(reward*100)/100,currency:'USDC',mode:t.mode,source:'Taskmarket',
   url:'https://taskmarket.dev/tasks/'+id,deadline:new Date(expiry).toISOString(),
   escrowTxHash:String(t.escrowTxHash),
   category:'desarrollo',status:'requires_wallet_and_technical_review',
   note:t.mode==='claim'?'Requiere billetera con firma EIP-191, pruebas y aceptación del alcance antes de reclamar.':
     'Concurso con recompensa financiada: no garantiza ganar. Requiere billetera, firma y entregable probado.'});
 }
 return {tasks:entries.sort((a,b)=>b.reward-a.reward).slice(0,15),stats};
}
export const TASKMARKET_LIST='https://api.taskmarket.dev/api/tasks?status=open&limit=35&sort=newest';
