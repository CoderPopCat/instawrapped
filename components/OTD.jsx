'use client';

import { useState } from 'react';

function decode(s) {
  try { return decodeURIComponent(escape(s)); } catch { return s; }
}

function fmtTime(ms) {
  return new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const PREVIEW = 6;

// accent per section type
const ACCENTS = {
  messages: '#06f',
  liked:    '#818cf8',
  comments: '#22d3ee',
};

function MessageConvCard({ cd }) {
  const [expanded, setExpanded] = useState(false);
  const { conv, msgs } = cd;
  const isGroup = conv.participantsCount > 2;
  const shown = expanded ? msgs : msgs.slice(0, PREVIEW);
  const extra = msgs.length - PREVIEW;

  const header = conv.username;

  return (
    <div className="bg-[#ffffff08] border border-white/[0.07] rounded-lg p-4">
      <p className="text-[#60a5fa] text-[11px] font-semibold tracking-wider uppercase mb-2 leading-relaxed">
        {header}
      </p>
      <div className="flex flex-col">
        {shown.map((msg, i) => {
          const isMe = msg.sender_name === conv.participantName;
          return (
            <div key={i} className="flex justify-between items-start py-[5px] border-b border-white/[0.04] last:border-0 gap-4">
              <div className="flex gap-2 flex-1 min-w-0">
                <span className={`text-sm font-semibold flex-shrink-0 ${isMe ? 'text-[#06f]' : 'text-white'}`}>
                  {isMe ? 'You' : decode(msg.sender_name)}:
                </span>
                <span className="text-gray-400 text-sm break-words min-w-0">{msg.content ? decode(msg.content) : '(media)'}</span>
              </div>
              <span className="text-gray-500 text-xs flex-shrink-0 tabular-nums pt-[2px]">{fmtTime(msg.timestamp_ms)}</span>
            </div>
          );
        })}
        {!expanded && extra > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-gray-400 text-xs pt-3 text-left hover:text-gray-400 cursor-pointer bg-transparent border-0"
          >
            +{extra} more in this conversation
          </button>
        )}
      </div>
    </div>
  );
}

function SectionCard({ type, label, children }) {
  const accent = ACCENTS[type];
  return (
    <div className="stats-box px-3 sm:px-5 py-4 bg-[#ffffff0d] border border-white/10 rounded-lg flex flex-col gap-4">
      <p className="text-xs font-semibold tracking-widest uppercase flex items-center gap-2" style={{ color: accent }}>
        <span className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: accent }} />
        {label}
      </p>
      {children}
    </div>
  );
}

export function OTD({ data }) {
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const dateLabel = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const isOTD = (ms) => {
    const d = new Date(ms);
    return d.getMonth() === todayMonth && d.getDate() === todayDay;
  };

  // Messages grouped: year -> Map(conv.name -> { conv, msgs[] })
  const msgByYear = {};
  for (const conv of data.allMessages ?? []) {
    const todayMsgs = (conv.all ?? []).filter(m => isOTD(m.timestamp_ms));
    if (!todayMsgs.length) continue;
    for (const msg of todayMsgs) {
      const yr = new Date(msg.timestamp_ms).getFullYear();
      if (!msgByYear[yr]) msgByYear[yr] = new Map();
      if (!msgByYear[yr].has(conv.name)) msgByYear[yr].set(conv.name, { conv, msgs: [] });
      msgByYear[yr].get(conv.name).msgs.push(msg);
    }
  }
  for (const yearMap of Object.values(msgByYear)) {
    for (const cd of yearMap.values()) {
      cd.msgs.sort((a, b) => a.timestamp_ms - b.timestamp_ms);
    }
  }

  // Liked posts by year
  const likedByYear = {};
  for (const post of data.likedPosts ?? []) {
    const ts = post.string_list_data?.[0]?.timestamp;
    if (!ts || !isOTD(ts * 1000)) continue;
    const yr = new Date(ts * 1000).getFullYear();
    if (!likedByYear[yr]) likedByYear[yr] = [];
    likedByYear[yr].push(post);
  }

  // Comments posted by year
  const commentsByYear = {};
  for (const c of data.commentsList ?? []) {
    const ts = c.string_list_data?.[0]?.timestamp ?? c.string_map_data?.['Time']?.timestamp;
    if (!ts || !isOTD(ts * 1000)) continue;
    const yr = new Date(ts * 1000).getFullYear();
    if (!commentsByYear[yr]) commentsByYear[yr] = [];
    commentsByYear[yr].push(c);
  }

  const allYears = [...new Set([
    ...Object.keys(msgByYear),
    ...Object.keys(likedByYear),
    ...Object.keys(commentsByYear),
  ])].map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-4">
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">On This Day</h1>
        <p className="text-gray-500 text-sm mt-1 font-inter">{dateLabel} · across all years</p>
      </div>

      {allYears.length === 0 && (
        <p className="text-gray-400 text-sm py-16 text-center">Nothing recorded for {dateLabel}</p>
      )}

      {allYears.map(yr => {
        const convs = msgByYear[yr] ? [...msgByYear[yr].values()] : [];
        const liked = likedByYear[yr] ?? [];
        const comments = commentsByYear[yr] ?? [];
        const totalMsgs = convs.reduce((s, cd) => s + cd.msgs.length, 0);
        const activities = totalMsgs + liked.length + comments.length;

        return (
          <div key={yr} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3 mt-4 sm:mt-6">
              <span className="text-white text-4xl sm:text-5xl font-black">{yr}</span>
              <span className="text-gray-500 text-sm">{activities} {activities === 1 ? 'activity' : 'activities'}</span>
            </div>
            <div className="border-b border-white/10" />

            {convs.length > 0 && (
              <SectionCard type="messages" label={`Messages — ${totalMsgs} across ${convs.length} conversation${convs.length !== 1 ? 's' : ''}`}>
                {convs.map((cd, i) => <MessageConvCard key={i} cd={cd} />)}
              </SectionCard>
            )}

            {liked.length > 0 && (
              <SectionCard type="liked" label={`Liked Posts — ${liked.length}`}>
                <div className="flex flex-col">
                  {liked.map((post, i) => {
                    const sl = post.string_list_data?.[0] ?? {};
                    return (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0 hover:bg-[#ffffff0d] rounded px-2 -mx-2 transition-colors">
                        <span className="text-gray-300 text-sm">@{post.title}</span>
                        {sl.href && (
                          <a href={sl.href} target="_blank" rel="noreferrer" className="text-[#818cf8] text-sm hover:underline flex-shrink-0">
                            View ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {comments.length > 0 && (
              <SectionCard type="comments" label={`Comments Made — ${comments.length}`}>
                <div className="flex flex-col">
                  {comments.map((c, i) => {
                    const sl = c.string_list_data?.[0] ?? {};
                    const text = sl.value ?? c.string_map_data?.['Comment']?.value ?? '';
                    const target = c.title ?? c.string_map_data?.['Media Owner']?.value ?? '';
                    const ts = sl.timestamp ?? c.string_map_data?.['Time']?.timestamp;
                    return (
                      <div key={i} className="flex justify-between items-start py-2 border-b border-white/[0.04] last:border-0 gap-4">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          {target && <span className="text-[#22d3ee] text-xs font-semibold">@{target}</span>}
                          <span className="text-gray-400 text-sm">{text}</span>
                        </div>
                        <span className="text-gray-500 text-xs flex-shrink-0 tabular-nums">
                          {ts ? new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </div>
        );
      })}
    </div>
  );
}
