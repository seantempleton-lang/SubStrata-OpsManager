// Calendar arithmetic uses UTC only as a date-only counter, never as an instant.
export function nzToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function dateNumber(value) { return Date.parse(`${value}T00:00:00Z`) / 86400000; }
export function shiftDate(value, days) { return new Date((dateNumber(value) + days) * 86400000).toISOString().slice(0, 10); }
export function calendarDate(value) { return new Date(`${value}T12:00:00`); }
export function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function overlaps(aStart, aEnd, bStart, bEnd) { return aStart <= bEnd && aEnd >= bStart; }
export function matchesPlannerFilters(context, region, divisions) {
  return (region === 'all' || context.region === region) && (!context.division || Boolean(divisions[context.division]));
}
const normalized = value => String(value || '').trim().toLowerCase();
export function personnelLabel(entry) {
  return typeof entry === 'string' ? entry : entry?.displayName || entry?.name || entry?.fullName || entry?.employeeCode || entry?.userId || 'Unknown crew';
}

export function resolveCrew(personnel = [], staff = []) {
  return personnel.map(entry => {
    const source = typeof entry === 'string' ? { displayName: entry } : entry || {};
    const id = source.userId || source.id;
    const code = source.employeeCode || source.employee_code;
    // An explicit identity must never fall back to a different user with the same name.
    const matches = id ? staff.filter(p => p.dbId === id)
      : code ? staff.filter(p => normalized(p.id) === normalized(code))
        : staff.filter(p => normalized(p.name) === normalized(personnelLabel(entry)));
    return { entry, person: matches.length === 1 ? matches[0] : null, label: matches.length === 1 ? matches[0].name : personnelLabel(entry) };
  });
}

export function hasCrewMember(assignment, person, staff) {
  return resolveCrew(assignment.personnel, staff).some(ref => ref.person?.dbId === person.dbId);
}

export function plannerConflicts(assignments, staff, leave, from, to) {
  const visible = assignments.filter(a => overlaps(a.start, a.end, from, to));
  const warnings = [];
  const crew = new Map(visible.map(a => [a.id, resolveCrew(a.personnel, staff).filter(r => r.person)]));
  for (let i = 0; i < visible.length; i++) {
    const a = visible[i];
    for (let j = i + 1; j < visible.length; j++) {
      const b = visible[j];
      if (!overlaps(a.start, a.end, b.start, b.end) || !overlaps(a.start > b.start ? a.start : b.start, a.end < b.end ? a.end : b.end, from, to)) continue;
      const description = `${a.jobId || a.label || a.title} and ${b.jobId || b.label || b.title}`;
      if (a.rigId === b.rigId) warnings.push({ rigId: a.rigId, ids: [a.id, b.id], message: `${a.rigId}: ${description} overlap.` });
      for (const ref of crew.get(a.id)) {
        if (crew.get(b.id).some(other => other.person.dbId === ref.person.dbId)) warnings.push({ ids: [a.id, b.id], message: `${ref.label}: ${description} overlap.` });
      }
    }
    for (const ref of crew.get(a.id)) {
      for (const l of leave) {
        if (l.status === 'approved' && [ref.person.id, ref.person.dbId].includes(l.userId) && overlaps(a.start, a.end, l.start, l.end) && overlaps(a.start > l.start ? a.start : l.start, a.end < l.end ? a.end : l.end, from, to)) {
          warnings.push({ ids: [a.id], message: `${ref.label}: ${a.jobId || a.label || a.title} overlaps approved leave (${l.start} to ${l.end}).` });
        }
      }
    }
  }
  return warnings;
}
