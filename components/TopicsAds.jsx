'use client';

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function PillList({ items, color = '#0066ff' }) {
  if (!items?.length) return <p className="text-gray-400 text-sm py-2">No data found.</p>;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((item, i) => (
        <span key={i}
          className="px-3 py-1 rounded-full text-xs font-medium cursor-default"
          style={{ color, background: color + '1a', border: `1px solid ${color}33` }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 bg-[#ffffff0d] rounded-lg">
      <span className="text-[10px] uppercase tracking-widest font-semibold font-inter" style={{ color: '#6b7280' }}>{label}</span>
      <span className="text-white font-bold text-base leading-tight">{value}</span>
      {sub && <span className="text-[11px] font-inter" style={{ color: '#6b7280' }}>{sub}</span>}
    </div>
  );
}

export function TopicsAds({ data }) {
  const adsViewed        = data?.adsViewed        ?? [];
  const advertisers      = data?.advertisers      ?? [];
  const metaCategories   = data?.metaCategories   ?? [];
  const locationsInterest = data?.locationsInterest ?? [];
  const offMetaTrackers  = data?.offMetaTrackers  ?? [];
  const { optedOutOfMetaAds, phoneOnFile, basedIn } = data ?? {};

  return (
    <div className="flex flex-col gap-4">

      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Topics &amp; Ads</h1>
        <p className="text-gray-500 text-sm mt-1 font-inter">
          {advertisers.length} advertisers · {offMetaTrackers.length} off-Instagram trackers · {adsViewed.length} ads seen
        </p>
      </div>

      {/* Privacy stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          label="Based in"
          value={basedIn?.city ?? basedIn?.region ?? basedIn?.country ?? '—'}
          sub={basedIn?.country ?? undefined}
        />
        <StatCard
          label="Opted out of Meta ads"
          value={optedOutOfMetaAds == null ? '—' : optedOutOfMetaAds ? 'Yes' : 'No'}
          sub={optedOutOfMetaAds ? undefined : 'Meta still shows you ads about Meta'}
        />
      </div>

      {/* How Meta categorizes you */}
      <div className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg">
        <div className="stats-content m-3 text-left w-full">
          <h2 className="text-[1.65rem]">How Meta Categorizes You <span className="text-gray-500 text-sm font-inter">({metaCategories.length})</span></h2>
          <p className="text-gray-500 text-xs -mt-1 mb-1 font-inter">Inferred demographics used to target you with ads</p>
          <PillList items={metaCategories} color="#a855f7" />
        </div>
      </div>

      {/* Locations of interest */}
      <div className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg">
        <div className="stats-content m-3 text-left w-full">
          <h2 className="text-[1.65rem]">Locations of Interest <span className="text-gray-500 text-sm font-inter">({locationsInterest.length})</span></h2>
          <p className="text-gray-500 text-xs -mt-1 mb-1 font-inter">Locations Instagram associates with you for ad targeting</p>
          <PillList items={locationsInterest} color="#06b6d4" />
        </div>
      </div>

      {/* Off-Instagram tracking */}
      <div className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg">
        <div className="stats-content m-3 text-left w-full">
          <h2 className="text-[1.65rem]">Off-Instagram Tracking <span className="text-gray-500 text-sm font-inter">({offMetaTrackers.length} sites)</span></h2>
          <p className="text-gray-500 text-xs -mt-1 mb-1 font-inter">Apps and websites that reported your activity to Meta</p>
          <div className="mt-3 max-h-[360px] overflow-y-auto scrollbar-subtle">
            {offMetaTrackers.length > 0
              ? offMetaTrackers.map((site, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] last:border-0">
                    <span className="text-gray-300 text-sm">{site.title}</span>
                    <span className="text-gray-500 text-xs tabular-nums">{site.events} event{site.events !== 1 ? 's' : ''}</span>
                  </div>
                ))
              : <p className="text-gray-400 text-sm py-2">No data found.</p>
            }
          </div>
        </div>
      </div>

      {/* Advertisers tracking you */}
      <div className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg">
        <div className="stats-content m-3 text-left w-full">
          <h2 className="text-[1.65rem]">Advertisers Tracking You <span className="text-gray-500 text-sm font-inter">({advertisers.length})</span></h2>
          <p className="text-gray-500 text-xs -mt-1 mb-1 font-inter">Advertisers that uploaded an audience list matched to your profile</p>
          <div className="mt-3 max-h-[400px] overflow-y-auto scrollbar-subtle">
            {advertisers.length > 0
              ? advertisers.map((name, i) => (
                  <div key={i} className="px-3 py-1.5 border-b border-white/[0.06] last:border-0">
                    <span className="text-gray-300 text-sm">{name}</span>
                  </div>
                ))
              : <p className="text-gray-400 text-sm py-2">No advertiser data found.</p>
            }
          </div>
        </div>
      </div>

      {/* Ads viewed */}
      <div className="stats-box px-4 py-2 bg-[#ffffff0d] rounded-lg">
        <div className="stats-content m-3 text-left w-full">
          <h2 className="text-[1.65rem] leading-snug">Ads Viewed <span className="text-gray-500 text-sm font-inter">({adsViewed.length} total, first 200)</span></h2>
          <div className="mt-3 max-h-[500px] overflow-y-auto scrollbar-subtle">
            {adsViewed.length > 0
              ? adsViewed.slice(0, 200).map((ad, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] last:border-0">
                    <span className="text-gray-300 text-sm">@{ad.author}</span>
                    <span className="text-gray-500 text-xs tabular-nums">{fmtDate(ad.timestamp)}</span>
                  </div>
                ))
              : <p className="text-gray-400 text-sm py-2">No ad data found.</p>
            }
          </div>
        </div>
      </div>

    </div>
  );
}
