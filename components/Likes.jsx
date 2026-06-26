import { useState, useRef, useCallback, useEffect } from 'react';

function useListHeight(offset = 290, min = 420) {
  const [h, setH] = useState(min);
  useEffect(() => {
    const calc = () => setH(Math.max(min, window.innerHeight - offset));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [offset, min]);
  return h;
}

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#ffffff0d] border border-[#ffffff15] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-[#ffffff30]"
    />
  );
}

const ITEM_H = 44;
const OVERSCAN = 8;

function VirtualList({ items, renderRow, height }) {
  const [scrollTop, setScrollTop] = useState(0);
  const onScroll = useCallback(e => setScrollTop(e.currentTarget.scrollTop), []);

  const visStart = Math.max(0, Math.floor(scrollTop / ITEM_H) - OVERSCAN);
  const visEnd   = Math.min(items.length - 1, Math.ceil((scrollTop + height) / ITEM_H) + OVERSCAN);

  return (
    <div
      style={{ height, overflowY: 'auto' }}
      onScroll={onScroll}
      className="scrollbar-subtle"
    >
      <div style={{ height: items.length * ITEM_H, position: 'relative' }}>
        {items.slice(visStart, visEnd + 1).map((item, i) => (
          <div key={visStart + i} style={{ position: 'absolute', top: (visStart + i) * ITEM_H, width: '100%', height: ITEM_H }}>
            {renderRow(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Items with { title, string_list_data: [{ href?, timestamp }] }
function TitleSdList({ items, showLink = true }) {
  const [query, setQuery] = useState('');
  const listHeight = useListHeight();
  const safe = items ?? [];
  const filtered = query
    ? safe.filter(p => p.title?.toLowerCase().includes(query.toLowerCase()))
    : safe;

  return (
    <div className="stats-box px-4 py-4 bg-[#ffffff0d] rounded-lg flex flex-col gap-3">
      <SearchInput value={query} onChange={setQuery} placeholder="Search by account..." />
      {filtered.length === 0
        ? <p className="text-gray-400 text-sm py-6 text-center">No results</p>
        : (
          <VirtualList
            items={filtered}
            height={listHeight}
            renderRow={item => {
              const sl = item.string_list_data?.[0] ?? {};
              return (
                <div className="flex items-center h-full border-b border-white/[0.06] hover:bg-white/[0.04] px-3 gap-3 transition-colors">
                  <span className="text-[#e1306c] text-sm font-medium flex-1 min-w-0 truncate">@{item.title}</span>
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <span className="text-gray-400 text-xs tabular-nums">{fmtDate(sl.timestamp)}</span>
                    {showLink && sl.href
                      ? <a href={sl.href} target="_blank" rel="noreferrer" className="text-[#06f] text-sm hover:underline w-14 text-right">View ↗</a>
                      : <span className="w-14" />
                    }
                  </div>
                </div>
              );
            }}
          />
        )
      }
    </div>
  );
}

function AccountLeaderboard({ title, accounts }) {
  return (
    <div className="stats-box lg:mx-0 lg:mt-4 mt-6 px-4 py-2 bg-[#ffffff0d] rounded-lg relative group flex justify-start h-max">
      <div className="stats-content w-full m-3 text-left">
        <h2 className="text-[1.65rem]">{title}</h2>
        <div className="mt-3 leaderboard flex flex-col gap-[0.7rem]">
          {accounts.map((acc, i) => (
            <div key={i} className="leaderboard-item transition-all duration-75 cursor-pointer hover:bg-[#ffffff0d] hover:px-3 rounded-lg flex justify-between w-full items-center">
              <div className={`mr-2 sm:mr-3 user-position p-3 sm:p-4 flex justify-center items-center text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ${i === 0 ? 'bg-[#da9e3b]' : i === 1 ? 'bg-[#989898]' : i === 2 ? 'bg-[#ae7458]' : 'bg-[#ffffff0d]'}`}>{i + 1}</div>
              <div className="user-name text-lg sm:text-2xl flex leaderboard-pain w-full justify-between items-center gap-2 min-w-0">
                <span className="lbuser font-semibold truncate min-w-0 flex-1" style={{ lineBreak: 'anywhere' }}>{acc.username}</span>
                <div className="flex flex-col justify-start text-right">
                  <span className="text-[14px] lg:text-[19px] flex items-center flex-row justify-between gap-1 text-right text-white">{acc.count.toLocaleString()} likes <i className="ml-2 fas fa-heart" /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Likes({ data }) {
  const [tab, setTab] = useState('posts');
  const totalLikes = (data.likedPosts?.length ?? 0) + (data.likedStories ?? 0);

  const tabs = [
    { id: 'posts',         label: `Liked Posts (${fmt(data.likedPosts?.length)})` },
    { id: 'likedcomments', label: `Liked Comments (${fmt(data.likedComments?.length)})` },
    { id: 'stories',       label: `Liked Stories (${fmt(data.likedStories)})` },
    { id: 'analytics',     label: 'Analytics' },
  ];

  return (
    <div className="flex flex-col gap-4">

      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Likes & Comments</h1>
        <p className="text-gray-500 text-sm mt-1 font-inter">
          {fmt(totalLikes)} likes · {fmt(data.commentsPosted)} comments posted
        </p>
      </div>

      <div className="flex gap-0 border-b border-white/10 overflow-x-auto scrollbar-subtle">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer bg-transparent whitespace-nowrap flex-shrink-0 ${
              tab === t.id
                ? 'border-[#e1306c] text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-1">
        {tab === 'posts'         && <TitleSdList items={data.likedPosts} />}
        {tab === 'likedcomments' && <TitleSdList items={data.likedComments} />}
        {tab === 'stories'       && <TitleSdList items={data.likedStoriesList ?? []} showLink={false} />}
        {tab === 'analytics' && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-7 lg:items-start">
            <div className="lg:w-1/2">
              <AccountLeaderboard title="Top Liked Post Accounts"  accounts={data.topLikedAccounts ?? []} />
            </div>
            <div className="lg:w-1/2">
              <AccountLeaderboard title="Top Liked Story Accounts" accounts={data.topLikedStoryAccounts ?? []} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
