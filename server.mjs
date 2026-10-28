import http from 'node:http';
import {crearConsultaServicios} from './servicios.mjs';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const HOUR = 3600000;
// Destino fijo: el navegador no puede elegir URLs ni enviar la clave.
const LOCATIONS = 'https://www.mapareve.es/api/external/v1/locations';
export function createApp({key = '', fetcher = fetch, now = Date.now, stateFile = null} = {}) {
  const servicios = crearConsultaServicios();
  let cached = null, calls = [], blockedUntil = 0;
  let records = {}, queue = Promise.resolve();
  const pending = new Map();
  let storageError = false;
  const ready = stateFile ? readFile(stateFile,'utf8').then(text => {
    const state = JSON.parse(text);
    if (!Array.isArray(state.calls) || !state.calls.every(Number.isFinite) || !Number.isFinite(state.blockedUntil)) throw Error('Estado inválido');
    calls = state.calls; blockedUntil = state.blockedUntil;
    records = state.records || {};
    if (state.cached && Number.isFinite(state.cached.time)) { cached = state.cached; if (!state.records) records[LOCATIONS] = cached; }
  }).catch(e => { if (e.code !== 'ENOENT') storageError = true; }) : Promise.resolve();
  async function persist() {
    if (!stateFile) return;
    try {
      await mkdir(dirname(stateFile),{recursive:true});
      await writeFile(stateFile+'.tmp',JSON.stringify({calls,blockedUntil,cached,records}),{mode:0o600});
      await rename(stateFile+'.tmp',stateFile);
    } catch { storageError = true; throw {status:503,message:'No se pudo guardar el estado de REVE. Consulta detenida para proteger la cuota.'}; }
  }
  const json = (res, status, body) => {
    res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(JSON.stringify(body));
  };
  async function catalog(resource = LOCATIONS) {
    await ready;
    if (storageError) throw {status:503,message:'Revisa el almacenamiento local de REVE antes de consultar.'};
    const saved = records[resource];
    if (saved && now() - saved.time < HOUR) return {...saved,cached:true};
    if (pending.has(resource)) return pending.get(resource);
    const task = queue.then(async () => {
      if (storageError) throw {status:503,message:'Almacenamiento de REVE no disponible.'};
      calls = calls.filter(t => now() - t < HOUR);
      if (now() < blockedUntil || calls.length >= 5) throw {status:429,message:'Límite de consultas alcanzado. Espera antes de volver a consultar.'};
      calls.push(now());
      await persist();
      let response;
      try { response = await fetcher(resource,{headers:{'x-api-key':key,Accept:'application/json'},signal:AbortSignal.timeout(30000),redirect:'error'}); }
      catch { throw {status:502,message:'No se pudo conectar con REVE. Inténtalo más tarde.'}; }
      if (!response.ok) {
        if (response.status === 429) { blockedUntil = now() + HOUR; await persist(); }
        throw {status:response.status === 429 ? 429 : 502,message:[401,403].includes(response.status) ? 'REVE ha rechazado la clave. Revísala en el servidor.' : 'REVE no ha podido completar la consulta.'};
      }
      let data;
      try { data = await response.json(); } catch { throw {status:502,message:'REVE devolvió una respuesta no válida.'}; }
      if (!Array.isArray(data)) throw {status:502,message:'Formato de catálogo REVE inesperado.'};
      const result = {time:now(),data};
      records[resource] = result;
      if (resource === LOCATIONS) cached = result;
      await persist();
      return {...result,cached:false};
    });
    pending.set(resource,task);queue = task.catch(()=>{});
    try { return await task; } finally { pending.delete(resource); }
  }
  return http.createServer(async (req,res) => {
    try {
      const url = new URL(req.url,'http://localhost');
      if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.headers.host || '')) return json(res,403,{error:'Este servidor de desarrollo solo admite acceso local.'});
      if (req.method !== 'GET') return json(res,405,{error:'Método no permitido.'});
      // Solo mismo origen. El servicio inicial se ejecuta en localhost.
      if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) return json(res,403,{error:'Origen no permitido.'});
      const isCatalog = ['/api/reve/locations','/api/reve/tariffs'].includes(url.pathname);
      if (url.search && !isCatalog && url.pathname !== '/api/services') return json(res,400,{error:'Esta consulta no admite parámetros.'});
      if (url.pathname === '/api/services') {
        const p = url.searchParams;
        if ([...p.keys()].some(k=>!['lat','lon'].includes(k)||p.getAll(k).length!==1) || !p.get('lat') || !p.get('lon')) return json(res,400,{error:'Coordenadas no válidas.'});
        const lat=Number(p.get('lat')),lon=Number(p.get('lon'));
        if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return json(res,400,{error:'Coordenadas no válidas.'});
        try{return json(res,200,await servicios(lat,lon));}catch{return json(res,502,{error:'Servicios no disponibles ahora. No significa que no existan.'});}
      }
      if (url.pathname === '/api/reve/health') return json(res,200,{configured:Boolean(key),provider:'REVE',version:2});
      if (url.pathname === '/api/reve/route-study') {
        try {
          const data = JSON.parse(await readFile(new URL('./.cache/alquerias-study.json',import.meta.url),'utf8'));
          return json(res,200,data);
        } catch { return json(res,404,{error:'El estudio local de ida y vuelta todavía no está disponible.'}); }
      }
      if (url.pathname === '/api/reve/validation') {
        const data = JSON.parse(await readFile(new URL('./config/estaciones-contrastadas.json',import.meta.url),'utf8'));
        return json(res,200,data);
      }
      if (isCatalog) {
        const tariffs = url.pathname.endsWith('/tariffs');
        const params = url.searchParams;
        const allowed = tariffs ? ['page'] : ['page','party_id'];
        if ([...params.keys()].some(k => !allowed.includes(k) || params.getAll(k).length !== 1)) return json(res,400,{error:'Filtro no permitido.'});
        const page = params.get('page') || '1', party = params.get('party_id');
        if (!/^[1-9][0-9]{0,4}$/.test(page) || (party !== null && !/^[A-Z0-9]{3}$/.test(party))) return json(res,400,{error:'Página u operador no válido.'});
        if (!key) return json(res,503,{error:'Falta configurar REVE_API_KEY en el servidor.'});
        let resource = tariffs ? 'https://www.mapareve.es/api/external/v1/connectors/tariffs' : LOCATIONS;
        const query = new URLSearchParams();
        if (party) query.set('party_id',party);
        if (page !== '1') query.set('page',page);
        if (query.size) resource += '?' + query;
        const result = await catalog(resource);
        return json(res,200,{source:'REVE',updatedAt:new Date(result.time).toISOString(),cached:result.cached,page:Number(page),possiblyMore:result.data.length === 100,data:result.data});
      }
      if (url.pathname === '/' || url.pathname === '/index.html') {
        const html = await readFile(new URL('./index.html',import.meta.url));
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(html);
      }
      return json(res,404,{error:'Recurso no disponible.'});
    } catch (e) { json(res,e.status || 500,{error:e.message && e.status ? e.message : 'No se pudo completar la consulta.'}); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createApp({key:process.env.REVE_API_KEY?.trim(),stateFile:fileURLToPath(new URL('./.cache/reve-state.json',import.meta.url))});
  const port = Number(process.env.PORT || 8877), host = process.env.HOST || '127.0.0.1';
  server.listen(port,host,()=>console.log(`Ruta EV v2 disponible en http://${host}:${port}`));
}
