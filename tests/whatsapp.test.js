import {test} from 'node:test';
import assert from 'node:assert/strict';
import {argentinaWhatsAppNumber,whatsAppDraftUrl} from '../src/whatsapp.js';
test('genera enlace para teléfono comercial de Le Cuer',()=>{
 assert.equal(argentinaWhatsAppNumber('+54 11 4382-7878'),'541143827878');
 const result=whatsAppDraftUrl('+54 11 4382-7878','Hola, ¿cómo va? Soy de Zenix AR.');
 assert.ok(result.startsWith('https://wa.me/541143827878?text='));
 assert.equal(new URL(result).searchParams.get('text'),'Hola, ¿cómo va? Soy de Zenix AR.');
});
test('admite formato de teléfono fijo argentino con 0 inicial',()=>{
 assert.equal(argentinaWhatsAppNumber('011 4382-7878'),'541143827878');
 assert.equal(argentinaWhatsAppNumber('+54 9 11 5555 4444'),'5491155554444');
});
test('no genera enlaces para teléfonos incompletos, múltiples o ajenos',()=>{
 for(const input of ['','1234','+1 415 222 3333','+54 11 4382 7878 / 4444','+54 11 4382 7878 ext.12',null]){
  assert.equal(argentinaWhatsAppNumber(input),null);
 }
 assert.equal(whatsAppDraftUrl('+54 11 4382 7878',''),null);
});
test('no incluye instrucciones automáticas de envío, solo un borrador',()=>{
 const u=new URL(whatsAppDraftUrl('+54 11 4382 7878','Mensaje de prueba'));
 assert.equal(u.hostname,'wa.me');assert.equal(u.searchParams.get('text'),'Mensaje de prueba');
});
