'use client';

import { useState, useMemo } from 'react';

function fmtDate(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TYPE_META = {
  'Username':         { label: 'Username',  color: '#EF4444', icon: 'fa-at' },
  'Profile Name':     { label: 'Name',      color: '#4F8EF7', icon: 'fa-id-badge' },
  'Profile Bio Text': { label: 'Bio',       color: '#8B5CF6', icon: 'fa-pencil' },
  'Profile Bio Link': { label: 'Bio Link',  color: '#10B981', icon: 'fa-link' },
  'Email':            { label: 'Email',     color: '#F59E0B', icon: 'fa-envelope' },
  'Profile Photo':    { label: 'Photo',     color: '#10B981', icon: 'fa-image' },
};

const FILTERS = [
  { id: 'all',              label: 'All' },
  { id: 'Username',         label: 'Username' },
  { id: 'Profile Name',     label: 'Name' },
  { id: 'Profile Bio Text', label: 'Bio' },
  { id: 'Email',            label: 'Email' },
];

function ChangeCard({ c }) {
  const meta = TYPE_META[c.changed] ?? { label: c.changed, color: '#9ca3af', icon: 'fa-pen' };
  const { label, color, icon } = meta;

  return (
    <div className="bg-[#ffffff0d] border border-white/[0.07] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
        <span
          className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <i className={`fa-regular ${icon} text-[11px] flex-shrink-0`} style={{ color }} />
        <span
          className="text-[11px] font-semibold tracking-widest uppercase"
          style={{ color }}
        >
          {label}
        </span>
        <span className="ml-auto text-gray-400 text-xs font-inter tabular-nums flex-shrink-0">
          {fmtDate(c.timestamp)}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {c.prev && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 w-8 flex-shrink-0">from</span>
            <span
              className="text-[13px] font-mono px-2.5 py-1 rounded-md break-words whitespace-pre-wrap leading-snug"
              style={{
                background: 'rgba(239,68,68,0.07)',
                color: 'rgba(239,68,68,0.6)',
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(239,68,68,0.3)',
              }}
            >
              {c.prev}
            </span>
          </div>
        )}
        {c.prev && c.next && (
          <div className="pl-11">
            <i className="fa-regular fa-arrow-down text-[10px] text-gray-700" />
          </div>
        )}
        {c.next && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 w-8 flex-shrink-0">to</span>
            <span className="text-[13px] font-mono px-2.5 py-1 rounded-md bg-white/[0.04] text-gray-200 break-words whitespace-pre-wrap leading-snug">
              {c.next}
            </span>
          </div>
        )}
        {!c.prev && !c.next && (
          <span className="text-gray-700 text-sm italic">Value cleared</span>
        )}
      </div>
    </div>
  );
}

export function ProfileTimeline({ data }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const changes = useMemo(
    () => [...(data.profileChanges ?? [])].sort((a, b) => a.timestamp - b.timestamp),
    [data.profileChanges]
  );

  const counts = useMemo(() => {
    const c = { all: changes.length };
    changes.forEach(ch => { c[ch.changed] = (c[ch.changed] || 0) + 1; });
    return c;
  }, [changes]);

  const filtered = useMemo(() => changes.filter(c => {
    if (activeFilter !== 'all' && c.changed !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (c.prev ?? '').toLowerCase().includes(q) || (c.next ?? '').toLowerCase().includes(q);
    }
    return true;
  }), [changes, activeFilter, search]);

  const byYear = useMemo(() => {
    const groups = [];
    let curYear = null;
    for (const c of filtered) {
      const yr = new Date(c.timestamp * 1000).getFullYear();
      if (yr !== curYear) { groups.push({ year: yr, items: [] }); curYear = yr; }
      groups[groups.length - 1].items.push(c);
    }
    return groups;
  }, [filtered]);

  if (!changes.length) {
    return (
      <div className="flex flex-col gap-4">
        <div className="pb-4 border-b border-white/10">
          <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Profile Timeline</h1>
        </div>
        <p className="text-gray-400 text-sm py-16 text-center">No profile change history found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Profile Timeline</h1>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[11px] px-2 py-0.5 rounded-[10px] font-medium"
            style={{
              background: 'rgba(79,142,247,0.15)',
              color: '#4F8EF7',
              border: '0.5px solid rgba(79,142,247,0.3)',
            }}
          >
            {changes.length} changes
          </span>
          <span className="text-gray-500 text-sm font-inter">since {fmtDate(changes[0].timestamp)}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => {
            const cnt = f.id === 'all' ? counts.all : (counts[f.id] || 0);
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="flex items-center gap-1.5 text-[12px] rounded-[20px] px-3 py-[5px] cursor-pointer transition-all duration-150"
                style={{
                  background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                  border: `0.5px solid ${active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)'}`,
                  color: active ? '#fff' : 'rgba(255,255,255,0.42)',
                  fontFamily: 'inherit',
                }}
              >
                {f.label}
                {cnt > 0 && (
                  <span
                    className="text-[10px] px-[5px] py-px rounded-full leading-none"
                    style={{
                      background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                      color: active ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)',
                    }}
                  >
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-[168px] sm:flex-shrink-0">
          <i
            className="fa-regular fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search values…"
            className="w-full text-[12px] rounded-lg outline-none bg-white/[0.04] border border-white/[0.07] text-gray-200 placeholder-gray-600 focus:border-white/20 transition-colors"
            style={{ padding: '6px 10px 6px 28px', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Timeline */}
      {byYear.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">No matching changes</p>
      ) : (
        <div className="flex flex-col gap-8 mt-2">
          {byYear.map(({ year, items }) => (
            <div key={year}>
              {/* Year header */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[1.65rem] flex-shrink-0">{year}</h2>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-400 text-xs flex-shrink-0">
                  {items.length} change{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((c, i) => <ChangeCard key={i} c={c} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
