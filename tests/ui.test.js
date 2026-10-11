import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {HTML} from '../src/ui.js';
test('panel HTML contains agent queue and a separate owner handoff',()=>{
 assert.match(HTML,/Centro de trabajo de AutoWorker/);
 for(const id of ['agentlane','humanlane','verifylane','applicationlane','workstatus','refreshwork','reloadwork']){
  assert.ok(HTML.includes('id="'+id+'"'),'Missing '+id);
 }
 assert.match(HTML,/<details class="advanced">/);
});
test('inline client-side JavaScript parses correctly',()=>{
 const matches=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(matches.length,1);
 assert.doesNotThrow(()=>new Script(matches[0][1]));
});
test('main panel does not present business prospects as paid jobs',()=>{
 const center=HTML.split('<section id="commandcenter">')[1].split('<details class="advanced">')[0];
 assert.doesNotMatch(center,/Fichas comerciales guardadas/);
 assert.match(center,/Los presupuestos son anunciados, no dinero ganado/);
});
