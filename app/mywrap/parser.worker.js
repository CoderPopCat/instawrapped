const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const IGNORE_WORDS = new Set([
  'the','a','an','this','that','these','those','i','you','he','she','it','we','they',
  'me','him','her','us','them','my','your','his','its','our','their',
  'in','on','at','to','for','with','by','from','up','down','over','under',
  'and','or','but','nor','so','yet',
  'is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','can','could',
  'shall','should','may','might','must',
  'very','really','just','now','then','there','here','only','also',
  'too','about','most','more','some','such',
  'like','lol','omg','tf','fr','u','ur','r','dm','rn','idk','nvm',
  'lmao','tbh','imo','fyi','btw','aka','msg','thx',
  'time','day','today','tomorrow','yesterday','later','soon',
  'post','posted','posting','story','stories','feed','message',
  'sent','received','liked','commented','shared','following','followers',
  'instagram','insta','gram','ig','photo','video','reel','reacted',
]);

self.onmessage = ({ data: { jsonFiles } }) => {
  const progress = (step, pct) => self.postMessage({ type: 'progress', step, pct });

  const keys = Object.keys(jsonFiles);

  // Key index: last path segment -> [full keys] for O(1) average suffix lookup (#3)
  const keysByFilename = new Map();
  for (const key of keys) {
    const seg = key.split('/').pop();
    const arr = keysByFilename.get(seg);
    if (arr) arr.push(key);
    else keysByFilename.set(seg, [key]);
  }

  const findKey = (suffix) => {
    const seg = suffix.split('/').pop();
    const candidates = keysByFilename.get(seg);
    if (candidates) {
      const hit = candidates.find(k => k.endsWith(suffix));
      if (hit) return hit;
    }
    return keys.find(k => k.endsWith(suffix)) ?? null;
  };

  const parseJSON = (suffix) => {
    const key = findKey(suffix);
    if (!key) return null;
    try { return JSON.parse(jsonFiles[key]); }
    catch { return null; }
  };

  const decode = (s) => { try { return decodeURIComponent(escape(s)); } catch { return s; } };

  try {
    progress('Reading your profile...', 16);
    const accountInfo = parseJSON('personal_information/personal_information/personal_information.json');
    const sd = accountInfo.profile_user[0].string_map_data;
    const username = sd["Username"].value;
    const name = decode(sd["Name"].value);
    const bio = decode(sd["Bio"].value);
    const emojiPong = sd["Emoji Pong High Score"]?.value ?? null;
    const pfpPath = accountInfo.profile_user[0].media_map_data["Profile Photo"].uri;
    const email = sd["Email"]?.value ?? null;
    const dateOfBirth = sd["Date of birth"]?.value ?? null;
    const gender = sd["Gender"]?.value ?? null;
    const website = sd["Website"]?.value ?? null;
    const privateAccount = sd["Private Account"]?.value ?? null;
    const rawName = sd["Name"].value;

    const getConvFolders = (type) => {
      const seg = `/messages/${type}/`;
      return [...new Set(
        keys
          .filter(k => k.includes(seg) && k.endsWith('.json'))
          .map(k => k.slice(k.indexOf(seg) + seg.length).split('/')[0])
          .filter(Boolean)
      )].map(folder => ({ folder, type }));
    };

    const dmFolders = [
      ...getConvFolders('inbox'),
      ...getConvFolders('message_requests'),
    ];

    progress(`Processing ${dmFolders.length} conversation${dmFolders.length !== 1 ? 's' : ''}...`, 20);

    // Process DMs in batches (#2) — each batch posts a progress update
    const BATCH = 20;
    const dmResults = [];
    for (let i = 0; i < dmFolders.length; i += BATCH) {
      const end = Math.min(i + BATCH, dmFolders.length);
      for (let j = i; j < end; j++) {
        const { folder: dm, type } = dmFolders[j];
        const base = parseJSON(`messages/${type}/${dm}/message_1.json`);
        if (!base?.messages || !base.title) continue;

        const prefix = `messages/${type}/${dm}/message_`;
        const extraNums = keys
          .filter(k => k.includes(prefix) && k.endsWith('.json'))
          .map(k => parseInt(k.replace(/.*message_(\d+)\.json$/, '$1')))
          .filter(n => n > 1);
        for (const n of extraNums) {
          const extra = parseJSON(`${prefix}${n}.json`);
          if (extra?.messages) base.messages.push(...extra.messages);
        }
        base.messages.sort((a, b) => a.timestamp_ms - b.timestamp_ms);

        const participantName = base.participants?.[1]?.name ?? base.participants?.[0]?.name ?? '';
        const myMessages = participantName
          ? base.messages.filter(m => m.sender_name === participantName).length
          : 0;

        dmResults.push({
          username: decodeURIComponent(escape(base.title.toString())),
          name: decodeURIComponent(escape(dm.toString())),
          count: base.messages.length,
          myMessages,
          participantsCount: base.participants.length,
          participants: base.participants,
          participantName,
          all: base.messages,
        });
      }
      const pct = 20 + Math.round((end / dmFolders.length) * 38);
      progress(`Processing conversations ${end}/${dmFolders.length}`, pct);
    }

    const allMessages = dmResults;
    const dms = allMessages.filter(d => d.participantsCount === 2);
    const topDMS = [...dms].sort((a, b) => b.count - a.count).slice(0, 10);

    const popularTimes = {};
    const popularMonths = {};
    const popularDays = {};
    const popularDayDates = {};

    for (const dm of allMessages) {
      for (const message of dm.all) {
        if (message.sender_name !== rawName) continue;
        const d = new Date(message.timestamp_ms);
        const hour = d.getHours();
        const month = MONTH_NAMES[d.getMonth()];
        const year = d.getFullYear();
        const day = DAYS[d.getDay()];
        const dateStr = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        popularTimes[hour] = (popularTimes[hour] || 0) + 1;
        popularMonths[`${month}-${year}`] = (popularMonths[`${month}-${year}`] || 0) + 1;
        popularDays[day] = (popularDays[day] || 0) + 1;
        popularDayDates[dateStr] = (popularDayDates[dateStr] || 0) + 1;
      }
    }

    const mostActiveDate = Object.entries(popularDayDates).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const mostActiveMonth = Object.entries(popularMonths).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace("-", " ") ?? null;
    const totalSentMessages = allMessages.reduce((s, dm) => s + dm.myMessages, 0);

    const wordFreqMap = new Map();
    for (const dm of allMessages) {
      for (const msg of dm.all) {
        if (!msg.content || msg.sender_name !== dm.participantName) continue;
        const words = msg.content
          .replace(/https?:\/\/\S+/g, '')
          .replace(/\S+\.(com|net|org|io|co|app|dev|xyz)\S*/g, '')
          .split(/\s+/);
        for (const raw of words) {
          const word = raw.toLowerCase();
          if (
            !/^[a-zA-Z]{3,}$/.test(word) ||
            IGNORE_WORDS.has(word) ||
            IGNORE_WORDS.has(word.slice(0, 5)) ||
            /^(.)\1+$/.test(word) ||
            /^(ha|he|ah|eh|oh|hi|lol|wow|ok|kay|hm|what)+$/i.test(word)
          ) continue;
          wordFreqMap.set(word, (wordFreqMap.get(word) || 0) + 1);
        }
      }
    }
    const topWords = [...wordFreqMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));

    progress('Reading connections...', 62);

    const followingData = parseJSON('connections/followers_and_following/following.json');
    const followerPages = Array.from({ length: 15 }, (_, i) =>
      parseJSON(`connections/followers_and_following/followers_${i + 1}.json`)
    );
    const blockedData = parseJSON('connections/followers_and_following/blocked_profiles.json');
    const closeFriendsData = parseJSON('connections/followers_and_following/close_friends.json');

    const following = followingData?.relationships_following?.length ?? 0;
    const allFollowerEntries = followerPages.filter(Boolean).flatMap(p => p);
    const followers = allFollowerEntries.length;
    const firstFollower = allFollowerEntries.at(-1)?.string_list_data?.[0]?.value ?? null;
    const blocked = (Array.isArray(blockedData) ? blockedData : blockedData?.relationships_blocked_users)?.length ?? 0;
    const closeFriends = (Array.isArray(closeFriendsData) ? closeFriendsData : closeFriendsData?.relationships_close_friends)?.length ?? 0;

    const recentlyUnfollowed = parseJSON('connections/followers_and_following/recently_unfollowed_profiles.json');
    const unfollowed = Array.isArray(recentlyUnfollowed)
      ? recentlyUnfollowed.map(r => ({
          username: r.label_values?.find(lv => lv.label === 'Username')?.value ?? '',
          time: r.timestamp ?? null,
        }))
      : recentlyUnfollowed?.relationships_unfollowed_users?.map(r => ({
          username: r.string_list_data[0].value,
          time: r.string_list_data[0].timestamp,
        }));

    const iFollowUsernames = new Set(followingData?.relationships_following?.map(f => f.title) ?? []);
    const myFollowerUsernames = new Set(allFollowerEntries.map(f => f.string_list_data[0].value));
    const notFollowingBack = [...iFollowUsernames].filter(u => !myFollowerUsernames.has(u));
    const notFollowedBack = [...myFollowerUsernames].filter(u => !iFollowUsernames.has(u));
    const mutual = [...iFollowUsernames].filter(u => myFollowerUsernames.has(u)).length;

    progress('Reading likes & activity...', 72);

    const normalizeActivity = (raw) => {
      if (raw.title !== undefined) return raw;
      const ownerEntry = raw.label_values?.find(lv => lv.title === 'Owner');
      const username = ownerEntry?.dict?.[0]?.dict?.find(d => d.label === 'Username')?.value ?? '';
      const urlEntry = raw.label_values?.find(lv => lv.label === 'URL');
      return {
        title: username,
        string_list_data: [{ href: urlEntry?.href ?? urlEntry?.value ?? '', timestamp: raw.timestamp ?? null }],
      };
    };

    const likedPostsData = parseJSON('likes/liked_posts.json');
    const likedCommentsData = parseJSON('likes/liked_comments.json');
    const likedStoriesData = parseJSON('your_instagram_activity/story_interactions/story_likes.json');
    const savedData = parseJSON('your_instagram_activity/saved/saved_posts.json');
    const storiesPostedData = parseJSON('your_instagram_activity/media/stories.json');
    const commentsPostedData = parseJSON('your_instagram_activity/comments/post_comments_1.json');
    const profilePhotosData = parseJSON('your_instagram_activity/media/profile_photos.json');
    const devicesData = parseJSON('personal_information/device_information/devices.json');
    const advertisersData = parseJSON('ads_information/instagram_ads_and_businesses/advertisers_using_your_activity_or_information.json');

    const likedPosts = (Array.isArray(likedPostsData)
      ? likedPostsData
      : (likedPostsData?.likes_media_likes ?? [])).map(normalizeActivity);
    const likedComments = likedCommentsData?.likes_comment_likes ?? [];
    const likedStoriesList = (Array.isArray(likedStoriesData)
      ? likedStoriesData
      : (likedStoriesData?.story_activities_story_likes ?? [])).map(normalizeActivity);
    const likedStories = likedStoriesList.length;
    const likedStoryAccountsMap = {};
    for (const s of likedStoriesList) {
      if (s.title) likedStoryAccountsMap[s.title] = (likedStoryAccountsMap[s.title] || 0) + 1;
    }
    const topLikedStoryAccounts = Object.entries(likedStoryAccountsMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([username, count]) => ({ username, count }));
    const saved = (Array.isArray(savedData) ? savedData : savedData?.saved_saved_media)?.length ?? 0;
    const totalStoriesPosted = storiesPostedData?.ig_stories?.length ?? 0;
    const rawComments = Array.isArray(commentsPostedData) ? commentsPostedData : [];
    const commentsList = rawComments.flatMap(c =>
      Array.isArray(c.comments_post_comments) ? c.comments_post_comments : [c]
    );
    const commentsPosted = commentsList.length;
    const lastPfpUpdate = profilePhotosData?.ig_profile_picture?.[0]?.creation_timestamp ?? null;
    const connectedDevices = devicesData?.devices_devices?.length ?? 0;

    const likedAccountsMap = {};
    for (const post of likedPosts) {
      if (post.title) likedAccountsMap[post.title] = (likedAccountsMap[post.title] || 0) + 1;
    }
    const topLikedAccounts = Object.entries(likedAccountsMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([username, count]) => ({ username, count }));

    const instaProfileInfoRaw = parseJSON('personal_information/personal_information/instagram_profile_information.json');
    const instaProfileInfo = Array.isArray(instaProfileInfoRaw) ? instaProfileInfoRaw[0] : instaProfileInfoRaw;
    const firstStory = instaProfileInfo?.label_values?.find(l => l.label === "First Story Time")?.timestamp_value ?? null;

    const signupInfo = parseJSON('security_and_login_information/login_and_profile_creation/signup_details.json');
    const dateJoinedTs = signupInfo?.account_history_registration_info?.[0]?.string_map_data?.["Time"]?.timestamp ?? null;

    const profileChangesData = parseJSON('personal_information/personal_information/profile_changes.json');
    const topicsData = parseJSON('preferences/your_topics/recommended_topics.json');
    const interests = (topicsData?.topics_your_topics ?? [])
      .map(t => t.string_map_data?.Name?.value).filter(Boolean);

    const adsViewedData = parseJSON('ads_information/ads_and_topics/ads_viewed.json');
    const rawAdsArray = Array.isArray(adsViewedData)
      ? adsViewedData
      : (adsViewedData?.impressions_history_ads_seen ?? []);
    const adsViewed = rawAdsArray.map(a => {
      const ownerEntry = a.label_values?.find(lv => lv.title === 'Owner');
      const author = ownerEntry?.dict?.[0]?.dict?.find(d => d.label === 'Username')?.value
        ?? a.string_map_data?.Author?.value ?? '';
      const timestamp = a.timestamp ?? a.string_map_data?.Time?.timestamp ?? null;
      return { author, timestamp };
    });

    progress('Reading ads & interests...', 83);

    const adsMeta = parseJSON('ads_information/instagram_ads_and_businesses/ads_about_meta.json');
    const otherCategoriesData = parseJSON('ads_information/instagram_ads_and_businesses/other_categories_used_to_reach_you.json');
    const locationsOfInterestData = parseJSON('personal_information/information_about_you/locations_of_interest.json');
    const possiblePhoneData = parseJSON('personal_information/information_about_you/possible_phone_numbers.json');
    const profileBasedInData = parseJSON('personal_information/information_about_you/profile_based_in.json');
    const offMetaData = parseJSON('apps_and_websites_off_of_instagram/apps_and_websites/your_activity_off_meta_technologies.json');

    const optedOutOfMetaAds = adsMeta
      ? adsMeta.label_values?.find(lv => lv.label === 'Is opted out of ads about Meta')?.value === 'True'
      : null;
    const metaCategories = (otherCategoriesData?.label_values?.[0]?.vec ?? []).map(v => v.value).filter(Boolean);
    const locationsInterest = (locationsOfInterestData?.label_values?.[0]?.vec ?? []).map(v => v.value).filter(Boolean);
    const phoneOnFile = possiblePhoneData?.label_values?.find(lv => lv.label === 'Phone number')?.value ?? null;
    const basedInDict = profileBasedInData?.label_values?.[0]?.dict ?? [];
    const rawCity = basedInDict.find(d => d.label === 'City')?.value ?? null;
    const basedIn = {
      country: basedInDict.find(d => d.label === 'Country')?.value ?? null,
      region: basedInDict.find(d => d.label === 'Region')?.value ?? null,
      city: rawCity ? rawCity.split(',')[0].trim() : null,
    };
    const offMetaTrackers = (Array.isArray(offMetaData) ? offMetaData : []).map(site => ({
      title: site.title,
      events: (site.label_values?.find(lv => lv.label === 'Events')?.vec ?? []).length,
    })).sort((a, b) => b.events - a.events);

    const profileChanges = profileChangesData?.profile_profile_change?.map(c => ({
      changed: c.string_map_data?.['Changed']?.value ?? '',
      prev: decode(c.string_map_data?.['Previous Value']?.value ?? ''),
      next: decode(c.string_map_data?.['New Value']?.value ?? ''),
      timestamp: c.string_map_data?.['Change Date']?.timestamp ?? null,
    })).filter(c => c.timestamp) ?? [];

    const followersList = allFollowerEntries.map(f => ({
      username: f.string_list_data[0].value,
      timestamp: f.string_list_data[0].timestamp,
    }));
    const followingList = followingData?.relationships_following?.map(f => ({
      username: f.title,
      timestamp: f.string_list_data?.[0]?.timestamp ?? null,
    })) ?? [];

    progress('Finalizing your wrap...', 95);

    self.postMessage({
      type: 'result',
      data: {
        allMessages, topDMS,
        popularTimes, popularMonths, popularDays,
        topWords,
        following, followers, firstFollower, mutual, blocked, closeFriends,
        unfollowed, notFollowingBack, notFollowedBack,
        followersList, followingList,
        likedPosts, likedComments, topLikedAccounts, likedStories, likedStoriesList, topLikedStoryAccounts, saved,
        totalStoriesPosted, commentsPosted, commentsList,
        lastPfpUpdate, connectedDevices,
        mostActiveDate, mostActiveMonth, popularDayDates,
        avgMessagesPerDay: firstStory
          ? Math.round((totalSentMessages / Math.max(1, Math.floor((Math.floor(Date.now() / 1000) - firstStory) / 86400))) * 10) / 10
          : 0,
        rawName, username, name, bio, emojiPong, firstStory, pfpPath,
        email, dateOfBirth, gender, website, privateAccount, dateJoined: dateJoinedTs,
        profileChanges,
        interests, adsViewed,
        advertisers: (advertisersData?.label_values?.[0]?.vec ?? []).map(v => v.value).filter(Boolean),
        optedOutOfMetaAds, metaCategories, locationsInterest, phoneOnFile, basedIn, offMetaTrackers,
      },
    });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
