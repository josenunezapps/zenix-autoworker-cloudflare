// Persistent login via a signed, HttpOnly first-party cookie, not localStorage.
export const SESSION_SECONDS=7*24*60*60;
export const COOKIE_NAME='__Host-zenix_session';

function validSecret(secret){return typeof secret==='string'&&secret.length>=24&&secret.length<=512}
function toBase64Url(buffer){
 const b64=btoa(String.fromCharCode(...new Uint8Array(buffer)));
 return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function signature(secret,expires){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return toBase64Url(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('zenix-autoworker-session:v1:'+expires)));
}
export async function createSessionValue(secret,nowMs=Date.now()){
 if(!validSecret(secret))throw Error('El secreto administrador no está configurado correctamente');
 const exp=Math.floor(nowMs/1000)+SESSION_SECONDS;
 return exp+'.'+await signature(secret,exp);
}
export async function verifySessionValue(value,secret,nowMs=Date.now()){
 if(!validSecret(secret)||typeof value!=='string'||!/^(\d{10,11})\.([A-Za-z0-9_-]{43})$/.test(value))return false;
 const [date,mac]=value.split('.');
 const exp=Number(date),now=Math.floor(nowMs/1000);
 if(!Number.isSafeInteger(exp)||exp<=now||exp>now+SESSION_SECONDS)return false;
 const expected=await signature(secret,exp);
 if(expected.length!==mac.length)return false;
 let difference=0;for(let i=0;i<mac.length;i++)difference|=mac.charCodeAt(i)^expected.charCodeAt(i);
 return difference===0;
}
export function cookieValue(header){
 if(typeof header!=='string')return '';
 const match=header.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE_NAME+'='));
 return match?match.slice(COOKIE_NAME.length+1):'';
}
export function sessionCookie(value){
 return COOKIE_NAME+'='+value+'; Path=/; Max-Age='+SESSION_SECONDS+'; Secure; HttpOnly; SameSite=Strict';
}
export function expireSessionCookie(){
 return COOKIE_NAME+'=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict';
}
export function safePostOrigin(request){
 const origin=request.headers.get('Origin');
 return origin===new URL(request.url).origin;
}
