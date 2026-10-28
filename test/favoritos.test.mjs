import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const h=readFileSync(new URL('../index.html',import.meta.url),'utf8');let stored=null;const msg={textContent:''};
const c=vm.createContext({localStorage:{getItem:()=>stored,setItem:(key,value)=>{assert.equal(key,'rutaev:v2:favoritos');stored=value;}},coordenadasValidas:p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90,$:()=>msg,pintarFavoritos:()=>{}});
vm.runInContext(h.slice(h.indexOf('function normalizarFavorito('),h.indexOf('const botonesFavoritos =')),c);const run=s=>vm.runInContext(s,c);
test('guarda estación con coordenadas, sin conservar precios y permite quitarla',()=>{
 run("guardarFavorito({id:'x',nombre:'Estación',pos:[-.12622,39.8983],kw:180,precio:.5})");const d=JSON.parse(stored);assert.equal(d.length,1);assert.equal(d[0].kw,180);assert.equal(d[0].precio,undefined);
 run("guardarFavorito({id:'x',nombre:'Estación',pos:[-.12622,39.8983]})");assert.equal(JSON.parse(stored).length,0);
});
test('no sobrescribe almacenamiento corrupto ni acepta coordenadas inválidas',()=>{
 stored='no es json';run("guardarFavorito({id:'x',nombre:'Estación',pos:[0,0]})");assert.equal(stored,'no es json');
 stored='[]';run("guardarFavorito({nombre:'Estación',pos:[181,0]})");assert.equal(stored,'[]');
});
test('favoritos no añaden puntos y OCM excluye equipos expresamente no operativos',async()=>{
 const data=[{ID:1,StatusType:{IsOperational:false}},{ID:2,Connections:[{ConnectionTypeID:33,PowerKW:180,StatusType:{IsOperational:false}}]},{ID:3,Connections:[{ConnectionTypeID:33,PowerKW:100}]}].map(x=>({Connections:[{ConnectionTypeID:33,PowerKW:180}],AddressInfo:{Longitude:0,Latitude:0,Title:'Estación'},...x}));
 const ctx=vm.createContext({consultarOCM:async()=>data,estado:()=>{},sleep:async()=>{},km:()=>0});
 vm.runInContext(h.slice(h.indexOf('async function buscarCargadores('),h.indexOf('const CURVA')),ctx);
 const r=await vm.runInContext('buscarCargadores([[0,0]],[0],50,"ficticia")',ctx);assert.equal(r.length,1);assert.equal(r[0].id,3);
 const ui=h.slice(h.indexOf('function pintarFavoritos()'),h.indexOf('function mostrarOpcion('));assert.ok(!ui.includes('agregarPunto('));
});
