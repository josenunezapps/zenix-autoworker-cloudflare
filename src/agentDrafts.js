// Conservative gate: only prepare text deliverables for self-contained, funded agent tasks.
// A draft is NOT a claim, submission, accepted contract or confirmed payment.
const TEXT_JOB=/\b(?:translat(?:e|ion)|proofread|summari[sz](?:e|ation)|format\s+(?:the\s+)?(?:text|csv|json)|classif(?:y|ication)|categor(?:ize|ise)|extract\s+(?:fields?|keywords?)|tradu(?:cir|cci[oó]n)|resum(?:ir|en)|corregir\s+texto)\b/i;
const EXTERNAL=/\b(?:browse|research\s+online|search\s+the\s+web|visit\s+(?:a\s+)?website|external\s+(?:file|link)|url|https?:|download|attach(?:ment|ed)|upload|log\s*in|credentials|api\s+key|private\s+key|seed\s+phrase|wallet|pay\s+(?:a\s+)?fee|deposit|purchase|captcha|review\s+on\s+google|post\s+(?:on|to)\s+(?:social|instagram)|human\s+only|no\s+ai|without\s+ai|survey|watch\s+ads|fake\s+review)\b/i;
const INPUT=/(?:^|\n)\s*(?:input|text|source\s+text|content|data|texto|datos)\s*:\s*([\s\S]{80,2500})/i;
export function isSelfContainedAgentTask(job){
 if(!job||job.source!=='BasedAgents'||job.escrowStatus!=='funded'||job.currency!=='USDC'||
    !Number.isFinite(job.reward)||job.reward<=0||job.reward>50)return false;
 const title=String(job.title||'').slice(0,180);
 const description=String(job.description||'').slice(0,4000);
 if(!TEXT_JOB.test(title)||EXTERNAL.test(title+' '+description))return false;
 const match=description.match(INPUT);
 const payload=match?.[1]?.trim()||'';
 return payload.length>=80&&payload.length<=2300;
}
export function validateAgentDraft(value){
 const body=String(value||'').trim();
 if(body.length<35||body.length>6500||
   /\b(?:DATOS_INSUFICIENTES|INSUFFICIENT_DATA|cannot\s+complete|unable\s+to\s+complete|no\s+puedo\s+completar|password|seed\s+phrase|private\s+key)\b/i.test(body))return null;
 return body;
}
