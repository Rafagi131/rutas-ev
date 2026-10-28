import {test} from 'node:test';import assert from 'node:assert/strict';import {crearConsultaServicios} from '../servicios.mjs';
test('restaurante no implica aseo; aseos, restricciones y caché se conservan',async()=>{
 let calls=0;const query=crearConsultaServicios({fetcher:async()=>{calls++;return Response.json({elements:[{type:'node',id:1,lat:39,lon:0,tags:{amenity:'restaurant',name:'Prueba'}},{type:'node',id:2,lat:39,lon:0,tags:{amenity:'cafe',toilets:'yes','toilets:access':'customers'}},{type:'node',id:3,lat:39,lon:0,tags:{amenity:'toilets',fee:'yes'}},{type:'node',id:4,lat:40,lon:0,tags:{amenity:'bar'}}]});}});
 const d=await query(39,0);assert.equal(d.items.length,3);assert.equal(d.items[0].toilets,'desconocido');assert.equal(d.items[1].access,'customers');assert.equal(d.items[2].fee,'yes');await query(39,0);assert.equal(calls,1);
});
test('fallo o consulta incompleta no se convierten en lista vacía confirmada',async()=>{
 await assert.rejects(crearConsultaServicios({fetcher:async()=>Response.json({elements:[],remark:'timeout'})})(39,0));
 await assert.rejects(crearConsultaServicios()(100,0));
});
