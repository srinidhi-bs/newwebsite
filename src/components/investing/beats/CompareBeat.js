/**
 * CompareBeat — "the catch": each place rated on the same few questions (S2)
 * ===========================================================================
 * Shows every place money can live as a small card answering the same
 * questions (e.g. "Beat prices?", "How safe?", "Get money back?"). Cards,
 * not a table: a 4-column table is unreadable on a phone, and many first
 * readers are on a phone. Two cards per row on wider screens.
 *
 * Example beat:
 *   { id: 's2-catch', type: 'compare', kicker: 'THE CATCH',
 *     text: 'Growth isn't everything. Ask three questions:',
 *     columns: [ { key: 'grow', label: 'Beat prices?' },
 *                { key: 'safe', label: 'How safe?' },
 *                { key: 'access', label: 'Get money back' } ],
 *     rows: [ { icon: '🏦', label: 'Savings account',
 *               grow: '❌ No', safe: 'Very safe', access: 'Any time' }, ... ],
 *     footer: 'No option is high-growth, very safe AND instantly available.' }
 *
 * Nothing to answer here — Next is always open.
 *
 * @param {Object} props.beat
 * ===========================================================================
 */
import React from 'react';

const CompareBeat = ({ beat }) => (
  <div>
    {beat.kicker && (
      <p className="font-labmono text-xs tracking-widest uppercase mb-4 text-accent-trading">{beat.kicker}</p>
    )}
    {beat.text && <p className="text-xl md:text-2xl leading-relaxed text-ink mb-5">{beat.text}</p>}

    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="compare-cards">
      {beat.rows.map((row) => (
        <li key={row.label} className="border border-ink/15 rounded-lg p-3">
          <p className="font-bold text-ink mb-2">
            <span aria-hidden="true" className="mr-1.5">{row.icon}</span>{row.label}
          </p>
          <dl className="space-y-1 text-sm">
            {beat.columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-3">
                <dt className="text-ink-muted shrink-0">{col.label}</dt>
                <dd className="text-ink text-right">{row[col.key]}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>

    {beat.footer && (
      <p className="text-lg md:text-xl leading-relaxed text-ink mt-6">{beat.footer}</p>
    )}
  </div>
);

export default CompareBeat;
