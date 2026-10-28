// Primera interpretación conservadora: nunca presentar una parte de la tarifa como coste total.
export function tarifaSimple(tariff, {fecha = Date.now(), kwh} = {}) {
  const pending = motivo => ({completa:false,motivo});
  if (!tariff || tariff.currency !== 'EUR' || !Number.isFinite(kwh) || kwh < 0) return pending('Moneda o energía no válida');
  for (const [field,isStart] of [['start_date_time',true],['end_date_time',false]]) {
    if (tariff[field]) { const date=Date.parse(tariff[field]);if(!Number.isFinite(date) || (isStart ? fecha<date : fecha>=date))return pending('Tarifa fuera de vigencia o fecha inválida'); }
  }
  if (!Array.isArray(tariff.elements) || !tariff.elements.length) return pending('Faltan componentes');
  let coste=0,energyCount=0;
  for (const element of tariff.elements) {
    if (element.restrictions && Object.keys(element.restrictions).length) return pending('Condiciones de tarifa pendientes de interpretar');
    if (!Array.isArray(element.price_components) || !element.price_components.length) return pending('Faltan precios');
    for (const c of element.price_components) {
      const price=Number(c.price),vat=Number(c.vat),step=Number(c.step_size);
      if (c.price==null || c.price==='' || c.vat==null || c.vat==='' || !Number.isFinite(price) || price<0 || !Number.isFinite(vat) || vat<0 || !Number.isInteger(step) || step<=0) return pending('Precio, IVA o bloque sin confirmar');
      if (c.type==='ENERGY') { energyCount++;coste+=Math.ceil((kwh*1000)/step)*step/1000*price*(1+vat/100); }
      else if(c.type==='FLAT') coste+=price*(1+vat/100);
      else return pending('Cargos por tiempo u ocupación pendientes de interpretar');
    }
  }
  if(energyCount!==1)return pending('Componente de energía ambiguo');
  return {completa:true,moneda:'EUR',costeTotal:Math.round((coste+Number.EPSILON)*100)/100};
}
