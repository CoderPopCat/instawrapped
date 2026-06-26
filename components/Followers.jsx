import { useState, useEffect } from 'react';

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Avatar({ username }) {
  const initial = (username?.[0] ?? '?').toUpperCase();
  const colors = ['#405de6', '#833ab4', '#e1306c', '#fd1d1d', '#fcaf45', '#0066ff', '#2ecc71'];
  const color = colors[initial.charCodeAt(0) % colors.length];
  return (
    <div
      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
      style={{ background: color }}
    >
      {initial}
    </div>
  );
}

function FollowerGrowthChart({ followersList }) {
  const [hover, setHover] = useState(null);

  const followsByMonth = {};
  for (const f of followersList) {
    if (!f.timestamp) continue;
    const d = new Date(f.timestamp * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    followsByMonth[key] = (followsByMonth[key] || 0) + 1;
  }

  if (Object.keys(followsByMonth).length === 0) return null;

  const sortedKeys = Object.keys(followsByMonth).sort();
  const filledKeys = [];
  let [fy, fm] = sortedKeys[0].split('-').map(Number);
  const [ey, em] = sortedKeys.at(-1).split('-').map(Number);
  while (fy < ey || (fy === ey && fm <= em)) {
    filledKeys.push(`${fy}-${String(fm).padStart(2, '0')}`);
    fm++; if (fm > 12) { fm = 1; fy++; }
  }

  const monthly = filledKeys.map(key => ({ key, gains: followsByMonth[key] || 0 }));
  const maxGain = Math.max(...monthly.map(m => m.gains), 1);

  const W = 600, chartH = 120, labelH = 16, H = chartH + labelH, P = 4, AXIS = 36;
  const iW = W - P * 2 - AXIS;
  const iH = chartH - P * 2;
  const baselineY = P + iH;

  const n = monthly.length;
  const gap = iW / Math.max(n, 1);
  const barW = Math.max(1, gap * 0.72);
  const barX = i => AXIS + P + i * gap + (gap - barW) / 2;

  const fmt = v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v);

  const yTicks = [0.5, 1].map(f => ({ v: Math.round(maxGain * f), y: P + iH - f * iH }));

  // Center each year label within its bars, skip only if truly overlapping
  const yearGroups = {};
  monthly.forEach((m, i) => {
    const yr = m.key.slice(0, 4);
    (yearGroups[yr] ??= []).push(i);
  });
  const yearLabels = [];
  let lastLabelX = -Infinity;
  for (const yr of Object.keys(yearGroups).sort()) {
    const indices = yearGroups[yr];
    const midI = indices[Math.floor(indices.length / 2)];
    const x = barX(midI) + barW / 2;
    if (x - lastLabelX >= 30) { yearLabels.push({ x, yr }); lastLabelX = x; }
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) / rect.width * W;
    const i = Math.floor((svgX - AXIS - P) / gap);
    if (i < 0 || i >= monthly.length) { setHover(null); return; }
    setHover({ i, x: barX(i) + barW / 2, data: monthly[i] });
  };

  const TIP_W = 118;

  return (
    <div className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg flex justify-start">
      <div className="stats-content m-3 text-left w-full">
        <h2 className="text-[1.65rem]">Follower Growth</h2>
        <p className="text-gray-500 text-xs mb-4 -mt-1.5 font-inter">
          Monthly gained followers
        </p>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ minWidth: 320, cursor: 'pointer' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHover(null)}
          >
            {yTicks.map(({ v, y }) => (
              <g key={v}>
                <line x1={AXIS + P} y1={y} x2={AXIS + P + iW} y2={y} stroke="#ffffff08" strokeWidth="1" />
                <text x={AXIS - 2} y={y + 3.5} textAnchor="end" fill="#4b5563" fontSize="9" fontFamily="Inter, sans-serif">{fmt(v)}</text>
              </g>
            ))}

            {monthly.map((m, i) => {
              const x = barX(i);
              const h = (m.gains / maxGain) * iH;
              return m.gains > 0 ? (
                <rect key={m.key} x={x} y={baselineY - h} width={barW} height={h}
                  fill={hover?.i === i ? '#60a5fa' : '#0066ff'} opacity="0.85" rx="1" />
              ) : null;
            })}

            {yearLabels.map(({ x, yr }) => (
              <g key={yr}>
                <line x1={x} y1={P + iH} x2={x} y2={P + iH + 4} stroke="#374151" strokeWidth="1" />
                <text x={x} y={H - 2} textAnchor="middle" fill="#4b5563" fontSize="9" fontFamily="Inter, sans-serif">{yr}</text>
              </g>
            ))}

            {hover && (() => {
              const m = hover.data;
              const tipH = 30;
              const tipX = Math.min(hover.x + 6, W - TIP_W - 4);
              const barH = (m.gains / maxGain) * iH;
              const tipY = Math.max(P, baselineY - barH - tipH - 4);
              const [yr, mo] = m.key.split('-');
              const label = new Date(+yr, +mo - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
              return (
                <g>
                  <line x1={hover.x} y1={P} x2={hover.x} y2={P + iH} stroke="#ffffff18" strokeWidth="1" strokeDasharray="3 2" />
                  <rect x={tipX} y={tipY} width={TIP_W} height={tipH} rx={3} fill="#1a1f2e" stroke="#ffffff15" strokeWidth="1" />
                  <text x={tipX + 6} y={tipY + 10} fill="#6b7280" fontSize="7.5" fontFamily="Inter, sans-serif">{label}</text>
                  <text x={tipX + 6} y={tipY + 22} fill="#60a5fa" fontSize="8.5" fontFamily="Inter, sans-serif" fontWeight="600">
                    +{m.gains} new followers
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}

function UserList({ title, count, items, searchPlaceholder, showDate }) {
  const [query, setQuery] = useState('');
  const safeItems = items ?? [];
  const filtered = query
    ? safeItems.filter(i => (typeof i === 'string' ? i : i.username).toLowerCase().includes(query.toLowerCase()))
    : safeItems;

  return (
    <div className="stats-box px-3 sm:px-4 py-2 bg-[#ffffff0d] rounded-lg flex flex-col" style={{ minHeight: 300 }}>
      <div className="stats-content m-3 text-left flex flex-col gap-3 h-full">
        <h2 className="text-[1.65rem] tracking-normal">{title} <span className="text-gray-500 text-xl">({count.toLocaleString()})</span></h2>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-[#ffffff0d] border border-[#ffffff15] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-[#ffffff30]"
        />
        <div className="flex flex-col gap-1 overflow-y-auto max-h-96 pr-1 scrollbar-subtle">
          {filtered.map((item, i) => {
            const username = typeof item === 'string' ? item : item.username;
            const ts = typeof item === 'string' ? null : item.timestamp;
            return (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#ffffff0d] transition-colors">
                <div className="flex items-center gap-2">
                  <Avatar username={username} />
                  <span className="text-gray-300 text-sm">@{username}</span>
                </div>
                {showDate && ts && (
                  <span className="text-gray-400 text-xs ml-4 flex-shrink-0">{fmtDate(ts)}</span>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm py-4 text-center">No results</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SimpleList({ title, titleColor, items }) {
  return (
    <div className="stats-box px-3 sm:px-4 py-2 bg-[#ffffff0d] rounded-lg flex flex-col" style={{ minHeight: 300 }}>
      <div className="stats-content m-3 text-left flex flex-col gap-3">
        <h2 className="text-[1.4rem] tracking-normal text-white">
          {title} <span className="text-gray-500 text-lg font-inter">({items.length.toLocaleString()})</span>
        </h2>
        <div className="flex flex-col gap-1 overflow-y-auto max-h-96 pr-1 scrollbar-subtle">
          {items.map((username, i) => (
            <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-[#ffffff0d] transition-colors">
              <Avatar username={username} />
              <span className="text-gray-300 text-sm">@{username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Followers({ data }) {
  const ratio = data.following > 0 ? (data.followers / data.following).toFixed(2) : '—';

  return (
    <div className="flex flex-col gap-3">

      {/* Page heading */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-3xl sm:text-4xl font-medium text-white font-trial tracking-wide">Followers & Following</h1>
        <p className="text-gray-500 text-sm mt-1 font-inter">
          {data.followers.toLocaleString()} followers · {data.following.toLocaleString()} following
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:mt-4 mt-2">
        {[
          { label: 'Followers', value: data.followers.toLocaleString() },
          { label: 'Following', value: data.following.toLocaleString() },
          { label: 'Mutual',    value: data.mutual.toLocaleString() },
          { label: 'Ratio',     value: ratio },
        ].map(({ label, value }) => (
          <div key={label} className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
            <div className="stats-content m-3 text-left">
              <h2 className="text-[1.65rem]">{label}</h2>
              <div className="mt-3">
                <h3 className="text-2xl text-gray-300 font-medium">{value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* First follower */}
      {data.firstFollower && (
        <div className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg flex justify-start lg:mt-0 mt-1">
          <div className="stats-content m-3 text-left">
            <h2 className="text-[1.65rem]">First Follower</h2>
            <div className="mt-3 flex items-center gap-2">
              <Avatar username={data.firstFollower} />
              <h3 className="text-2xl text-gray-300 font-medium">@{data.firstFollower}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Follower growth chart */}
      <FollowerGrowthChart followersList={data.followersList ?? []} />

      {/* Followers + Following lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:mt-4 mt-2">
        <UserList
          title="Followers"
          count={data.followers}
          items={data.followersList ?? []}
          searchPlaceholder="Search followers..."
          showDate
        />
        <UserList
          title="Following"
          count={data.following}
          items={data.followingList ?? []}
          searchPlaceholder="Search following..."
          showDate
        />
      </div>

      {/* Not following back + not followed back */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
        <SimpleList
          title="You follow, they don't follow back"
          titleColor="#f59e0b"
          items={data.notFollowingBack ?? []}
        />
        <SimpleList
          title="They follow you, you don't follow back"
          titleColor="#22c55e"
          items={data.notFollowedBack ?? []}
        />
      </div>

      {/* Recently unfollowed */}
      {data.unfollowed?.length > 0 && (
        <div className="mt-2">
          <UserList
            title="Recently Unfollowed"
            count={data.unfollowed.length}
            items={data.unfollowed.map(u => ({ username: u.username, timestamp: u.time }))}
            searchPlaceholder="Search unfollowed..."
            showDate
          />
        </div>
      )}

    </div>
  );
}
