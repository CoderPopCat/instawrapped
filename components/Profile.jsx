function fmtDate(ts) {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Row({ label, value }) {
  if (!value) return null;
  const isUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
  return (
    <div className="flex flex-col sm:flex-row py-3 border-b border-white/5 gap-0.5 sm:gap-6">
      <span className="text-gray-500 text-xs sm:text-sm sm:w-40 sm:flex-shrink-0">{label}</span>
      {isUrl ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-[#06f] text-sm break-all hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-gray-200 text-sm whitespace-pre-line">{value}</span>
      )}
    </div>
  );
}

export function Profile({ data }) {
  const joinedDate = data.dateJoined ? fmtDate(data.dateJoined) : null;

  return (
    <div className="flex flex-col gap-4">

      {/* Page heading */}
      <div className="pb-4 border-b border-white/10">
        <h1 className="text-4xl font-medium text-white font-trial tracking-wide">Profile</h1>
        <p className="text-gray-500 text-sm mt-1 font-inter">Your account information</p>
      </div>

      {/* Profile hero card */}
      <div className="stats-box px-4 sm:px-6 py-5 bg-[#ffffff0d] rounded-lg flex items-center gap-4 sm:gap-5 flex-wrap">
        <img
          src={data.pfpUrl}
          alt={data.name}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex flex-col gap-0.5">
          <h2 className="text-2xl font-bold text-white tracking-normal">{data.name}</h2>
          <p className="text-gray-400 text-sm">@{data.username}</p>
          {joinedDate && (
            <p className="text-gray-500 text-sm mt-1">
              Joined <span className="text-white font-semibold">{joinedDate}</span>
            </p>
          )}
        </div>
      </div>

      {/* Account info table */}
      <div className="stats-box px-6 py-2 bg-[#ffffff0d] rounded-lg">
        <p className="text-[11px] text-gray-500 font-bold tracking-[0.12em] pt-4 pb-2">ACCOUNT INFORMATION</p>
        <Row label="Username"        value={`@${data.username}`} />
        <Row label="Display Name"    value={data.name} />
        <Row label="Email"           value={data.email} />
        <Row label="Date of Birth"   value={data.dateOfBirth} />
        <Row label="Gender"          value={data.gender} />
        <Row label="Website"         value={data.website} />
        <Row label="Private Account"   value={data.privateAccount != null ? String(data.privateAccount) : null} />
        <Row label="Account Created"  value={data.dateJoined ? fmtDate(data.dateJoined) : null} />
        <Row label="Bio"              value={data.bio} />
        <Row label="Emoji Pong Score" value={data.emojiPong != null ? String(data.emojiPong) : null} />
      </div>

    </div>
  );
}
