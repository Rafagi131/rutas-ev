import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApp} from '../server.mjs';
async function setup(t, options={}) {
  const app=createApp(options);app.listen(0,'127.0.0.1');await once(app,'listening');
  t.after(()=>new Promise(r=>{app.close(r);app.closeAllConnections();}));
  return (path,options)=>fetch(`http://127.0.0.1:${app.address().port}${path}`,options);
}
test('sin clave: estado disponible, catálogo bloqueado y ninguna llamada externa',async t=>{
  const req=await setup(t,{fetcher:()=>{throw Error('No debe consultar');}});
  assert.equal((await(await req('/api/reve/health')).json()).configured,false);
  assert.equal((await req('/api/reve/locations')).status,503);
  assert.equal((await req('/.env')).status,404);
});
test('clave solo en cabecera, catálogo concurrente unificado y caché',async t=>{
  let count=0;
  const req=await setup(t,{key:'clave-ficticia-de-prueba',fetcher:async(url,options)=>{
    count++;assert.equal(url,'https://www.mapareve.es/api/external/v1/locations');
    assert.equal(options.headers['x-api-key'],'clave-ficticia-de-prueba');
    await new Promise(r=>setTimeout(r,20));return Response.json([{id:'prueba'}]);
  }});
  const results=await Promise.all([req('/api/reve/locations'),req('/api/reve/locations')]);
  for(const res of results){const text=await res.text();assert.ok(!text.includes('clave-ficticia'));assert.equal(JSON.parse(text).source,'REVE');}
  assert.equal(count,1);
  const cached=await(await req('/api/reve/locations')).json();assert.equal(cached.cached,true);assert.equal(count,1);
});
test('errores de autenticación no revelan contenido del proveedor; cuota también cuenta fallos',async t=>{
  let count=0;
  const req=await setup(t,{key:'ficticia',fetcher:async()=>{count++;return new Response('detalle privado',{status:401});}});
  for(let i=0;i<5;i++){const res=await req('/api/reve/locations');assert.equal(res.status,502);assert.ok(!(await res.text()).includes('detalle privado'));}
  assert.equal((await req('/api/reve/locations')).status,429);assert.equal(count,5);
});
test('429 de REVE frena nuevos intentos durante una hora',async t=>{
  let time=0,count=0;
  const req=await setup(t,{key:'ficticia',now:()=>time,fetcher:async()=>{count++;return new Response('',{status:429});}});
  assert.equal((await req('/api/reve/locations')).status,429);
  assert.equal((await req('/api/reve/locations')).status,429);assert.equal(count,1);
  time=3600001;await req('/api/reve/locations');assert.equal(count,2);
});
test('rechaza otros orígenes, parámetros y métodos; sirve la v2',async t=>{
  const req=await setup(t);
  assert.equal((await req('/api/reve/health',{headers:{Origin:'https://otro.example'}})).status,403);
  assert.equal((await req('/api/reve/locations?url=https://otro.example')).status,400);
  assert.equal((await req('/api/reve/health',{method:'POST'})).status,405);
  assert.match(await(await req('/')).text(),/REVE · En pruebas/);
});
test('caché y cuota sobreviven al crear otra instancia',async t=>{
  const {mkdtemp,readFile,writeFile,rm}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os');const {join}=await import('node:path');
  const dir=await mkdtemp(join(tmpdir(),'rutaev-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const stateFile=join(dir,'state.json');let count=0;
  const options={key:'secreto-ficticio',stateFile,fetcher:async()=>{count++;return Response.json([{id:'guardado'}]);}};
  const first=await setup(t,options);await first('/api/reve/locations');
  const second=await setup(t,options);assert.equal((await(await second('/api/reve/locations')).json()).cached,true);assert.equal(count,1);
  const state=JSON.parse(await readFile(stateFile,'utf8'));assert.equal(state.calls.length,1);assert.ok(!JSON.stringify(state).includes('secreto-ficticio'));
  state.cached=null;state.calls=Array(5).fill(Date.now());await writeFile(stateFile,JSON.stringify(state));
  const third=await setup(t,options);assert.equal((await third('/api/reve/locations')).status,429);assert.equal(count,1);
});
