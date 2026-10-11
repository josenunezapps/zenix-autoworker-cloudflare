import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {HTML} from '../src/ui.js';
test('contract roles are separated from automatic AI tasks',()=>{
 assert.match(HTML,/Contratos remotos recientes para vos/);
 assert.ok(HTML.includes('id="contractlane"'));
 assert.ok(HTML.includes('id="findcontracts"'));
 assert.match(HTML,/No son recompensas ni encargos asignados al agente/);
});
test('script compiles',()=>{
 const scripts=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1);
 assert.doesNotThrow(()=>new Script(scripts[0][1]));
});
