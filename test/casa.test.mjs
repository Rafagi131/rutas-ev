import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const fields={minDestino:{value:'20'},reservaCasa:{value:'15'},destino:{value:''}};
const ctx=vm.createContext({$:id=>fields[id],num:(id,fallback)=>fields[id]?.value===''?fallback:Number(fields[id].value)});
vm.runInContext(html.slice(html.indexOf('function esDestinoCasa('),html.indexOf('function actualizarResumenes()')),ctx);
const run=s=>vm.runInContext(s,ctx);
test('reserva doméstica 15 o 10 solo para Vilanova',()=>{
 fields.destino.value='Vilanova i la Geltrú, 08800, Catalunya, España';assert.equal(run('reservaDestinoActual()'),15);
 fields.reservaCasa.value='10';assert.equal(run('reservaDestinoActual()'),10);
 fields.destino.value='El Campello';assert.equal(run('reservaDestinoActual()'),20);
 fields.destino.value='Vilanova del Camí, 08788';assert.equal(run('reservaDestinoActual()'),20);
 fields.destino.value='Vilanova i la Geltru, 28000';assert.equal(run('reservaDestinoActual()'),20);
 fields.destino.value='Carrer Alexandre de Cabanyes, Vilanova i la Geltru';fields.reservaCasa.value='general';assert.equal(run('reservaDestinoActual()'),20);
 assert.equal(fields.minDestino.value,'20');
});
