'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
function formatCount(n) {
  if (n == null) return null;
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

const DASHBOARD_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
  { id: 'onthisday', label: 'On This Day', icon: 'fa-calendar-days' },
];

const ACCOUNT_ITEMS = [
  { id: 'profile',   label: 'Profile',   icon: 'fa-user' },
  { id: 'timeline',  label: 'Timeline',  icon: 'fa-timeline' },
  { id: 'topics',    label: 'Topics & Ads', icon: 'fa-tag' },
  { id: 'search',    label: 'Search',    icon: 'fa-magnifying-glass' },
];

export function AppSidebar({ data, activeSection = 'overview', onSectionChange }) {
  const totalLikes = data
    ? (data.likedPosts?.length || 0) + (data.likedStories || 0)
    : null;

  const userName = data?.name ?? data?.allMessages?.find(d => d.participantsCount === 2)?.participantName ?? null;

  const contentItems = [
    { id: 'messages', label: 'Messages', icon: 'fa-comment', count: data?.allMessages?.length ?? null },
    { id: 'followers', label: 'Followers', icon: 'fa-users', count: data?.followers ?? null },
    { id: 'likes', label: 'Likes', icon: 'fa-heart', count: totalLikes },
  ];

  return (
    <Sidebar collapsible="none" className="border-r border-white/10 rounded-tr-[35px] h-svh sticky top-0">
      <SidebarHeader className="p-4 pb-3">
          <span className="cursor-pointer sidebar-head text-center text-3xl"><span className="text-[#06f] font-inter">I</span>nsta<span className="text-[#06f] font-inter">W</span>rapped</span>
      </SidebarHeader>

      <SidebarContent className="px-2 gap-0">
        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="text-[11px] text-gray-500 font-bold tracking-[0.12em] px-3 mb-1">
            DASHBOARD
          </SidebarGroupLabel>
          <SidebarMenu>
            {DASHBOARD_ITEMS.map(({ id, label, icon }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  isActive={activeSection === id}
                  onClick={() => onSectionChange?.(id)}
                  className="text-gray-400 data-active:text-[#e1306c]"
                >
                  <i className={`fa-regular text-[#06f] ${icon} w-4 text-center`} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="text-[11px] text-gray-500 font-bold tracking-[0.12em] px-3 mb-1">
            CONTENT
          </SidebarGroupLabel>
          <SidebarMenu>
            {contentItems.map(({ id, label, icon, count }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  isActive={activeSection === id}
                  onClick={() => onSectionChange?.(id)}
                  className="text-gray-400 data-active:text-[#06f]"
                >
                  <i className={`fa-regular text-[#06f] ${icon} w-4 text-center`} />
                  <span>{label}</span>
                </SidebarMenuButton>
                {count != null && (
                  <SidebarMenuBadge className="bg-white/5 text-gray-400 rounded-md text-[11px]">
                    {formatCount(count)}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="text-[11px] text-gray-500 font-bold tracking-[0.12em] px-3 mb-1">
            ACCOUNT
          </SidebarGroupLabel>
          <SidebarMenu>
            {ACCOUNT_ITEMS.map(({ id, label, icon }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  isActive={activeSection === id}
                  onClick={() => onSectionChange?.(id)}
                  className="text-gray-400 data-active:text-[#e1306c]"
                >
                  <i className={`fa-regular text-[#06f] ${icon} w-4 text-center`} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {userName && (
        <SidebarFooter className="p-4 font-monument border-t border-white/10">
          <div className="flex items-center gap-3">
            {data?.pfpUrl ? (
              <img
                src={data.pfpUrl}
                alt={userName}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 font-monument rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #405de6, #833ab4, #e1306c)' }}
              >
                {(data?.username ?? userName)?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold font-monument text-white truncate">{userName}</span>
              {data?.username && (
                <span className="text-xs font-inter text-gray-500 truncate">@{data.username}</span>
              )}
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
