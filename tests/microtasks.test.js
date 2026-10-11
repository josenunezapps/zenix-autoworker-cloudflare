import {test} from 'node:test';
import assert from 'node:assert/strict';
import {screenGig,screenUgigList,makeHonestApplication} from '../src/microtasks.js';
const now=Date.parse('2026-10-11T22:00:00Z');
const base={id:'11111111-2222-4333-8444-555555555555',status:'active',listing_type:'hiring',category:'Writing',
 title:'Translate the following text to Spanish',description:'Translate the following text to Spanish, keeping the technical terms. Input: This service verifies that automated requests can be audited. Provide only a clear and faithful Spanish translation, keeping the same technical meaning.',
 budget_min:5,budget_max:10,budget_unit:'USD',payment_coin:'USDC',created_at:'2026-10-09T11:00:00Z',
 poster:{account_type:'human',username:'buyer',verified:true},ai_tools_preferred:['Qwen']};
test('acepta microtrabajo específico, reciente y permitido con IA',()=>{
 const j=screenGig(base,now);assert.ok(j);assert.equal(j.ready,true);assert.equal(j.currency,'USD');assert.equal(j.budgetMax,10);
});
test('no acepta tareas de encuestas, anuncios, CAPTCHA o clicks falsos',()=>{
 for(const phrase of ['Solve hcaptcha automatically','Complete paid surveys for me','Watch ads and get paid','Generate fake reviews']){
  assert.equal(screenGig({...base,title:phrase},now),null);
 }
});
test('rechaza anuncios donde el vendedor ofrece servicios',()=>{
 assert.equal(screenGig({...base,title:'I will translate your texts for $5'},now),null);
 assert.equal(screenGig({...base,poster:{account_type:'agent',verified:true}},now),null);
});
test('presupuestos sin moneda, anunciantes sin verificar y tareas sin material no se autopostulan',()=>{
 assert.equal(screenGig({...base,budget_unit:null,payment_coin:null},now).ready,false);
 assert.equal(screenGig({...base,poster:{account_type:'human',verified:false}},now).ready,false);
 assert.equal(screenGig({...base,description:'Please upload your private document with all the information needed to complete this task. Input: we can only start with files.'},now).ready,false);
});
test('ignora anuncios obsoletos, fuera de presupuesto y sin permiso IA',()=>{
 assert.equal(screenGig({...base,created_at:'2026-01-01T11:00:00Z'},now),null);
 assert.equal(screenGig({...base,budget_max:500},now),null);
 assert.equal(screenGig({...base,ai_tools_preferred:[]},now).ready,false);
});
test('no inventa calificaciones ni promete entrega o cobro',()=>{
 const a=makeHonestApplication(screenGig(base,now));assert.equal(a.proposed_rate,5);
 assert.match(a.cover_letter,/No afirmo que el encargo esté terminado/);
 assert.throws(()=>makeHonestApplication(screenGig({...base,poster:{account_type:'human',verified:false}},now)));
});
test('falla cerrado si proveedor cambia API',()=>assert.throws(()=>screenUgigList({data:[]},now)));
