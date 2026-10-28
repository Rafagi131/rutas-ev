// Recibe tiempos calculados para el EV3 y el recorrido real, nunca potencia nominal / energía.
// Las tarifas deben incluir IVA, suplementos y el método de pago concreto.
const positivo = n => Number.isFinite(n) && n >= 0;
export function compararParadas(candidatas, {reserva = 10, margenTiempo = 10, margenRecarga = 20} = {}) {
  if (!Array.isArray(candidatas) || ![reserva,margenTiempo,margenRecarga].every(positivo) || reserva > 100) throw new Error('Parámetros de comparación no válidos.');
  const descartadas = [], pendientes = [], viables = [];
  for (const c of candidatas) {
    let motivo = null;
    if (!c.id || c.accesoVerificado !== true || c.compatible !== true) motivo = 'Acceso o compatibilidad sin verificar';
    else if (c.estado === 'fuera_de_servicio') motivo = 'Fuera de servicio';
    else if (!Number.isFinite(c.socLlegada) || c.socLlegada < reserva || c.continuacionViable !== true) motivo = 'Reserva o continuación del viaje insuficiente';
    else if (![c.tiempoTotal,c.minutosRecarga,c.minutosDesvio].every(positivo) || c.tiempoTotal <= 0 || c.tiempoTotal < c.minutosRecarga + c.minutosDesvio) motivo = 'Tiempos de recorrido incompletos';
    if (motivo) descartadas.push({id:c.id,motivo});
    else viables.push(c);
  }
  if (!viables.length) return {referencia:null,recomendada:null,comparables:[],pendientes,descartadas,alcance:'sin_estaciones_viables'};
  const referencia = viables.slice().sort((a,b)=>a.tiempoTotal-b.tiempoTotal || a.minutosRecarga-b.minutosRecarga || a.minutosDesvio-b.minutosDesvio || String(a.id).localeCompare(String(b.id)))[0];
  const comparables = [];
  for (const c of viables) {
    if (c.tiempoTotal > referencia.tiempoTotal * (1 + margenTiempo / 100) + 1e-9) { descartadas.push({id:c.id,motivo:'Supera el margen de tiempo del viaje'}); continue; }
    if (c.minutosRecarga > referencia.minutosRecarga * (1 + margenRecarga / 100) + 1e-9) { descartadas.push({id:c.id,motivo:'Recarga más lenta que el margen permitido'}); continue; }
    // Un importe desconocido, incompleto o en otra moneda nunca equivale a cero.
    const pagos = (c.pagos || []).filter(p=>p.compatible === true && p.verificado === true && p.completo === true && p.moneda === 'EUR' && positivo(p.costeTotal) && p.fuente && p.fecha);
    if (!pagos.length) { pendientes.push({id:c.id,motivo:'Precio completo o método de pago pendiente de verificar'}); continue; }
    const pago = pagos.slice().sort((a,b)=>a.costeTotal-b.costeTotal || String(a.metodo).localeCompare(String(b.metodo)))[0];
    comparables.push({...c,pago,extraMinutos:c.tiempoTotal-referencia.tiempoTotal});
  }
  comparables.sort((a,b)=>a.pago.costeTotal-b.pago.costeTotal || a.tiempoTotal-b.tiempoTotal || String(a.id).localeCompare(String(b.id)));
  const recomendada = comparables[0] || null;
  const refPrecio = comparables.find(c=>c.id===referencia.id);
  return {referencia,recomendada,comparables,pendientes,descartadas,
    ahorro:recomendada && refPrecio ? refPrecio.pago.costeTotal-recomendada.pago.costeTotal : null,
    alcance:pendientes.length ? 'menor_coste_entre_precios_verificados' : comparables.length ? 'comparacion_completa_de_candidatas' : 'sin_precios_verificados'};
}
