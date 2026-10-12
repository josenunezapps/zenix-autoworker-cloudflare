import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {HTML} from '../src/ui.js';
test('client project search is primary and separate from agent bounties',()=>{
 const client=HTML.indexOf('Trabajos publicados por clientes');
 const agent=HTML.indexOf('Recompensas con fondos para agentes');
 assert.ok(client>0);assert.ok(client<agent);
 for(const id of ['projectlane','projectstatus','findprojects','projectcategory','projectsort','moreprojects'])
  assert.ok(HTML.includes('id="'+id+'"'));
 assert.match(HTML,/Freelancer\.com/);
 assert.match(HTML,/id="statclients"/);
 assert.match(HTML,/Proyectos de clientes \(sin adjudicar\)/);
 assert.match(HTML,/Buscar encargos para agentes/);
 assert.match(HTML,/Páginas web/);
 assert.match(HTML,/Software y apps/);
 assert.match(HTML,/Diseño gráfico/);
 assert.match(HTML,/Diseño técnico\/CAD/);
 assert.match(HTML,/Leer descripción completa/);
});
test('public client project API never posts bids on freelancer',()=>{
 assert.match(HTML,/\/api\/find-client-projects/);
 assert.match(HTML,/Abrir proyecto en Freelancer\.com/);
 assert.match(HTML,/La IA no se postula sola aquí/);
});
test('UI script is syntactically valid',()=>{
 const blocks=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(blocks.length,1);
 assert.doesNotThrow(()=>new Script(blocks[0][1]));
});
