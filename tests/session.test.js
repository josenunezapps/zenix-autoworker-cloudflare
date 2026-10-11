import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COOKIE_NAME,SESSION_SECONDS,createSessionValue,verifySessionValue,cookieValue,sessionCookie,expireSessionCookie,safePostOrigin} from '../src/session.js';
const secret='safe-test-token-not-a-real-secret-1234567890',now=1791730000000;
test('firma sesión por siete días y acepta su cookie',async()=>{
 const value=await createSessionValue(secret,now);
 assert.equal(await verifySessionValue(value,secret,now),true);
 assert.equal(cookieValue('foo=bar; '+sessionCookie(value)+'; other=x'),value);
 assert.equal(SESSION_SECONDS,604800);
});
test('rechaza sesión manipulada',async()=>{
 const value=await createSessionValue(secret,now);
 const changed=value.slice(0,-1)+(value.at(-1)==='a'?'b':'a');
 assert.equal(await verifySessionValue(changed,secret,now),false);
 assert.equal(await verifySessionValue(value,secret+'X',now),false);
});
test('rechaza sesión vencida y fechas futuras imposibles',async()=>{
 const value=await createSessionValue(secret,now);
 assert.equal(await verifySessionValue(value,secret,now+(SESSION_SECONDS+1)*1000),false);
 assert.equal(await verifySessionValue(value,secret,now-60000),false);
});
test('no filtra token a JavaScript y permite borrar cookie',()=>{
 const cookie=sessionCookie('dummy');
 assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);
 assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Max-Age=604800/);
 assert.match(expireSessionCookie(),/Max-Age=0/);assert.ok(cookie.startsWith(COOKIE_NAME+'='));
});
test('bloquea solicitudes POST de orígenes ajenos',()=>{
 const mk=origin=>({url:'https://zenix-auto.example/api/run',headers:new Headers({'Origin':origin})});
 assert.equal(safePostOrigin(mk('https://zenix-auto.example')),true);
 assert.equal(safePostOrigin(mk('https://evil.example')),false);
 assert.equal(safePostOrigin({url:'https://zenix-auto.example/api/run',headers:new Headers()}),false);
});
