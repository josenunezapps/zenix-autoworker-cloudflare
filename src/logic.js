// Every announcement is untrusted; only verified publisher fields can enable agent drafting.
export const VALID_GITHUB_ISSUE=/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+$/;
export function listBountyBoard(payload){
 if(!Array.isArray(payload?.bounties))throw Error('Formato BountyBoard no reconocido');
 return payload.bounties.slice(0,35).flatMap(b=>{
  const id=String(b?.id||''),reward=Number(b?.reward);
  if(!/^[A-Za-z0-9_-]{8,90}$/.test(id)||b.status!=='OPEN'||!Number.isInteger(reward)||reward<=0||reward>1e8)return [];
  const currency=String(b.currency||'USD').toUpperCase();
  if(!['USD','EUR','PLN','CZK','HUF'].includes(currency))return [];
  const claimed=Number(b?._count?.claims),max=Number(b.maxHunters);
  const slots=Number.isInteger(claimed)&&Number.isInteger(max)&&max>claimed&&max>0;
  const code=/development|software|programming|tech/i.test(String(b.category||''));
  const permitted=b.allowAgents===true&&slots&&code;
  const reason=!b.allowAgents?'El anunciante prohíbe agentes de IA.':!slots?'No quedan cupos confirmados.':!code?'No es programación.':'Permite agentes; pagos y condiciones todavía sin verificar.';
  return [{id:'bb:'+id,source:'BountyBoard',title:String(b.title||'Trabajo').slice(0,150),
   url:'https://www.bountyboard.work/bounties',description:String(b.description||'').slice(0,1700),
   amount:reward/100,currency,permitted,reason}];
 });
}
export function listOpire(payload){
 if(!Array.isArray(payload))throw Error('Formato Opire no reconocido');
 return payload.slice(0,35).flatMap(b=>{
  const id=String(b?.id||''),url=String(b?.url||''),amount=Number(b?.pendingPrice?.value);
  if(!/^[A-Za-z0-9_-]{8,90}$/.test(id)||!VALID_GITHUB_ISSUE.test(url)
   ||b?.pendingPrice?.unit!=='USD_CENT'||!Number.isInteger(amount)||amount<=0||amount>1e8)return [];
  return [{id:'opire:'+id,source:'Opire',title:String(b.title||'Recompensa').slice(0,150),
   url,description:'Recompensa anunciada en Opire; verificar si sigue abierta.',amount:amount/100,currency:'USD',
   permitted:false,reason:'La API pública no confirma permiso de agentes ni elegibilidad de cobro.'}];
 });
}
export function safeCodeOutput(content){return String(content||'').slice(0,17000)}
export function validAdminToken(header,secret){
 if(typeof secret!=='string'||secret.length<24||secret.length>512||typeof header!=='string'||!header.startsWith('Bearer '))return false;
 const given=header.slice(7);
 if(given.length!==secret.length)return false;
 let mismatch=0;for(let i=0;i<secret.length;i++)mismatch|=secret.charCodeAt(i)^given.charCodeAt(i);
 return mismatch===0;
}