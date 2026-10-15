// Operational quantities only. Exact identity/unit matching; no billing mapping.
export const itemKey = item => JSON.stringify([item.itemType, item.itemCode, item.itemLabelSnapshot, item.unit]);
export const formatQuantity = value => value.toLocaleString('en-NZ', { maximumSignificantDigits: 21 });
// Add the decimal values captured by the API without binary addition artefacts.
// No rounding or unit conversions are applied.
export function addQuantity(left, right) {
  const parts = value => {
    const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e');
    const [integer, fraction = ''] = mantissa.split('.');
    return { digits: BigInt(integer + fraction), scale: fraction.length - Number(exponent) };
  };
  const a = parts(left), b = parts(right), scale = Math.max(a.scale, b.scale);
  const sum = a.digits * 10n ** BigInt(scale - a.scale) + b.digits * 10n ** BigInt(scale - b.scale);
  const value = Number(`${sum}e${-scale}`);
  if (!Number.isFinite(value)) throw Object.assign(new Error('Recorded quantities exceed the supported total. Narrow the project period and review the source entries.'), { statusCode: 400 });
  return value;
}
export function summarizeWork(log) {
  const activities = new Map(), items = new Map(), exceptions = [];
  for (const entry of log.activities || []) {
    const allocation = entry.allocation?.type === 'job' ? entry.allocation.jobNumber : entry.allocation?.ancillaryCode;
    const key = JSON.stringify([entry.activityCode, entry.activityLabelSnapshot, allocation]);
    const row = activities.get(key) || { code: entry.activityCode, description: entry.activityLabelSnapshot, allocation, minutes: 0, entries: [] };
    const duration = (Date.parse(entry.endedAt) - Date.parse(entry.startedAt)) / 60000;
    if (!Number.isFinite(duration) || duration <= 0) exceptions.push(`Activity ${entry.activityCode}: missing or invalid duration.`);
    else row.minutes += duration;
    row.entries.push(entry); activities.set(key, row);
  }
  for (const item of log.items || []) {
    if (item.itemType === 'measurement') { exceptions.push(`${item.itemLabelSnapshot}: ${item.quantity} ${item.unit} is a reading/test entry; inspect its source before agreeing a project quantity.`); continue; }
    if (!['material', 'service', 'subcontractor'].includes(item.itemType) || !item.itemCode || !item.itemLabelSnapshot || !item.unit?.trim() || !Number.isFinite(item.quantity) || item.quantity < 0) {
      exceptions.push(`Item ${item.id}: incomplete identity, unit or quantity.`); continue;
    }
    const key = itemKey(item), row = items.get(key) || { key, code: item.itemCode, description: item.itemLabelSnapshot, type: item.itemType, unit: item.unit, quantity: 0, entries: [] };
    row.quantity = addQuantity(row.quantity, item.quantity); row.entries.push(item); items.set(key, row);
  }
  return { activities: [...activities.values()], items: [...items.values()], exceptions };
}
