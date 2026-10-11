import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {HTML} from '../src/ui.js';
test('funded agent tasks remain distinct from non-guaranteed job listings',()=>{
 for(const id of ['fundedlane','fundedstatus','findfunded']){
  assert.match(HTML,new RegExp('id="'+id+'"'));
 }
 assert.match(HTML,/Recompensas con fondos para agentes/);
 assert.match(HTML,/<details class="worklane"><summary>Ofertas de empleo tradicional \(secundario\)<\/summary>/);
});
test('inline UI script compiles',()=>{
 const scripts=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1);assert.doesNotThrow(()=>new Script(scripts[0][1]));
});
