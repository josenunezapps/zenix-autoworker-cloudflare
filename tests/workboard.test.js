import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildWorkboard} from '../src/workboard.js';
const now=Date.parse('2026-10-11T21:00:00Z');
const base={id:'ugig:3c3b7c32-d602-4e72-8f65-8c1dc503128b',source:'ugig',
 name:'Build a React website and landing page',brief:'Build a new website with a dashboard and an API integration for a bakery.',
 budgetMax:250,currency:'USD',poster:'hiring-company',createdAt:'2026-10-07T21:00:00Z',
 url:'https://ugig.net/gigs/3c3b7c32-d602-4e72-8f65-8c1dc503128b',
 verified:0,aiAllowed:0,ready:0,reason:'IA no autorizada'};
test('projects the AI cannot safely do are handed off to owner',()=>{
 const b=buildWorkboard({microtasks:[base]},now);
 assert.equal(b.handoff.length,1);assert.equal(b.agent.length,0);
 assert.equal(b.handoff[0].source,'ugig');
});
test('agent-ready jobs indicate draft status, not payment',()=>{
 const job={...base,ready:1,budgetMax:15,aiAllowed:1};
 const b=buildWorkboard({microtasks:[job],artifacts:[{taskId:job.id,status:'AI_DRAFT_UNVERIFIED'}]},now);
 assert.equal(b.agent.length,1);assert.equal(b.agent[0].status,'borrador_pendiente_de_prueba');
 assert.equal(b.stats.paymentsConfirmed,0);
});
test('stale items never go to the human-work queue',()=>{
 const b=buildWorkboard({microtasks:[{...base,createdAt:'2026-01-15T21:00:00Z'}]},now);
 assert.equal(b.handoff.length,0);assert.equal(b.verify.length,0);
});
test('non-contract business prospects are never treated as paid jobs',()=>{
 const b=buildWorkboard({microtasks:[],bounties:[]},now);
 assert.equal(b.handoff.length,0);assert.equal(b.stats.paymentsConfirmed,0);
});
test('software bounties from other platforms need verification',()=>{
 const b=buildWorkboard({bounties:[{id:'opire:abdef984',source:'Opire',title:'Fix Android app',
   description:'',amount:32,currency:'USD',url:'https://github.com/example/app/issues/3',permitted:0}]},now);
 assert.equal(b.handoff.length,1);
});
test('potentially disallowed paid clicks are never routed to autonomous queue',()=>{
 const b=buildWorkboard({microtasks:[{...base,name:'Click ads for a gambling site',ready:1,budgetMax:10}]},now);
 assert.equal(b.agent.length,0);assert.equal(b.handoff.length,0);
});
test('no payment counter inferred from accepted applications',()=>{
 const b=buildWorkboard({microtasks:[base],applications:[{taskId:base.id,status:'accepted'}]},now);
 assert.equal(b.stats.paymentsConfirmed,0);
});

test('iOS UGC campaign is NOT a software development handoff',()=>{
 const b=buildWorkboard({bounties:[{
  id:'bb:ios-ugc-2026',source:'BountyBoard',
  title:'Excelente iOS UGC Campaign — Vienna — Add 20 Local Gems (95 EUR)',
  description:'Share content and local spots in our iPhone app',amount:95,
  currency:'EUR',url:'https://www.bountyboard.work/bounties',permitted:0
 }]},now);
 assert.equal(b.handoff.length,0);
 assert.equal(b.stats.excludedNonSoftware,1);
});
test('technical writing request should not be falsely routed as software even if description mentions apps',()=>{
 const b=buildWorkboard({microtasks:[{
  ...base,name:'Source-cited research and technical writing brief, delivered in 24 hours',
  brief:'Research a technical brief about different mobile apps and their development process.',
  budgetMax:10,ready:0
 }]},now);
 assert.equal(b.handoff.length,0);
 assert.equal(b.verify.length,1);
});
test('old postings are archived rather than flooding current tasks',()=>{
 const b=buildWorkboard({microtasks:[{...base,createdAt:'2026-01-15T21:00:00Z'}]},now);
 assert.equal(b.verify.length,0);
 assert.equal(b.stats.archivedOldListings,1);
});
test('a real recent Android development job is handed to owner',()=>{
 const b=buildWorkboard({microtasks:[{...base,name:'Build Android booking app for a restaurant',brief:'We need a developer to code and test an Android booking app for tables',ready:0}]},now);
 assert.equal(b.handoff.length,1);
});
test('coding bounties are still surfaced, non-development UX campaigns excluded',()=>{
 const b=buildWorkboard({bounties:[
  {id:'opire:issue-98765',source:'Opire',title:'Fix Python API bug',description:'Update endpoint and add tests',amount:50,currency:'USD',permitted:0},
  {id:'bb:ugc-1234567',source:'BountyBoard',title:'iOS UGC Campaign — Helsinki',description:'Promote app',amount:30,currency:'EUR',permitted:0}
 ]},now);
 assert.equal(b.handoff.length,1);
 assert.equal(b.handoff[0].title,'Fix Python API bug');
});
