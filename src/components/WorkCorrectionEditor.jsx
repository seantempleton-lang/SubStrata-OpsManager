import React from 'react';

export function correctionDraft(log) {
  return { notes: log.notes || '', items: log.items.map(item => ({ id: item.id, itemLabelSnapshot: item.itemLabelSnapshot, quantity: String(item.quantity), unit: item.unit, notes: item.notes || '' })) };
}
export function correctionValues(log, draft) {
  return { notes: draft.notes || null, items: draft.items.map(item => {
    if (item.quantity.trim() === '') throw new Error('A recorded quantity cannot be blank. Enter zero explicitly when appropriate.');
    return { ...item, quantity: Number(item.quantity), notes: item.notes || null };
  }).filter(item => {
    const original = log.items.find(source => source.id === item.id);
    return ['quantity', 'unit', 'itemLabelSnapshot', 'notes'].some(key => (original[key] ?? null) !== item[key]);
  }) };
}
export default function WorkCorrectionEditor({ log, value, onChange, disabled }) {
  function itemChange(id, field, next) { onChange({ ...value, items: value.items.map(item => item.id === id ? { ...item, [field]: next } : item) }); }
  return <fieldset disabled={disabled} style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 14 }}><legend>Supervisor corrections to recorded work</legend>
    <p>Correct existing item values and daily notes, then enter a reason and select Correct and lock. Original submissions remain available. Time, crew, bore, item codes and allocation editing are a later increment.</p>
    <label>Corrected daily notes<textarea aria-label="Corrected daily notes" style={{ display: 'block', width: '100%', minHeight: 70 }} value={value.notes} onChange={e => onChange({ ...value, notes: e.target.value })} /></label>
    {value.items.map(item => { const original = log.items.find(source => source.id === item.id); return <div key={item.id} style={{ borderTop: '1px solid #cbd5e1', padding: '12px 0', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <p style={{ width: '100%' }}>{original.itemCode} · {original.itemType} · {log.points.find(point => point.id === original.pointSegmentId)?.pointId || 'Site-wide'}<br />Before: {original.itemLabelSnapshot} · {original.quantity} {original.unit} · {original.notes || 'No item notes'}</p>
      <label>Description<input aria-label={`Description ${item.id}`} value={item.itemLabelSnapshot} onChange={e => itemChange(item.id, 'itemLabelSnapshot', e.target.value)} /></label>
      <label>Quantity<input aria-label={`Quantity ${item.id}`} type="number" min="0" step="any" value={item.quantity} onChange={e => itemChange(item.id, 'quantity', e.target.value)} /></label>
      <label>Unit<input aria-label={`Unit ${item.id}`} value={item.unit} onChange={e => itemChange(item.id, 'unit', e.target.value)} /></label>
      <label>Item notes<input aria-label={`Item notes ${item.id}`} value={item.notes} onChange={e => itemChange(item.id, 'notes', e.target.value)} /></label>
    </div>; })}
  </fieldset>;
}
