import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyFundedAgentTasks} from '../src/agentBounties.js';
const now=Date.parse('2026-10-11T23:00:00Z');
const base={task_id:'task_ILI16I1DYjTOabbUBRvV9',title:'Prepare a CSV schema mapping',
 description:'Describe a CSV schema and give a validated mapping with a short example.',
 status:'open',claimable:true,created_at:'2026-10-10T15:00:00Z',
 bounty:{amount_display:'5.00',token:'USDC',network:'eip155:8453'},escrow:{status:'funded'},
 payment_status:'pending'};
test('accepts verified funded public AI tasks only as candidates',()=>{
 const data=classifyFundedAgentTasks({ok:true,tasks:[base]},now);
 assert.equal(data.tasks.length,1);assert.equal(data.stats.escrowFunded,1);
 assert.equal(data.tasks[0].reward,5);
 assert.match(data.tasks[0].note,/No implica/);
});
test('excludes unfunded promises, free tasks, and wrong networks',()=>{
 const rows=[{...base,escrow:null},{...base,bounty:{...base.bounty,amount_display:'0'}},
  {...base,bounty:{...base.bounty,network:'eip155:9999'}}];
 const x=classifyFundedAgentTasks({ok:true,tasks:rows},now);
 assert.equal(x.tasks.length,0);assert.equal(x.stats.notFunded,3);
});
test('excludes explicit internal tests and conditional-revenue incentives',()=>{
 const rows=[{...base,title:'Test hire (please ignore)'},
 {...base,title:'Industrial Sentinel Revenue Cashback 5'},
 {...base,description:'This task will be cancelled.'}];
 const x=classifyFundedAgentTasks({ok:true,tasks:rows},now);
 assert.equal(x.tasks.length,0);assert.equal(x.stats.excludedTest,3);
});
test('ignores claimed or stale tasks and bogus URLs',()=>{
 const rows=[{...base,claimable:false},{...base,status:'claimed'},{...base,created_at:'2026-08-01T00:00:00Z'}];
 const x=classifyFundedAgentTasks({ok:true,tasks:rows},now);
 assert.equal(x.tasks.length,0);
});
test('requires a valid response',()=>{
 assert.throws(()=>classifyFundedAgentTasks({tasks:[]},now));
 assert.throws(()=>classifyFundedAgentTasks({ok:true,tasks:null},now));
});
