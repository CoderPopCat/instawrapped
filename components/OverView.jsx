import { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CHART_H = 112;

function BarChart({ values, labels, shortLabels, tickEvery = 1, color = '#0066ff', minBarWidth }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t); }, []);
  const max = Math.max(...values, 1);
  const barStyle = minBarWidth ? { minWidth: minBarWidth } : {};
  return (
    <div className="flex flex-col gap-2" style={minBarWidth ? { minWidth: values.length * (minBarWidth + 3) } : {}}>
      <div className="flex items-end gap-[3px]" style={{ height: CHART_H }}>
        {values.map((val, i) => {
          const barH = animated ? Math.max((val / max) * CHART_H, val > 0 ? 2 : 0) : 0;
          return (
            <div key={i} className="flex-1" style={{ height: CHART_H, ...barStyle }}>
              <Tooltip>
                <TooltipTrigger
                  className="w-full h-full flex items-end bg-transparent border-0 p-0 cursor-pointer"
                >
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: barH,
                      background: color,
                      transition: `height 0.6s cubic-bezier(.4,0,.2,1) ${i * 18}ms`,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>{labels[i]}: {val.toLocaleString()}</TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
      <div className="flex gap-[3px]">
        {values.map((_, i) => (
          <div key={i} className="flex-1 text-center" style={barStyle}>
            {i % tickEvery === 0 && (
              <span className="text-[10px] text-gray-400 whitespace-nowrap">{shortLabels[i]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

const MONTH_ORDER = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

function ActivityHeatmap({ popularDayDates, likedPosts, likedComments }) {
  const [tip, setTip] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const wrapperRef = useRef(null);

  const combinedDayDates = useMemo(() => {
    const map = { ...(popularDayDates ?? {}) };
    const addTs = (ts) => {
      if (!ts) return;
      const d = new Date(ts * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + 1;
    };
    for (const p of (likedPosts ?? [])) addTs(p.string_list_data?.[0]?.timestamp);
    for (const c of (likedComments ?? [])) addTs(c.string_list_data?.[0]?.timestamp);
    return map;
  }, [popularDayDates, likedPosts, likedComments]);

  const years = useMemo(() => {
    const ys = new Set(Object.keys(combinedDayDates).map(d => d.slice(0, 4)));
    return [...ys].sort((a, b) => b.localeCompare(a));
  }, [combinedDayDates]);

  if (!years.length) return null;

  const activeYear = selectedYear ?? years[0];

  const CELL = 11, GAP = 2, STEP = CELL + GAP, LABEL_W = 14, MONTH_H = 14;

  // Always show the full selected year (Sun → Sat boundaries)
  const start = new Date(`${activeYear}-01-01T00:00:00`);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(`${activeYear}-12-31T00:00:00`);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const weeks = [];
  const cur = new Date(start);
  while (cur <= end) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      week.push({ key, count: combinedDayDates[key] || 0 });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const yearMax = Math.max(...Object.entries(combinedDayDates).filter(([d]) => d.startsWith(activeYear)).map(([, v]) => v), 1);
  const getColor = count => {
    if (!count) return '#ffffff08';
    const intensity = Math.log(count + 1) / Math.log(yearMax + 1);
    return `rgba(0,102,255,${(0.18 + intensity * 0.82).toFixed(2)})`;
  };

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const d = new Date(start); d.setDate(d.getDate() + wi * 7);
    const mo = d.getMonth();
    if (mo !== lastMonth) {
      monthLabels.push({ wi, text: d.toLocaleString('en-US', { month: 'short' }) });
      lastMonth = mo;
    }
  });

  const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];
  const W = LABEL_W + weeks.length * STEP;
  const H = MONTH_H + 7 * STEP;

  return (
    <div className="stats-box lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg flex justify-start">
      <div className="stats-content m-3 text-left w-full">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[1.65rem]">Activity Heatmap</h2>
            <p className="text-gray-500 text-xs -mt-1.5 font-inter">Daily messages, post likes & comment likes</p>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => { setSelectedYear(yr); setTip(null); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer border-0 ${
                  yr === activeYear ? 'bg-[#0066ff] text-white' : 'bg-[#ffffff0d] text-gray-400 hover:text-gray-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
        <div ref={wrapperRef} style={{ position: 'relative' }} onMouseLeave={() => setTip(null)}>
          <div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
              {DAY_LABELS.map((l, di) => l && (
                <text key={di} x={LABEL_W - 2} y={MONTH_H + di * STEP + CELL - 1} textAnchor="end" fill="#374151" fontSize="8" fontFamily="Inter, sans-serif">{l}</text>
              ))}
              {monthLabels.map(({ wi, text }) => (
                <text key={wi} x={LABEL_W + wi * STEP} y={MONTH_H - 3} fill="#4b5563" fontSize="9" fontFamily="Inter, sans-serif">{text}</text>
              ))}
              {weeks.map((week, wi) =>
                week.map((day, di) => (
                  <rect
                    key={day.key}
                    x={LABEL_W + wi * STEP} y={MONTH_H + di * STEP}
                    width={CELL} height={CELL} rx={2}
                    fill={getColor(day.count)}
                    style={{ cursor: day.count ? 'pointer' : 'default' }}
                    onMouseEnter={(e) => {
                      const r = wrapperRef.current?.getBoundingClientRect();
                      if (!r) return;
                      setTip({ key: day.key, count: day.count, x: e.clientX - r.left, y: e.clientY - r.top });
                    }}
                  />
                ))
              )}
            </svg>
          </div>
          {tip && (
            <div style={{
              position: 'absolute', left: tip.x, top: tip.y - 8,
              transform: 'translate(-50%, -100%)', pointerEvents: 'none',
              background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '5px 9px', whiteSpace: 'nowrap', zIndex: 20,
            }}>
              <div style={{ fontSize: 10, color: '#6b7280', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                {(() => { const [y, m, d] = tip.key.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); })()}
              </div>
              <div style={{ fontSize: 12, color: tip.count ? '#ffffff' : '#4b5563', fontWeight: 600, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                {tip.count ? `${tip.count.toLocaleString()} activit${tip.count !== 1 ? 'ies' : 'y'}` : 'No activity'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ data }) {
  const blur = () => {
    const el = document.querySelector('.topdms');
    if (el) el.style.filter = el.style.filter.includes('blur') ? 'unset' : 'blur(15px)';
  };
  return (
    <div className="stats-box lg:w-[33%] lg:mx-0 lg:mt-4 mt-6 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start h-max">
      <div className="stats-content w-full m-3 text-left">
        <h2 className="text-[1.65rem] cursor-pointer" onClick={blur}>Top DMs</h2>
        <div className="mt-3 leaderboard flex flex-col gap-[0.7rem] topdms">
          {data.topDMS.map((user, i) => (
            <div key={i} className="leaderboard-item transition-all duration-75 cursor-pointer hover:bg-[#ffffff0d] hover:px-3 hover:py-[5px] rounded-lg flex justify-between w-full items-center">
              <div className={`mr-2 sm:mr-3 user-position p-3 sm:p-4 flex justify-center items-center text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ${i === 0 ? 'bg-[#da9e3b]' : i === 1 ? 'bg-[#989898]' : i === 2 ? 'bg-[#ae7458]' : 'bg-[#ffffff0d]'}`}>{i + 1}</div>
              <div className="user-name text-lg sm:text-2xl flex leaderboard-pain w-full justify-between items-center gap-2 min-w-0">
                <span className="lbuser font-semibold truncate min-w-0 flex-1" style={{ lineBreak: 'anywhere' }}>{user.username}</span>
                <div className="flex flex-col justify-start text-right">
                  <span className="text-[14px] lg:text-[19px] flex items-center flex-row justify-between gap-1 text-right text-white">{user.count.toLocaleString()} Total <i className="ml-2 fas fa-message-lines" /></span>
                  <span className="text-[14px] lg:text-[19px] flex items-center flex-row justify-between gap-1 text-right text-white">{user.myMessages.toLocaleString()} By Me <i className="ml-2 fas fa-message-lines" /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export function OverView({ data }) {
  const totalMessages = data.allMessages.reduce((s, d) => s + d.myMessages, 0);
  const totalReceived = data.allMessages.reduce((s, d) => s + d.count, 0) - totalMessages;
  const conversations = data.allMessages.length;

  const monthEntries = Object.entries(data.popularMonths).sort(([a], [b]) => {
    const [am, ay] = a.split('-');
    const [bm, by] = b.split('-');
    return (parseInt(ay) - parseInt(by)) || (MONTH_ORDER[am] - MONTH_ORDER[bm]);
  });

  return (
    <div className="flex flex-col gap-3">

      {/* Page heading */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Overview</h1>
        <p className="text-gray-500 text-sm mt-1 font-inter">
          {fmt(conversations)} conversations · {fmt(totalMessages)} messages sent
        </p>
      </div>

      {/* Profile + words row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-7 -mt-2">

        {/* Profile card */}
        <div className="stats-box lg:w-[33%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
          <div className="names m-3 text-left">
            <h2 className="text-[1.65rem]" style={{ letterSpacing: 'unset' }}>{data.name}</h2>
            <p className="text-xl text-gray-300 mb-3 username-highlight">
              <span className="at">@</span>{data.username}
            </p>
            {data.bio && (
              <div style={{ fontFamily: "sans-serif" }} className="bio pt-3 border-t border-gray-600 text-white whitespace-pre-line text-sm">
                {data.bio}
              </div>
            )}
          </div>
        </div>

        {/* Favorite words */}
        <div className="stats-box lg:w-[67%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
          <div className="stats-content m-3 text-left w-full">
            <h2 className="text-[1.65rem]">Favorite Words</h2>
            <div className="flex justify-start items-center flex-wrap mt-3 gap-2">
              {data.topWords.slice(0, 15).map(({ word, count }) => (
                <Tooltip key={word}>
                  <TooltipTrigger>
                    <span className="inline-block px-4 py-2 lg:px-9 lg:py-3 font-semibold cursor-pointer text-gray-300 backdrop-blur-xl bg-[#ffffff0d] rounded-lg">
                      {word}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Used {count.toLocaleString()} times</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Stats row */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:gap-7">
        <div className="stats-box lg:w-[33%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
          <div className="stats-content m-3 text-left">
            <h2 className="text-[1.65rem]">Total Conversations</h2>
            <div className="mt-3">
              <h3 className="text-2xl text-gray-300 font-medium">{conversations.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="stats-box lg:w-[33%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
          <div className="stats-content m-3 text-left">
            <h2 className="text-[1.65rem]">Messages Sent</h2>
            <div className="mt-3">
              <h3 className="text-2xl text-gray-300 font-medium">{totalMessages.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="stats-box lg:w-[33%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
          <div className="stats-content m-3 text-left">
            <h2 className="text-[1.65rem]">Messages Received</h2>
            <div className="mt-3">
              <h3 className="text-2xl text-gray-300 font-medium">{totalReceived.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-7">

        <div className="stats-box lg:w-[50%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
          <div className="stats-content m-3 text-left w-full">
            <h2 className="text-[1.65rem]">Messages by Hour</h2>
            <p className="text-gray-500 text-xs mb-4 -mt-1.5 font-inter">When you message the most</p>
            <BarChart
              values={Array.from({ length: 24 }, (_, h) => data.popularTimes[h] || 0)}
              labels={Array.from({ length: 24 }, (_, h) => `${h}:00`)}
              shortLabels={Array.from({ length: 24 }, (_, h) => h)}
              tickEvery={6}
              color="#0066ff"
            />
          </div>
        </div>

        <div className="stats-box lg:w-[50%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
          <div className="stats-content m-3 text-left w-full">
            <h2 className="text-[1.65rem]">Messages by Day</h2>
            <p className="text-gray-500 text-xs mb-4 -mt-1.5 font-inter">Your most active days</p>
            <BarChart
              values={DAYS.map(d => data.popularDays[d] || 0)}
              labels={DAYS}
              shortLabels={DAY_SHORT}
              tickEvery={1}
              color="#0066ff"
            />
          </div>
        </div>

      </div>

      {/* Messages by Month */}
      <div className="stats-box lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
        <div className="stats-content m-3 text-left w-full">
          <h2 className="text-[1.65rem]">Messages by Month</h2>
          <p className="text-gray-500 text-xs mb-4 -mt-1.5 font-inter">Your activity over time</p>
          <div className="overflow-x-auto">
            <BarChart
              values={monthEntries.map(([, v]) => v)}
              labels={monthEntries.map(([k]) => k.replace("-", " "))}
              shortLabels={monthEntries.map(([k]) => { const [m, y] = k.split('-'); return `${m} '${y.slice(2)}`; })}
              tickEvery={3}
              color="#0066ff"
              minBarWidth={14}
            />
          </div>
        </div>
      </div>

      {/* Activity heatmap */}
      <ActivityHeatmap popularDayDates={data.popularDayDates} likedPosts={data.likedPosts} likedComments={data.likedComments} />

      {/* Leaderboard + stats grid */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-7 lg:items-start">
        <Leaderboard data={data} />
        <div className="lg:w-[67%] lg:mt-4 mt-2 flex flex-col gap-3">

          {/* Row 1: Liked Posts / Comments / Stories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'glikedposts',    label: 'Posts',    value: data.likedPosts.length },
              { key: 'glikedcomments', label: 'Comments', value: data.likedComments.length },
              { key: 'glikedstories',  label: 'Stories',  value: data.likedStories },
            ].map(({ key, label, value }) => (
              <div key={label} className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
                <div className="stats-content m-3 text-left">
                  <h2
                    className="text-[1.65rem] flex gap-[9px] items-center cursor-pointer"
                    onClick={() => {
                      const el = document.querySelector(`.${key}`);
                      if (el) el.style.filter = el.style.filter.includes('blur') ? 'unset' : 'blur(6px)';
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger><i className="fas fa-heart" /></TooltipTrigger>
                      <TooltipContent>Liked</TooltipContent>
                    </Tooltip>
                    {label}
                  </h2>
                  <div className={`mt-3 ${key}`}>
                    <h3 className="text-2xl text-gray-300 font-medium">{value.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Blocked / Saved / Close Friends */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Blocked',       value: data.blocked },
              { label: 'Saved',         value: data.saved ?? 0 },
              { label: 'Close Friends', value: data.closeFriends },
            ].map(({ label, value }) => (
              <div key={label} className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
                <div className="stats-content m-3 text-left">
                  <h2 className="text-[1.65rem]">{label}</h2>
                  <div className="mt-3">
                    <h3 className="text-2xl text-gray-300 font-medium">{value.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 3: Stories Posted / Comments Posted — 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Stories Posted',  value: data.totalStoriesPosted },
              { label: 'Comments Posted', value: data.commentsPosted },
            ].map(({ label, value }) => (
              <div key={label} className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start">
                <div className="stats-content m-3 text-left">
                  <h2 className="text-[1.65rem]">{label}</h2>
                  <div className="mt-3">
                    <h3 className="text-2xl text-gray-300 font-medium">{value.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 4: Most Active Date / Month / Avg Msgs per Day — 3 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Most Active Date',  value: data.mostActiveDate  ? new Date(data.mostActiveDate + 'T00:00:00').toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—' },
              { label: 'Most Active Month', value: data.mostActiveMonth ?? '—' },
              { label: 'Avg Msgs / Day',    value: data.avgMessagesPerDay?.toLocaleString() ?? '—' },
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

          {/* Row 5: Last PFP Update / Connected Devices / First Story Date — 3 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Last PFP Update',   value: data.lastPfpUpdate ? new Date(data.lastPfpUpdate * 1000).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—' },
              { label: 'First Story Date',  value: data.firstStory    ? new Date(data.firstStory  * 1000).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—' },
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

        </div>
      </div>


    </div>
  );
}
