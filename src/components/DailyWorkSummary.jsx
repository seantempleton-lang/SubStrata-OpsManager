import React from 'react';
import { summarizeWork, formatQuantity } from '../domain/dailyWork.js';

export default function DailyWorkSummary({ log }) {
  const summary = summarizeWork(log);
  return <section aria-label="Work at a glance">
    <h3>Work at a glance</h3>
    <p>{log.crew?.length || 0} attendance periods · {log.points?.length || 0} bore/point segments · {log.items?.length || 0} item entries</p>
    <p>Recorded work quantities and activity durations. Chargeable quantities are agreed separately.</p>
    <table style={{ width: '100%', textAlign: 'left' }}><thead><tr><th>Activity</th><th>Allocation</th><th>Recorded duration</th></tr></thead><tbody>{summary.activities.map((a, i) => <tr key={i}><td>{a.code} · {a.description}</td><td>{a.allocation}</td><td>{(a.minutes / 60).toLocaleString('en-NZ', { maximumFractionDigits: 3 })} h</td></tr>)}</tbody></table>
    <table style={{ width: '100%', textAlign: 'left' }}><thead><tr><th>Item / description</th><th>Type</th><th>Recorded quantity</th></tr></thead><tbody>{summary.items.map(i => <tr key={i.key}><td>{i.code} · {i.description}</td><td>{i.type}</td><td>{formatQuantity(i.quantity)} {i.unit}</td></tr>)}</tbody></table>
    {!!summary.exceptions.length && <div role="note"><strong>Entries requiring source review</strong><ul>{summary.exceptions.map((text, i) => <li key={i}>{text}</li>)}</ul></div>}
  </section>;
}
