import {test} from 'node:test';
import assert from 'node:assert/strict';
import {screenTaskmarket} from '../src/taskmarket.js';
const now=Date.parse('2026-10-11T20:00:00Z');
const base={id:'0x'+('a'.repeat(64)),escrowTxHash:'0x'+('b'.repeat(64)),
 status:'open',phase:'active',mode:'bounty',taskVisibility:'public',
 description:'Fix a Python CSV parser bug in a public GitHub repository, add regression tests and submit the resulting patch.',
 reward:'5000000',expiryTime:'2026-10-14T20:00:00Z',createdAt:'2026-10-11T10:00:00Z',
 claimedBy:null,stakeRequired:false};
test('finds genuinely escrow backed recent coding opportunity, but does not say it is claimed',()=>{
 const r=screenTaskmarket({tasks:[base]},now);assert.equal(r.tasks.length,1);
 assert.equal(r.tasks[0].reward,5);assert.equal(r.tasks[0].mode,'bounty');
 assert.match(r.tasks[0].note,/no garantiza ganar/);assert.equal(r.stats.safeSoftware,1);
});
test('rejects paid wallet interactions and promotional tasks',()=>{
 for(const description of [
  'Use the Mycelium MCP server with as many wallets as possible. Pay for a snapshot and participate in a task.',
  'Publish an article promoting our trading token to your social media profile.',
  'Form a trust triangle with two external agents and create account endorsements.'
 ]){
  const r=screenTaskmarket({tasks:[{...base,description}]},now);assert.equal(r.tasks.length,0);
 }
});
test('rejects tasks with no escrow, insufficient reward, stake or expired',()=>{
 const rows=[{...base,escrowTxHash:null},{...base,reward:'0'},
 {...base,stakeRequired:true},{...base,expiryTime:'2026-10-11T21:00:00Z'}];
 assert.equal(screenTaskmarket({tasks:rows},now).tasks.length,0);
});
test('claim mode is a potential handoff until identity signing exists',()=>{
 const r=screenTaskmarket({tasks:[{...base,mode:'claim'}]},now);
 assert.equal(r.tasks.length,1);assert.match(r.tasks[0].note,/EIP-191/);
});
test('rejects invalid API response and invalid urls by hard-coded origins',()=>{
 assert.throws(()=>screenTaskmarket({bad:[]},now));
 assert.ok(screenTaskmarket({tasks:[base]},now).tasks[0].url.startsWith('https://taskmarket.dev/tasks/'));
});

test('recognizes a safe standalone SVG illustration as an executable candidate',()=>{
 const description='The Tiny Junction Inside a Zipper\n\nGoal\nMake an original diagram that explains a zipper mechanism.\n\nDeliverable\nOne static self-contained SVG, containing an original drawing with labelled components and an explanatory caption. No external files or account access.';
 const r=screenTaskmarket({tasks:[{...base,description}]},now);
 assert.equal(r.tasks.length,1);
 assert.match(r.tasks[0].title,/Zipper/);
 assert.match(r.tasks[0].note,/no garantiza ganar/);
});
test('recognizes a safe standalone HTML microapp even without coding buzzwords',()=>{
 const description='A Rainy Window That Reads Like Music\n\nGoal\nMake a rainy window turn into five musical notes.\n\nDeliverable\nOne self-contained offline HTML file with a native button that switches between the two scenes.';
 const r=screenTaskmarket({tasks:[{...base,description}]},now);
 assert.equal(r.tasks.length,1);
 assert.equal(r.stats.safeSoftware,1);
});
test('self-contained artifacts still reject unfunded, paid-action and expired listings',()=>{
 const description='One static self-contained SVG. Access our wallet and send a deposit to participate in the bounty.';
 const r=screenTaskmarket({tasks:[{...base,description},{...base,description:'One static self-contained SVG for an educational diagram.',escrowTxHash:null}]},now);
 assert.equal(r.tasks.length,0);
});
