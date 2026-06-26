'use client';
import { useMemo, useState, useRef, useLayoutEffect, useEffect, useCallback, memo } from 'react';

const decode = (s) => { try { return decodeURIComponent(escape(s)); } catch { return s ?? ''; } };

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " '" + String(d.getFullYear()).slice(2);
}

function fmtFull(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const PALETTE = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#06b6d4', '#0ea5e9', '#7c3aed', '#4f46e5',
  '#0891b2', '#2563eb',
];

function Avatar({ username, cls = 'w-10 h-10 text-sm' }) {
  const initial = (username?.[0] ?? '?').toUpperCase();
  const bg = PALETTE[initial.charCodeAt(0) % PALETTE.length];
  return (
    <div className={`flex-shrink-0 ${cls} rounded-full flex items-center justify-center text-white/90 font-bold`}
      style={{ background: bg + 'b3' }}>
      {initial}
    </div>
  );
}

const CHAT_IGNORE = new Set([
  // pronouns / articles
  'the','a','an','i','you','he','she','it','we','they','me','him','her','us','them',
  'my','your','his','its','our','their',
  // prepositions / conjunctions
  'in','on','at','to','for','with','by','from','and','or','but','nor','so','yet',
  'into','over','out','up','about','than','if','all','one','more','some','any','same',
  // auxiliary / common verbs
  'is','are','was','were','be','been','have','has','had','do','does','did',
  'will','would','can','could','shall','should','may','might','must',
  'get','got','go','going','come','came','know','want','think','look','see',
  'make','take','tell','need','let','feel','keep','put','give','use','say','said',
  // contractions (after apostrophe removal)
  'im','dont','doesnt','didnt','cant','wont','wasnt','isnt','arent','werent',
  'wouldnt','couldnt','shouldnt','hadnt','hasnt','havent','aint','thats','whos',
  'whats','theres','heres','its','ive','hed','shed','wed','theyd','youre','theyre',
  // filler / chat-speak
  'just','now','then','there','here','so','very','really','also','too','back',
  'well','good','right','like','lol','omg','ok','okay','u','ur','r','idk','nvm',
  'lmao','fr','bruh','yeah','yep','yes','nah','no','not','hi','hey',
  'oh','ah','hm','uh','hmm','haha','hahaha','lmfao','omfg','wtf','tf','ngl',
  'only','even','still','already','always','never','ever','once','again',
  'day','time','days','times','way','bit','lot','once','part','thing','things',
  'stuff','ill','ima','imo','tbh','btw','fyi','smh','oof','yoo','yooo',
  // question words / demonstratives
  'what','this','that','these','those','how','when','where','why','which','who',
  // Instagram system / meta words
  'sent','attachment','liked','reacted','message','messages','photo','video',
  'gif','sticker','audio','link','reel','story','post','shared','share',
  'instagram','insta','ig','dm','edited','notified','quiet','mode','because',
  'mode','removed','unsent','unavailable',
]);

function getMyMonthlyData(messages, rawName) {
  if (!messages.length) return { values: [], keys: [] };
  const fill = (msgs) => {
    const counts = {};
    for (const m of msgs) {
      const d = new Date(m.timestamp_ms);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  };
  let counts = fill(rawName ? messages.filter(m => m.sender_name === rawName) : messages);
  if (!Object.keys(counts).length) counts = fill(messages);
  const allKeys = Object.keys(counts).sort();
  if (!allKeys.length) return { values: [], keys: [] };
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const endKey = nowKey > allKeys.at(-1) ? nowKey : allKeys.at(-1);
  const keys = [], values = [];
  let [y, mo] = allKeys[0].split('-').map(Number);
  const [endY, endMo] = endKey.split('-').map(Number);
  while (y < endY || (y === endY && mo <= endMo)) {
    const key = `${y}-${String(mo).padStart(2, '0')}`;
    keys.push(key); values.push(counts[key] ?? 0);
    mo++; if (mo > 12) { mo = 1; y++; }
  }
  return { values, keys };
}

function CardSparkline({ values: rawValues, keys: rawKeys, uid }) {
  const values = rawValues.length === 1 ? [0, ...rawValues] : rawValues;
  const keys = rawKeys.length === 1 ? [rawKeys[0], rawKeys[0]] : rawKeys;
  if (!values || values.length < 2) return <div className="h-14" />;
  const W = 300, chartH = 44, labelH = 14, H = chartH + labelH, P = 3;
  const iW = W - P * 2, iH = chartH - P * 2;
  const max = Math.max(...values, 1);
  const step = iW / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => ({ x: P + i * step, y: P + iH - (v / max) * iH }));
  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cx} ${prev.y.toFixed(1)} ${cx} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');
  const areaD = `${pathD} L ${(P + iW).toFixed(1)} ${(P + iH).toFixed(1)} L ${P} ${(P + iH).toFixed(1)} Z`;
  const yearLabels = [];
  let prevYear = null, lastLabelX = -Infinity;
  keys.forEach((k, i) => {
    const yr = k.slice(0, 4);
    const x = P + i * step;
    if (yr !== prevYear && x - lastLabelX >= 30) { yearLabels.push({ i, yr }); lastLabelX = x; }
    prevYear = yr;
  });
  const gid = `msg-grad-${uid}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gid})`} />
      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {yearLabels.map(({ i, yr }) => {
        const x = pts[i].x;
        const anchor = i === 0 ? 'start' : i >= keys.length - 2 ? 'end' : 'middle';
        return (
          <g key={yr}>
            <line x1={x} y1={chartH - 2} x2={x} y2={chartH + 3} stroke="#374151" strokeWidth="1" />
            <text x={x} y={H - 1} textAnchor={anchor} fill="#4b5563" fontSize="10" fontFamily="Inter, sans-serif">{yr}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Highlight ────────────────────────────────────────────────────────────────

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

// ── HourMiniChart ─────────────────────────────────────────────────────────────

function HourMiniChart({ hourCounts }) {
  const max = Math.max(...hourCounts, 1);
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 40 }}>
      {hourCounts.map((v, i) => {
        const h = Math.max((v / max) * 36, v > 0 ? 2 : 0);
        return (
          <div key={i} className="flex-1 rounded-sm" title={`${i}:00 · ${v}`}
            style={{ height: h, background: v > 0 ? `rgba(99,102,241,${0.25 + (v / max) * 0.75})` : 'rgba(255,255,255,0.05)' }} />
        );
      })}
    </div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

const ATTACHMENT_RE = /sent an attachment/i;

function MessageBubble({ msg, isMe, highlightTerm }) {
  const content = msg.content ? decode(msg.content) : null;
  const isAttachment = content && ATTACHMENT_RE.test(content);
  let body;
  if (isAttachment)                     body = <span className="italic text-gray-300 text-xs">🔗 Shared a post / reel</span>;
  else if (content) {
    body = highlightTerm ? <Highlight text={content} query={highlightTerm} /> : content;
  } else if (msg.photos?.length)        body = <span className="italic text-gray-300 text-xs">📷 Photo</span>;
  else if (msg.videos?.length)          body = <span className="italic text-gray-300 text-xs">🎥 Video</span>;
  else if (msg.audio_files?.length)     body = <span className="italic text-gray-300 text-xs">🎵 Voice message</span>;
  else if (msg.gifs?.length)            body = <span className="italic text-gray-300 text-xs">GIF</span>;
  else if (msg.sticker)                 body = <span className="italic text-gray-300 text-xs">Sticker</span>;
  else if (msg.share?.link)             body = <span className="italic text-gray-300 text-xs">🔗 Shared a link</span>;
  else return null;

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-4 py-[3px]`}>
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[65%] gap-0.5`}>
        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
          isMe
            ? 'text-white rounded-tr-sm'
            : 'text-gray-200 rounded-tl-sm'
        }`} style={isMe
          ? { background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 2px 12px rgba(99,102,241,0.25)' }
          : { background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.06)' }
        }>
          {body}
        </div>
        <span className="text-[10px] text-gray-600 px-1">{fmtFull(msg.timestamp_ms)}</span>
      </div>
    </div>
  );
}

// ── VirtualMessageList ────────────────────────────────────────────────────────

const CHUNK = 60;

function VirtualMessageList({ messages, rawName, highlightTerm }) {
  // Compute anchor and initial window once on mount (frozen deps)
  const { anchorIdx, initStart, initEnd } = useMemo(() => {
    let anchorIdx = -1;
    if (highlightTerm) {
      const hl = highlightTerm.toLowerCase();
      anchorIdx = messages.findIndex(m => m.content && decode(m.content).toLowerCase().includes(hl));
    }
    const initStart = anchorIdx >= 0
      ? Math.max(0, anchorIdx - Math.floor(CHUNK / 2))
      : Math.max(0, messages.length - CHUNK);
    const initEnd = anchorIdx >= 0
      ? Math.min(messages.length, initStart + CHUNK)
      : messages.length;
    return { anchorIdx, initStart, initEnd };
  }, []); // intentionally frozen on mount

  const [start, setStart] = useState(initStart);
  const [end, setEnd]     = useState(initEnd);

  const containerRef  = useRef(null);
  const anchorElemRef = useRef(null);
  const prependRef    = useRef(null); // { top, height } saved before prepend
  const upBusyRef     = useRef(false);
  const downBusyRef   = useRef(false);

  // On mount: scroll to anchor (search) or bottom
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (anchorElemRef.current) {
      anchorElemRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []); // mount only

  // After every render: restore scroll position if we just prepended older messages
  useLayoutEffect(() => {
    if (!prependRef.current) return;
    const { top, height } = prependRef.current;
    prependRef.current = null;
    upBusyRef.current = false;
    const el = containerRef.current;
    if (el) el.scrollTop = top + (el.scrollHeight - height);
  });

  // After end grows: clear the downward-loading guard
  useEffect(() => { downBusyRef.current = false; }, [end]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Load older messages when near the top
    if (el.scrollTop < 120 && start > 0 && !upBusyRef.current) {
      upBusyRef.current = true;
      prependRef.current = { top: el.scrollTop, height: el.scrollHeight };
      setStart(s => Math.max(0, s - CHUNK));
    }

    // Load newer messages when near the bottom (only relevant when anchor is mid-conversation)
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 120 && end < messages.length && !downBusyRef.current) {
      downBusyRef.current = true;
      setEnd(e => Math.min(messages.length, e + CHUNK));
    }
  }, [start, end, messages.length]);

  const visible  = messages.slice(start, end);
  const atBegin  = start === 0;
  const atEnd    = end === messages.length;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto scrollbar-subtle"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Top indicator */}
      <div className="flex items-center justify-center py-4">
        {atBegin
          ? <span className="text-gray-600 text-xs">Beginning of conversation</span>
          : <div className="w-4 h-4 border-2 border-[#6366f1]/40 border-t-[#6366f1] rounded-full animate-spin" />
        }
      </div>

      <div className="pb-4">
        {visible.map((msg, i) => {
          const absIdx = start + i;
          const isAnchor = anchorIdx >= 0 && absIdx === anchorIdx;
          return (
            <div
              key={absIdx}
              ref={isAnchor ? anchorElemRef : null}
              className={isAnchor ? 'ring-1 ring-[#6366f1]/40 rounded-2xl mx-3 my-0.5' : ''}
            >
              <MessageBubble msg={msg} isMe={msg.sender_name === rawName} highlightTerm={highlightTerm} />
            </div>
          );
        })}
      </div>

      {/* Bottom indicator — shown when there are newer messages below the window */}
      {!atEnd && (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-[#6366f1]/40 border-t-[#6366f1] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ── ConvoDetail ───────────────────────────────────────────────────────────────

const fmtHour = h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

function ConvoDetail({ dm, rawName, highlightTerm, onClose }) {
  // dm.all is pre-sorted ascending by timestamp_ms (sorted during parse in mywrap/page.js)
  const messages = dm.all;

  const myCount    = dm.mineCount;
  const total      = dm.count;
  const theirCount = total - myCount;
  const myPct      = total ? Math.round(myCount / total * 100) : 0;
  const daySpan    = Math.max(1, Math.ceil((dm.maxTs - dm.minTs) / 86400000));
  const avgPerDay  = (total / daySpan).toFixed(1);
  const isGroup    = dm.participantsCount > 2;

  // Defer heavy per-message stats so the chat pane renders immediately on click
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;

      // Tokens from every participant name (split on dots, underscores, spaces, etc.)
      const nameTokens = new Set(
        (dm.participants ?? [])
          .flatMap(p => decode(p.name ?? '').toLowerCase().split(/\W+/))
          .filter(t => t.length >= 2)
      );

      // System messages that should never contribute to word counts
      const SYSTEM_RE = /notified about this message|quiet mode|reacted .+ to your message/i;

      const freq = new Map();
      for (const m of messages) {
        if (!m.content) continue;
        const raw = decode(m.content);
        if (ATTACHMENT_RE.test(raw) || SYSTEM_RE.test(raw)) continue;
        const words = raw.toLowerCase()
          .replace(/https?:\/\/\S+/g, '')
          .replace(/[''`]/g, '')
          .split(/\W+/);
        for (const w of words) {
          if (w.length < 3 || CHAT_IGNORE.has(w) || nameTokens.has(w) || /^(.)\1{2,}$/.test(w)) continue;
          freq.set(w, (freq.get(w) || 0) + 1);
        }
      }
      const topWords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word, count]) => ({ word, count }));

      let photos = 0, videos = 0, shares = 0, voice = 0, gifs = 0;
      for (const m of messages) {
        if (m.photos?.length)                                          photos++;
        if (m.videos?.length)                                          videos++;
        if (m.share?.link || (m.content && ATTACHMENT_RE.test(decode(m.content)))) shares++;
        if (m.audio_files?.length)                                     voice++;
        if (m.gifs?.length)                                            gifs++;
      }

      const hourCounts = new Array(24).fill(0);
      for (const m of messages) hourCounts[new Date(m.timestamp_ms).getHours()]++;
      const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

      const dayCounts = {};
      for (const m of messages) {
        const d = new Date(m.timestamp_ms);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dayCounts[key] = (dayCounts[key] || 0) + 1;
      }
      const top = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
      let mostActiveDay = null, mostActiveDayCount = 0;
      if (top) {
        const [y, mo, day] = top[0].split('-').map(Number);
        mostActiveDay = new Date(y, mo - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        mostActiveDayCount = top[1];
      }

      if (!cancelled) setStats({ topWords, hourCounts, peakHour, mostActiveDay, mostActiveDayCount, photos, videos, shares, voice, gifs });
    });
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [dm]); // recompute when conversation changes

  const statsContent = (
    <>
      {/* Stat boxes */}
      <div className="flex flex-shrink-0 border-b border-white/10">
        {[['MINE', fmt(myCount)], ['THEIRS', fmt(theirCount)]].map(([label, val], i) => (
          <div key={label} className={`flex-1 py-4 text-center${i === 0 ? ' border-r border-white/10' : ''}`}>
            <div className="text-white text-2xl font-black leading-none">{val}</div>
            <div className="text-gray-300 text-[9px] tracking-widest mt-2 font-inter">{label}</div>
          </div>
        ))}
      </div>
      {/* Scrollable sections — fills remaining panel height */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Sections with dividers */}
        <div className="flex flex-col divide-y divide-white/10">
          {/* Ratio bar */}
          <div className="px-4 py-3">
            <div className="flex justify-between text-[11px] mb-2" style={{ color: '#9ca3af' }}>
              <span>You {myPct}%</span>
              <span>Them {100 - myPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${myPct}%`, background: '#6366f1' }} />
            </div>
          </div>
          {/* Sparkline */}
          <div className="px-4 py-3">
            <p className="text-[9px] uppercase tracking-widest mb-2 font-inter" style={{ color: '#6b7280' }}>Activity</p>
            <CardSparkline values={dm.allMonthly.values} keys={dm.allMonthly.keys} uid={`det-${dm.name}`} />
          </div>
          {/* Top words — deferred */}
          {stats?.topWords?.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-[9px] uppercase tracking-widest mb-2.5 font-inter" style={{ color: '#6b7280' }}>Top Words</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topWords.map(({ word, count }) => (
                  <span key={word}
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc' }}>
                    {word} <span style={{ color: '#6b7280', fontSize: 10 }}>{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Hour chart — deferred */}
          <div className="px-4 py-3">
            <p className="text-[9px] uppercase tracking-widest mb-2 font-inter" style={{ color: '#6b7280' }}>Active Hours</p>
            {stats
              ? <>
                  <HourMiniChart hourCounts={stats.hourCounts} />
                  <div className="flex justify-between mt-1" style={{ fontSize: 9, color: '#4b5563' }}>
                    <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
                  </div>
                  <p className="mt-1.5" style={{ fontSize: 11, color: '#6b7280' }}>
                    Peak · <span style={{ color: '#d1d5db' }}>{fmtHour(stats.peakHour)}</span>
                  </p>
                </>
              : <div className="h-10 rounded bg-white/[0.04] animate-pulse" />
            }
          </div>
          {/* Quick stats */}
          <div className="px-4 py-3 flex flex-col gap-[9px]">
            {[
              { label: 'First message', value: fmtDate(dm.minTs) },
              { label: 'Last message',  value: fmtDate(dm.maxTs) },
              { label: 'Avg per day',   value: avgPerDay },
              { label: 'Day span',      value: `${daySpan.toLocaleString()} days` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="font-inter flex-shrink-0" style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
                <span className="font-inter tabular-nums text-right" style={{ fontSize: 11, color: '#d1d5db', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer — pushes Most Active Day to bottom */}
        <div className="flex-1" />

        {/* Most active day — pinned at bottom */}
        {stats?.mostActiveDay && (
          <div className="px-4 pt-3 pb-3 border-t border-white/10">
            <div className="flex items-stretch rounded-xl overflow-hidden" style={{ background: '#ffffff0d', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-center flex-shrink-0 w-[44px]">
                <i className="fa-regular fa-calendar" style={{ fontSize: 18, color: '#818cf8' }} />
              </div>
              <div style={{ width: 1, background: '#ffffff0d', flexShrink: 0 }} />
              <div className="flex flex-col justify-center px-3 py-2">
                <span className="font-inter uppercase tracking-widest" style={{ fontSize: 8.5, color: '#6b7280', fontWeight: 600, letterSpacing: '0.08em' }}>Most active day</span>
                <span className="font-inter tabular-nums font-black" style={{ fontSize: 18, color: '#d1d5db', lineHeight: 1.15 }}>{stats.mostActiveDayCount.toLocaleString()}</span>
                <span className="font-inter" style={{ fontSize: 10, color: '#6b7280' }}>{stats.mostActiveDay}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 96px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0 pb-4 border-b border-white/[0.08]">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer px-0"
        >
          <i className="fa-regular fa-arrow-left text-sm" />
          <span className="text-sm">Back</span>
        </button>
        <div className="w-px h-4 bg-white/10" />
        <Avatar username={dm.username} cls="w-9 h-9 text-sm" />
        <div className="flex-1 min-w-0">
          <span className="text-white font-semibold text-[15px] truncate block leading-tight">{dm.username}</span>
          <span className="text-gray-300 text-xs">{fmtDate(dm.minTs)} — {fmtDate(dm.maxTs)}{isGroup ? ` · ${dm.participantsCount} people` : ''}</span>
        </div>
        <span className="text-gray-400 text-xs sm:text-sm font-inter flex-shrink-0 hidden sm:block">{total.toLocaleString()} messages</span>
        {/* Stats toggle — mobile/tablet only */}
        <button
          onClick={() => setShowStats(s => !s)}
          title="Stats"
          className={`lg:hidden flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border-0 cursor-pointer transition-all ${
            showStats
              ? 'bg-[#6366f1]/20 text-[#818cf8]'
              : 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.10] hover:text-white'
          }`}
        >
          <i className="fa-regular fa-chart-bar text-sm" />
        </button>
      </div>

      {/* Body */}
      <div className="flex gap-4 flex-1 min-h-0 pt-4 sm:pt-6">
        {/* Message list */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #0a0d1a 50%, #070912 100%)' }}>
          <VirtualMessageList messages={messages} rawName={rawName} highlightTerm={highlightTerm} />
        </div>

        {/* Desktop inline stats panel (lg+) */}
        <div
          className="w-[220px] flex-shrink-0 hidden lg:flex flex-col rounded-xl"
          style={{
            background: 'linear-gradient(180deg, #0f1220 0%, #0c0f1c 100%)',
            border: '1px solid rgba(99,102,241,0.12)',
            overflow: 'hidden',
          }}
        >
          {statsContent}
        </div>
      </div>

      {/* Mobile drawer backdrop (< lg) */}
      {showStats && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-[2px]"
          onClick={() => setShowStats(false)}
        />
      )}

      {/* Mobile stats drawer — slides in from right (< lg) */}
      <div
        className={`fixed top-0 right-0 h-full z-50 lg:hidden flex flex-col rounded-l-2xl transition-transform duration-300 ease-in-out ${
          showStats ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: 260,
          background: 'linear-gradient(180deg, #0f1220 0%, #0c0f1c 100%)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRight: 'none',
          overflow: 'hidden',
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-[11px] font-semibold uppercase tracking-widest font-inter" style={{ color: '#6b7280' }}>Stats</span>
          <button
            onClick={() => setShowStats(false)}
            className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/[0.08] transition-colors"
          >
            <i className="fa-regular fa-xmark text-sm" />
          </button>
        </div>
        {statsContent}
      </div>
    </div>
  );
}

// ── ConvoCard ─────────────────────────────────────────────────────────────────

const ConvoCard = memo(function ConvoCard({ dm, idx, showAll, onClick }) {
  const preview = decode(dm.lastMsg?.content ?? '');
  const spark = showAll ? dm.allMonthly : dm.monthly;
  return (
    <div
      onClick={onClick}
      className="h-full bg-[#ffffff07] border border-[#ffffff0c] rounded-xl p-4 flex flex-col gap-3 hover:bg-[#ffffff0d] hover:border-[#6366f1]/50 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.25)] transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <Avatar username={dm.username} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex flex-col min-w-0">
              <span className="text-white text-base font-semibold leading-tight truncate">{dm.username}</span>
              <span className="text-gray-300 text-xs leading-none mt-[7px] whitespace-nowrap">
                {fmtDate(dm.minTs)} → {fmtDate(dm.maxTs)}
              </span>
            </div>
            <div className="flex-shrink-0 text-right ml-1">
              <span className="text-white text-xl font-black leading-none">{fmt(showAll ? dm.count : dm.mineCount)}</span>
              <span className="text-gray-300 text-[10px] tracking-widest block mt-0.5">{showAll ? 'TOTAL' : 'MINE'}</span>
            </div>
          </div>
        </div>
      </div>
      <CardSparkline values={spark.values} keys={spark.keys} uid={idx} />
      <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs leading-relaxed truncate">
          {preview || <span className="text-gray-400 italic">No text content</span>}
        </p>
      </div>
    </div>
  );
});

// ── Messages ──────────────────────────────────────────────────────────────────

export function Messages({ data, pendingConvo, onPendingConvoHandled }) {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('msgs');
  const [showAll, setShowAll]     = useState(false);
  const [showGroups, setShowGroups]   = useState(true);
  const [hideIgUsers, setHideIgUsers] = useState(false);

  const totalAllMessages = data.allMessages.reduce((s, dm) => s + dm.count, 0);
  const conversations    = data.allMessages.length;
  const rawName          = data.rawName;

  const enriched = useMemo(() => data.allMessages.map(dm => {
    let minTs = Infinity, maxTs = -Infinity, lastMsg = null;
    for (const m of dm.all) {
      if (m.timestamp_ms < minTs) minTs = m.timestamp_ms;
      if (m.timestamp_ms > maxTs) { maxTs = m.timestamp_ms; lastMsg = m; }
    }
    const monthly    = getMyMonthlyData(dm.all, rawName);
    const allMonthly = getMyMonthlyData(dm.all, null);
    const mineCount  = monthly.values.reduce((s, v) => s + v, 0);
    return { ...dm, minTs, maxTs, lastMsg, monthly, allMonthly, mineCount };
  }), [data.allMessages, rawName]);

  // Open conversation triggered from Search
  useEffect(() => {
    if (!pendingConvo || !enriched.length) return;
    const found = enriched.find(d => d.username === pendingConvo.name || d.name === pendingConvo.name);
    if (found) {
      setSelectedConvo({ dm: found, highlightTerm: pendingConvo.term ?? null });
      onPendingConvoHandled?.();
    }
  }, [pendingConvo, enriched, onPendingConvoHandled]);

  const sorted = useMemo(() => {
    let list = [...enriched];
    if (!showGroups)   list = list.filter(d => d.participantsCount <= 2);
    if (hideIgUsers)   list = list.filter(d => d.username.toLowerCase() !== 'instagram user');
    if (search)        list = list.filter(d => d.username.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'msgs')   list.sort((a, b) => b.count - a.count);
    if (sort === 'recent') list.sort((a, b) => b.maxTs - a.maxTs);
    if (sort === 'oldest') list.sort((a, b) => a.minTs - b.minTs);
    if (sort === 'az')     list.sort((a, b) => a.username.localeCompare(b.username));
    return list;
  }, [enriched, search, sort, showGroups, hideIgUsers]);

  if (selectedConvo) {
    return (
      <ConvoDetail
        dm={selectedConvo.dm}
        rawName={rawName}
        highlightTerm={selectedConvo.highlightTerm}
        onClose={() => setSelectedConvo(null)}
      />
    );
  }

  const sortBtns = [
    { key: 'msgs', label: 'MSGS' },
    { key: 'recent', label: 'RECENT' },
    { key: 'az', label: 'A-Z' },
    { key: 'oldest', label: 'OLDEST' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Messages</h1>
        <p className="text-gray-300 text-sm mt-1 font-inter">
          {conversations.toLocaleString()} conversations · {fmt(totalAllMessages)} messages
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter conversations..."
          className="bg-[#ffffff0d] border border-[#ffffff15] rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-[#ffffff30] w-full sm:w-64"
        />
        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <div className="flex items-center bg-[#ffffff0d] rounded-lg p-0.5 gap-0.5">
            <button onClick={() => setShowAll(false)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${!showAll ? 'bg-[#6366f1] text-white' : 'text-gray-300 hover:text-gray-300'}`}>
              Mine
            </button>
            <button onClick={() => setShowAll(true)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${showAll ? 'bg-[#6366f1] text-white' : 'text-gray-300 hover:text-gray-300'}`}>
              Total
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-gray-400">Groups</span>
            <div onClick={() => setShowGroups(g => !g)}
              className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${showGroups ? 'bg-[#6366f1]' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${showGroups ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-gray-400">IG Users</span>
            <div onClick={() => setHideIgUsers(h => !h)}
              className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${!hideIgUsers ? 'bg-[#6366f1]' : 'bg-white/10'}`}>
              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${!hideIgUsers ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </div>
          </label>

          <div className="w-px h-4 bg-white/10" />

          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="appearance-none bg-[#ffffff0d] border border-[#ffffff15] text-gray-300 text-xs font-bold rounded-lg pl-3 pr-7 py-1.5 outline-none cursor-pointer hover:bg-[#ffffff18] transition-colors">
              {sortBtns.map(({ key, label }) => (
                <option key={key} value={key} className="bg-[#1a1a2e] text-gray-200">{label}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {sorted.map((dm, i) => (
          <div key={dm.name} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 220px' }}>
            <ConvoCard
              dm={dm}
              idx={i}
              showAll={showAll}
              onClick={() => setSelectedConvo({ dm, highlightTerm: null })}
            />
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="col-span-full text-gray-400 text-sm text-center py-12">No conversations found</p>
        )}
      </div>
    </div>
  );
}
