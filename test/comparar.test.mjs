import {test} from 'node:test';import assert from 'node:assert/strict';
import {compararParadas} from '../comparar-paradas.mjs';
// Datos sintéticos: no son tarifas ni tiempos de estaciones reales.
const pago=(costeTotal,extra={})=>({metodo:'directo',compatible:true,verificado:true,completo:true,moneda:'EUR',costeTotal,fuente:'fixture',fecha:'2026-10-28',...extra});
const estacion=(id,extra={})=>({id,accesoVerificado:true,compatible:true,estado:'desconocido',socLlegada:20,continuacionViable:true,tiempoTotal:300,minutosRecarga:25,minutosDesvio:0,pagos:[pago(15)],...extra});
test('ahorro con cuatro minutos extra y recarga comparable',()=>{
 const r=compararParadas([estacion('rapida'),estacion('economica',{tiempoTotal:304,minutosDesvio:4,pagos:[pago(11.8)]})]);
 assert.equal(r.recomendada.id,'economica');assert.equal(r.recomendada.extraMinutos,4);assert.ok(Math.abs(r.ahorro-3.2)<1e-9);
});
test('excluye precio bajo con reserva insuficiente, acceso contrario o carga lenta',()=>{
 const r=compararParadas([estacion('referencia'),estacion('reserva',{socLlegada:5,pagos:[pago(1)]}),estacion('acceso',{accesoVerificado:false,pagos:[pago(1)]}),estacion('lenta',{minutosRecarga:50,pagos:[pago(1)]}),estacion('desvio',{tiempoTotal:340,pagos:[pago(1)]})]);assert.equal(r.recomendada.id,'referencia');assert.equal(r.descartadas.length,4);
});
test('no transforma una tarifa desconocida en cero ni promete ahorro sin referencia de precio',()=>{
 const r=compararParadas([estacion('sin-precio',{pagos:[]}),estacion('con-precio',{tiempoTotal:304})]);assert.equal(r.recomendada.id,'con-precio');assert.equal(r.ahorro,null);assert.equal(r.pendientes.length,1);assert.equal(r.alcance,'menor_coste_entre_precios_verificados');
});
test('elige método compatible más económico y descarta suplementos incompletos',()=>{
 const r=compararParadas([estacion('x',{pagos:[pago(3,{completo:false}),pago(9,{metodo:'kia',compatible:false}),pago(12,{metodo:'zunder'}),pago(14,{metodo:'electroverse'})]})]);assert.equal(r.recomendada.pago.metodo,'zunder');
});
test('sin viabilidad no recomienda ninguna estación',()=>{assert.equal(compararParadas([estacion('x',{continuacionViable:false})]).recomendada,null);});
test('curva EV3: prefiere 100 kW más económico frente a 350 kW si la demora es pequeña',async()=>{
 const fs=await import('node:fs/promises'),vm=await import('node:vm');
 const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8'),ctx=vm.createContext({});
 vm.runInContext(html.slice(html.indexOf('const CURVA'),html.indexOf('function dibujarPerfil')),ctx);
 const minutos=kw=>vm.runInContext(`minutosCarga(26,59,78,${kw},128)`,ctx);
 assert.equal(minutos(150),minutos(350));
 const r=compararParadas([estacion('350kW',{minutosRecarga:minutos(350),tiempoTotal:280+minutos(350),pagos:[pago(16)]}),estacion('100kW',{minutosRecarga:minutos(100),tiempoTotal:280+minutos(100),pagos:[pago(13)]})]);
 assert.equal(r.recomendada.id,'100kW');assert.ok(r.recomendada.extraMinutos<3);
});
