'use client';

import { useState, useMemo, useEffect } from 'react';

function decode(s) {
  if (!s) return '';
  try { return decodeURIComponent(escape(s)); } catch { return s; }
}

function fmtDateMs(ms) {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDate(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded px-0.5 not-italic" style={{ background: 'rgba(0,102,255,0.25)', color: '#93c5fd' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const MAX = 100;

export function Search({ data, onOpenConvo }) {
  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQ(query.trim()), 280);
    return () => clearTimeout(t);
  }, [query]);

  const msgResults = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    const out = [];
    for (const thread of (data.allMessages ?? [])) {
      for (const msg of (thread.all ?? [])) {
        const content = decode(msg.content ?? '');
        if (!content || !content.toLowerCase().includes(ql)) continue;
        out.push({
          thread: thread.username ?? thread.name,
          threadId: thread.name,
          content,
          sender: decode(msg.sender_name ?? ''),
          ts: msg.timestamp_ms,
          isMe: decode(msg.sender_name ?? '') === (data.rawName ?? ''),
        });
        if (out.length >= MAX) break;
      }
      if (out.length >= MAX) break;
    }
    return out.sort((a, b) => b.ts - a.ts);
  }, [q, data.allMessages, data.rawName]);

  const commentResults = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    return (data.commentsList ?? [])
      .map(c => ({
        text: decode(c.string_map_data?.['Comment']?.value ?? c.string_list_data?.[0]?.value ?? c.title ?? ''),
        owner: decode(c.string_map_data?.['Media Owner']?.value ?? ''),
        ts: c.string_list_data?.[0]?.timestamp ?? c.string_map_data?.['Time']?.timestamp ?? null,
      }))
      .filter(c => c.text.toLowerCase().includes(ql))
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
      .slice(0, MAX);
  }, [q, data.commentsList]);

  const total = msgResults.length + commentResults.length;
  const hasQuery = q.length > 0;

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Search</h1>
        <p className="text-gray-500 text-sm mt-1 font-inter">
          Search through your messages and comments
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <i className="fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search messages, comments…"
          className="w-full bg-[#ffffff0d] border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-white text-[15px] outline-none focus:border-white/20 transition-colors placeholder-gray-600"
          style={{ fontFamily: 'inherit' }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setQ(''); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-400 transition-colors bg-transparent border-0 cursor-pointer"
          >
            <i className="fa-regular fa-xmark" />
          </button>
        )}
      </div>

      {/* Empty state */}
      {!hasQuery && (
        <div className="flex flex-col items-center py-10 sm:py-20 gap-3 text-center">
          <i className="fa-regular fa-magnifying-glass text-4xl" style={{ color: 'rgba(255,255,255,0.08)' }} />
          <p className="text-gray-400 text-sm">
            {(data.allMessages?.reduce((s, t) => s + t.all.length, 0) ?? 0).toLocaleString()} messages
            &nbsp;&middot;&nbsp;
            {(data.commentsList?.length ?? 0).toLocaleString()} comments
          </p>
        </div>
      )}

      {/* No results */}
      {hasQuery && total === 0 && (
        <div className="flex flex-col items-center py-10 sm:py-20 gap-3 text-center">
          <i className="fa-regular fa-file-slash text-4xl" style={{ color: 'rgba(255,255,255,0.08)' }} />
          <p className="text-gray-400 text-sm">No results for &ldquo;{q}&rdquo;</p>
        </div>
      )}

      {/* Results */}
      {hasQuery && total > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-500 text-sm font-inter">
            {total}{total === MAX ? '+' : ''} result{total !== 1 ? 's' : ''} for{' '}
            <span className="text-white">&ldquo;{q}&rdquo;</span>
          </p>

          {/* Messages */}
          {msgResults.length > 0 && (
            <div className="stats-box px-4 py-4 sm:px-7 sm:py-7 bg-[#ffffff0d] rounded-lg">
              <div className="stats-content w-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#06f] flex-shrink-0" />
                  <h2 className="text-[1.65rem]">Messages</h2>
                  <span className="text-gray-500 text-sm ml-1 font-inter">
                    {msgResults.length}{msgResults.length === MAX ? '+' : ''}
                  </span>
                </div>

                <div className="flex flex-col">
                  {msgResults.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => onOpenConvo?.(r.threadId, q)}
                      className={`py-3 border-b border-white/[0.06] last:border-0 rounded-lg px-2 -mx-2 transition-colors ${onOpenConvo ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#06f] text-sm font-semibold truncate">{r.thread}</span>
                          {!r.isMe && r.sender && (
                            <span className="text-gray-400 text-xs flex-shrink-0">· {r.sender}</span>
                          )}
                          {r.isMe && (
                            <span className="text-gray-400 text-xs flex-shrink-0">· You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-gray-400 text-xs font-inter tabular-nums">
                            {fmtDateMs(r.ts)}
                          </span>
                          {onOpenConvo && <i className="fa-regular fa-arrow-up-right-from-square text-gray-600 text-[10px]" />}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed break-words">
                        <Highlight text={r.content} query={q} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          {commentResults.length > 0 && (
            <div className="stats-box p-4 sm:p-7 bg-[#ffffff0d] rounded-lg">
              <div className="stats-content w-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: '#8B5CF6' }} />
                  <h2 className="text-[1.65rem]">Comments</h2>
                  <span className="text-gray-500 text-sm ml-1 font-inter">
                    {commentResults.length}{commentResults.length === MAX ? '+' : ''}
                  </span>
                </div>

                <div className="flex flex-col">
                  {commentResults.map((c, i) => (
                    <div key={i} className="py-3 border-b border-white/[0.06] last:border-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        {c.owner
                          ? <span className="text-sm font-semibold" style={{ color: '#8B5CF6' }}>@{c.owner}</span>
                          : <span className="text-gray-400 text-sm italic">unknown post</span>
                        }
                        {c.ts && (
                          <span className="text-gray-400 text-xs tabular-nums flex-shrink-0">
                            {fmtDate(c.ts)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed break-words">
                        <Highlight text={c.text} query={q} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
