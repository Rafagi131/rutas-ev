import {test} from 'node:test';import assert from 'node:assert/strict';import {cotizarParada} from '../precios-paradas.mjs';
const location={id:'estacion',name:'Torrent',party_id:'ZUN',coordinates:{latitude:39,longitude:0},evses:[{connectors:[{id:'ccs340',standard:'IEC_62196_T2_COMBO',max_electric_power:340000}]}]};
const record={connector_id:'ccs340',tariffs:[{id:'real-estructura',currency:'EUR',elements:[{price_components:[{type:'ENERGY',price:.4876,vat:21,step_size:1}]}]}]};
const rows={'https://www.mapareve.es/api/external/v1/locations':{time:1,data:[location]},'https://www.mapareve.es/api/external/v1/connectors/tariffs':{time:100,data:[record]}};
const input={lat:39,lon:0,operador:'Zunder',kwh:17.512107};
test('asocia conector exacto dentro de estación y añade IVA',()=>{const x=cotizarParada(input,rows,200);assert.equal(x.status,'available');assert.equal(x.prices[0].connectorId,'ccs340');assert.equal(x.prices[0].costeTotal,10.33);assert.ok(Math.abs(x.prices[0].eurKwh-.59)<.00001);});
test('no transfiere precio a otra estación, operador o conector ni usa caché caducada',()=>{
 assert.equal(cotizarParada({...input,lat:39.01},rows,200).status,'unavailable');
 assert.equal(cotizarParada({...input,operador:'otro'},rows,200).status,'unavailable');
 assert.equal(cotizarParada(input,rows,3600200).status,'unavailable');
 const missing=structuredClone(rows);missing['https://www.mapareve.es/api/external/v1/connectors/tariffs'].data[0].connector_id='otro';assert.equal(cotizarParada(input,missing,200).status,'unavailable');
});
test('modo con precio solo considera conectores cercanos y en el interior del trazado',async()=>{
 const {readFileSync}=await import('node:fs'),vm=await import('node:vm');const h=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const c=vm.createContext({coordenadasValidas:p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite),km:(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])*111});
 vm.runInContext(h.slice(h.indexOf('function cargadoresConPrecio('),h.indexOf('function compararConRecomendada(')),c);
 const result=vm.runInContext("cargadoresConPrecio([{id:'valida',pos:[1,0],kw:100},{id:'lejos',pos:[1,1],kw:100},{id:'lenta',pos:[1,0],kw:22},{id:'salida',pos:[0,0],kw:100}],[[0,0],[1,0],[2,0]],[0,100,200],50)",c);
 assert.equal(result.length,1);assert.equal(result[0].id,'valida');assert.equal(result[0].along,100);
});
