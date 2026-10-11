// BasedAgents public task feed (read-only). Only verified on-platform escrow is
// considered financially backed. A listing is NOT a paid contract for our agent.
const URL='https://api.basedagents.ai/v1/tasks?status=open';
const BAD=/(?:test hire|please ignore|do not claim|will be cancelled|demo\b|sample\b|advertis(?:e|ing)|promot(?:e|ion)\b|cashback|revenue guard|retention trial|purchase|deposit|pay\s+(?:first|to)|referral|install.+(?:owned|external)\s+runtime|casino|captcha|watch\s+ads?|paid\s+surveys?)/i;
const money=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
export function classifyFundedAgentTasks(payload,now=Date.now()){
 if(payload?.ok!==true||!Array.isArray(payload.tasks))throw Error('BasedAgents cambió el formato de su API pública');
 const summary={examined:0,claimable:0,escrowFunded:0,excludedTest:0,notFunded:0,eligible:0};
 const candidates=[];
 for(const t of payload.tasks.slice(0,100)){
  summary.examined++;
  if(t?.status!=='open'||t.claimable!==true)continue;
  summary.claimable++;
  const amount=money(t?.bounty?.amount_display);
  const funded=t?.escrow?.status==='funded'&&String(t?.bounty?.token).toUpperCase()==='USDC'&&
    String(t?.bounty?.network)==='eip155:8453'&&amount!==null&&amount>0&&amount<=200;
  if(!funded){summary.notFunded++;continue}
  summary.escrowFunded++;
  const title=String(t?.title||'').trim().slice(0,170);
  const description=String(t?.description||'').trim().slice(0,800);
  const id=String(t?.task_id||'');
  const posted=Date.parse(t?.created_at||'');
  if(!/^task_[A-Za-z0-9]{8,64}$/.test(id)||!title||!description||
    BAD.test(title+' '+description)||!Number.isFinite(posted)||posted>now+3600000||
    now-posted>30*86400000){
    summary.excludedTest++;continue;
  }
  const task={
   id,source:'BasedAgents',title,description,reward:amount,currency:'USDC',
   escrowStatus:'funded',claimable:true,createdAt:new Date(posted).toISOString(),
   url:'https://basedagents.ai/tasks/'+id,
   note:'Recompensa USDC indicada como depositada en garantía por la API. No implica que AutoWorker ya pueda ejecutarla, reclamarla o cobrarla. Verificar antes de comprometerse.'
  };
  candidates.push(task);
 }
 summary.eligible=candidates.length;
 return {tasks:candidates.sort((a,b)=>b.reward-a.reward).slice(0,20),stats:summary};
}
export const BASEDAGENTS_TASK_FEED=URL;
