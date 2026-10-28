import {tarifaSimple} from './tarifas-reve.mjs';
export function cotizarParada({lat,lon,operador,kwh},records,now=Date.now()) {
  const aliases={ZUN:['zunder','easycharg'],ERA:['eranovum'],CHT:['iberdrola','bp pulse','charging together']};
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const locations=new Map(),tariffs=new Map();
  for(const [url,record] of Object.entries(records))for(const x of record.data||[]){
    if(url.includes('/locations'))locations.set(x.id,x);
    else if(url.includes('/connectors/tariffs')){
      const prev=tariffs.get(x.connector_id);if(!prev||record.time>prev.time)tariffs.set(x.connector_id,{...x,time:record.time});
    }
  }
  const matches=[...locations.values()].filter(x=>{
    const la=Number(x.coordinates?.latitude),lo=Number(x.coordinates?.longitude);
    const distance=111000*Math.hypot(la-lat,(lo-lon)*Math.cos(lat*Math.PI/180));
    return distance<=60&&(aliases[x.party_id]||[]).some(a=>norm(operador).includes(a));
  });
  if(matches.length!==1)return{status:'unavailable',message:matches.length?'Varias estaciones próximas: asociación pendiente.':'Precio no disponible: estación pendiente de asociar con REVE.'};
  const station=matches[0],prices=[];
  for(const evse of station.evses||[])for(const connector of evse.connectors||[]){
    if(connector.standard!=='IEC_62196_T2_COMBO')continue;
    const record=tariffs.get(connector.id);if(!record||now-record.time>3600000)continue;
    const list=Array.isArray(record.tariffs)?record.tariffs:[record.tariffs];
    const valid=list.filter(Boolean).map(t=>({t,result:tarifaSimple(t,{fecha:now,kwh})})).filter(x=>x.result.completa);
    if(valid.length!==1)continue;
    const {t,result}=valid[0];const energy=t.elements.flatMap(e=>e.price_components).find(c=>c.type==='ENERGY');
    prices.push({connectorId:connector.id,kw:connector.max_electric_power/1000,eurKwh:Number(energy.price)*(1+Number(energy.vat)/100),costeTotal:result.costeTotal,updatedAt:new Date(record.time).toISOString(),tariffId:t.id});
  }
  return{status:prices.length?'available':'unavailable',station:station.name,prices,kwh,message:prices.length?'Tarifa REVE para los conectores indicados. Asociación por proximidad y operador: comprueba el conector y el precio con tu método de pago antes de iniciar.':'Precio no disponible: falta una tarifa completa y reciente de sus conectores.'};
}
