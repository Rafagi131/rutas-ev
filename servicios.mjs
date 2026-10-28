// Información cartográfica de OSM: no garantiza apertura ni acceso real a pie.
export function crearConsultaServicios({fetcher=fetch,now=Date.now}={}) {
  const cache=new Map(), pending=new Map();
  return async (lat,lon)=>{
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Coordenadas no válidas.');
    const key=lat.toFixed(5)+','+lon.toFixed(5),saved=cache.get(key);
    if(saved && now()-saved.time<86400000)return saved.data;
    if(pending.has(key))return pending.get(key);
    const task=(async()=>{
      const query=`[out:json][timeout:8];(nwr(around:500,${lat},${lon})[amenity~"^(restaurant|cafe|bar|fast_food|toilets)$"];nwr(around:500,${lat},${lon})[toilets=yes];);out center tags;`;
      const r=await fetcher('https://overpass-api.de/api/interpreter',{method:'POST',body:new URLSearchParams({data:query}),signal:AbortSignal.timeout(12000)});
      if(!r.ok)throw Error('No se pudieron consultar los servicios cercanos.');
      const j=await r.json();if(!Array.isArray(j.elements)||j.remark)throw Error('Consulta de servicios incompleta.');
      const items=j.elements.map(e=>{
        const t=e.tags||{},p=e.center||e,la=p.lat,lo=p.lon;
        if(!Number.isFinite(la)||!Number.isFinite(lo))return null;
        const rad=Math.PI/180,a=Math.sin((la-lat)*rad/2)**2+Math.cos(lat*rad)*Math.cos(la*rad)*Math.sin((lo-lon)*rad/2)**2;
        const distance=12742000*Math.asin(Math.sqrt(Math.min(1,a)));
        if(distance>500)return null;
        return{id:e.type+'/'+e.id,name:t.name||'Sin nombre',type:t.amenity||'establecimiento',distance:Math.round(distance),toilets:t.amenity==='toilets'||t.toilets==='yes'?'indicado':t.toilets==='no'?'no_indicado_disponible':'desconocido',access:t['toilets:access']||t.access||null,fee:t['toilets:fee']||t.fee||null,openingHours:t.opening_hours||null};
      }).filter(Boolean).sort((a,b)=>a.distance-b.distance).slice(0,20);
      const data={source:'OpenStreetMap / Overpass',updatedAt:new Date(now()).toISOString(),radius:500,items,note:'Distancias en línea recta. Acceso a pie, horarios y disponibilidad del aseo pendientes de confirmar. Un restaurante no implica aseo disponible.'};
      cache.set(key,{time:now(),data});return data;
    })();pending.set(key,task);
    try{return await task;}finally{pending.delete(key);}
  };
}
