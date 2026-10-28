import {test} from 'node:test';import assert from 'node:assert/strict';import {tarifaSimple} from '../tarifas-reve.mjs';
const tarifa=component=>({currency:'EUR',elements:[{price_components:[{type:'ENERGY',price:'0.38',vat:'21',step_size:1,...component}]}]});
test('energía con IVA y bloque Wh',()=>{assert.equal(tarifaSimple(tarifa({}),{kwh:25}).costeTotal,11.5);assert.equal(tarifaSimple(tarifa({step_size:1000}),{kwh:25.1}).costeTotal,11.95);});
test('condiciones, IVA ausente, tiempo y precios ambiguos no generan coste completo',()=>{
 const restricted=tarifa({});restricted.elements[0].restrictions={min_duration:1800};
 for(const t of [restricted,tarifa({vat:undefined}),tarifa({type:'TIME'}),tarifa({price:'no'})])assert.equal(tarifaSimple(t,{kwh:25}).completa,false);
});
test('tarifa caducada o futura se descarta',()=>{const t=tarifa({});t.end_date_time='2020-01-01T00:00:00Z';assert.equal(tarifaSimple(t,{kwh:25}).completa,false);});
