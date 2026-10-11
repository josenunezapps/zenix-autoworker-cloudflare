import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {HTML} from '../src/ui.js';
test('contains Taskmarket escrow task lane and an honest take/apply button',()=>{
 for(const id of ['findtaskmarket','taskmarketlane','taskmarketstatus'])assert.ok(HTML.includes('id="'+id+'"'));
 assert.match(HTML,/Buscar y postular a trabajos aptos/);
 assert.match(HTML,/No se realizan pagos, depósitos ni reclamaciones automáticas/);
});
test('all UI JavaScript compiles without syntax errors',()=>{
 const blocks=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(blocks.length,1);assert.doesNotThrow(()=>new Script(blocks[0][1]));
});
