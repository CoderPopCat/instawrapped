import { DecodeUTF8 } from "fflate";

export const readFile = async (name, files) => {
    return new Promise((resolve) => {
        const file = files.find((file) => {
            if (file && file?.name) {
                return file.name === name;
            }
        });
        if (!file) return resolve(null);
        const fileContent = [];
        const decoder = new DecodeUTF8();
        file.ondata = (err, data, final) => {
            decoder.push(data, final);
        };
        decoder.ondata = (str, final) => {
            fileContent.push(str);
            if (final) resolve(fileContent.join(""));
        };
        file.start();
    });
}

const read = async (file, files) => {
    return JSON.parse(await readFile(`${file}`, files))
}

export const getSaved = async (files) => {
    const path = "your_instagram_activity/saved/saved_posts.json";
    const savedPosts = await read(path, files);
    return savedPosts.saved_saved_media.length;
}

export const getComments = async (files) => {
    const postComments = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}comments/post_comments_1.json`, files);
    const reelComments = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}comments/reels_comments.json`, files);
    
    const allComments = [];
    
    if (Array.isArray(postComments)) {
        for (const post of postComments) {
            if (post.comments_post_comments && Array.isArray(post.comments_post_comments)) {
                allComments.push(...post.comments_post_comments);
            } else {
                allComments.push(post);
            }
        }
    }
    
    if (reelComments && reelComments.comments_reels_comments && Array.isArray(reelComments.comments_reels_comments)) {
        for (const reel of reelComments.comments_reels_comments) {
            if (reel.comments_reels_comments && Array.isArray(reel.comments_reels_comments)) {
                allComments.push(...reel.comments_reels_comments);
            } else {
                allComments.push(reel);
            }
        }
    }
    
    return { count: allComments.length, comments: allComments };
}

export const getDMS = (files) => {
    let dms, unique;
    // if (files.map(f => f.name).includes('your_activity_across_facebook/')) {
    //     dms = (files.filter((file) => file.name.startsWith(`your_instagram_activity/messages/inbox`) && file.name.endsWith(".json")).map(f => f.name));
    //     unique = [...new Set(dms.map((dm) => dm.split("/")[3]))];
    // } else {
    dms = (files.filter((file) => file.name.startsWith(`your_instagram_activity/messages/inbox/`) && file.name.endsWith(".json")).map(f => f.name));
    unique = [...new Set(dms.map((dm) => dm.split("/")[3]))];
    return unique;
}


function findMostRepeatedWord(words) {
    const ignoreWordsLength4Or5 = [
        // Articles and basic pronouns
        'the', 'a', 'an', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
        'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
        
        // Prepositions
        'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'down', 'over', 'under',
        
        // Conjunctions
        'and', 'or', 'but', 'nor', 'so', 'yet',
        
        // Common verbs
        'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could',
        'shall', 'should', 'may', 'might', 'must',
        
        // Common adverbs
        'very', 'really', 'just', 'now', 'then', 'there', 'here', 'only', 'also',
        'too', 'about', 'most', 'more', 'some', 'such',
        
        // Social media common words
        'like', 'lol', 'omg', 'tf', 'fr', 'u', 'ur', 'r', 'dm', 'rn', 'idk', 'nvm',
        'lmao', 'tbh', 'imo', 'fyi', 'btw', 'aka', 'msg', 'thx',
        
        // Common time-related words
        'time', 'day', 'today', 'tomorrow', 'yesterday', 'now', 'later', 'soon',
        
        // Common Instagram-specific words
        'post', 'posted', 'posting', 'story', 'stories', 'feed', 'dm', 'message',
        'sent', 'received', 'liked', 'commented', 'shared', 'following', 'followers',
        'instagram', 'insta', 'gram', 'ig', 'photo', 'video', 'reel', 'reacted'
    ];

    function isEnglishWord(word) {
        return /^[a-zA-Z]+$/.test(word);
    }

    function shouldIgnore(word) {
        const lowerCaseWord = word.toLowerCase();
        return ignoreWordsLength4Or5.includes(lowerCaseWord) || ignoreWordsLength4Or5.includes(lowerCaseWord.substring(0, 5));
    }

    const wordFrequencyMap = new Map();
    function isValidWord(word) {
        return /^[a-zA-Z]{3,}$/.test(word) && 
               !ignoreWordsLength4Or5.includes(word.toLowerCase()) &&
               !/^(.)\1+$/.test(word) &&
               !/^(ha|he|ah|eh|oh|hi|lol|wow|ok|kay|hm|what)+$/i.test(word);
    }
    words.forEach((word) => {
        const lowercaseWord = word.toLowerCase();
        if (!shouldIgnore(lowercaseWord) && isEnglishWord(lowercaseWord) && isValidWord(lowercaseWord)) {
            const count = wordFrequencyMap.get(lowercaseWord) || 0;
            wordFrequencyMap.set(lowercaseWord, count + 1);
        }
    });

    const wordFrequencyArray = Array.from(wordFrequencyMap.entries());
    wordFrequencyArray.sort((a, b) => b[1] - a[1]);

    const top10Words = wordFrequencyArray.slice(0, 10);
    const top10WordsOnly = top10Words.map((pair) => ({ word: pair[0], count: pair[1] }));

    // give all words, not only 10 with their count
    return wordFrequencyArray.map(pair => ({ word: pair[0], count: pair[1] }));

}

export const messages = async (files) => {
    const dms = getDMS(files);
    const allDMS = [];
    
    for (const dm of dms) {
        const messages = await read(`your_instagram_activity/messages/inbox/${dm}/message_1.json`, files);
        if (!messages) continue;
        
        for (let i = 2; i <= 15; i++) {
            const extra = await read(`your_instagram_activity/messages/inbox/${dm}/message_${i}.json`, files);
            if (extra && extra.messages) messages.messages.push(...extra.messages);
        }
        
        if (messages.title && messages.participants && messages.participants.length >= 2) {
            const participantName = messages.participants[1].name;
            let myMessagesCount = 0;
            for (let i = 0; i < messages.messages.length; i++) {
                if (messages.messages[i].sender_name === participantName) {
                    myMessagesCount++;
                }
            }
            
            allDMS.push({ 
                username: decodeURIComponent(escape(messages.title.toString())), 
                name: decodeURIComponent(escape(dm.toString())), 
                count: messages.messages.length, 
                myMessages: myMessagesCount, 
                participants: messages.participants.length,
                participantName: participantName, 
                all: messages.messages 
            });
        }
    }
    
    const allWords = [];
    const convNameMap = new Map();
    allDMS.forEach(conv => convNameMap.set(conv.name, conv));
    
    for (const conv of allDMS) {
        for (const message of conv.all) {
            if (message.content && message.sender_name !== conv.name) {
                const words = message.content.split(/\s+/);
                allWords.push(...words);
            }
        }
    }
    
    const words = allWords.filter((word) => word.length > 4);
    return { allDMS, favWords: findMostRepeatedWord(words).slice(0, 15) };
}

export const storiesPosted = async (files) => {
    const stories = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}media/stories.json`, files);
    return stories ? { count: stories.ig_stories.length, stories: stories.ig_stories } : { count: 0, stories: [] };
}

export const following = async (files) => {
    // if (files.map(f => f.name).includes('your_activity_across_facebook/')) {
    //     const following = await read(`your_instagram_activity/connections/followers_and_following/following.json`, files);
    //     return following.relationships_following.length;
    // } else {
    const following = await read(`connections/followers_and_following/following.json`, files);
    return following.relationships_following.length;
    // }
}

export const followers = async (files) => {
    // if (files.map(f => f.name).includes('your_activity_across_facebook/')) {
    //     const followers = await read("connections/followers_and_following/followers_1.json", files);
    //     let followerCount = followers.length;
    //     for (let i = 2; i <= 15; i++) {
    //         const extra = await read(`connections/followers_and_following/followers_${i}.json`, files);
    //         if (extra) followerCount += extra.length;
    //     }
    //     return followerCount;
    // } else {
    const followers = await read("connections/followers_and_following/followers_1.json", files);
    let followerCount = followers.length;
    for (let i = 2; i <= 15; i++) {
        const extra = await read(`connections/followers_and_following/followers_${i}.json`, files);
        if (extra) followerCount += extra.length;
    }
    return followerCount;
    // }
}

export const firstFollower = async (files) => {
    const followers = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'connections/' : 'connections/'}followers_and_following/followers_1.json`, files);
    for (let i = 2; i <= 15; i++) {
        const extra = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'connections/' : 'connections/'}followers_and_following/followers_${i}.json`, files);
        if (extra) followers.push(...extra);
    }
    const first = followers[followers.length - 1].string_list_data[0].value;
    return first;
}

export const blocked = async (files) => {
    const blocked = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'connections/' : 'connections/'}followers_and_following/blocked_profiles.json`, files);
    return blocked ? blocked.relationships_blocked_users.length : 0;
}

export const closeFriends = async (files) => {
    const closeFriends = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'connections/' : 'connections/'}followers_and_following/close_friends.json`, files);
    return closeFriends ? closeFriends.relationships_close_friends.length : 0;
}

export const storiesLiked = async (files) => {
    const storiesLiked = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}story_interactions/story_likes.json`, files);
    return { count: storiesLiked.story_activities_story_likes.length, data: storiesLiked.story_activities_story_likes };
}

export const likedPosts = async (files) => {
    const likedPosts = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}likes/liked_posts.json`, files);
    return { count: likedPosts.likes_media_likes.length, data: likedPosts.likes_media_likes };
}

export const likedComments = async (files) => {
    const likedComments = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}likes/liked_comments.json`, files);
    return { count: likedComments.likes_comment_likes.length, data: likedComments.likes_comment_likes };
}

export const devices = async (files) => {
    const devices = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'personal_information/' : 'personal_information/'}device_information/devices.json`, files);
    return devices.devices_devices.length;
}

export const firstStory = async (files) => {
    const personalInfo = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'personal_information/' : 'personal_information/'}personal_information/instagram_profile_information.json`, files);
    return personalInfo.profile_account_insights[0].string_map_data["First Story Time"].timestamp;
}

export const personalInfo = async (files) => {
    const personalInfo = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'personal_information/' : 'personal_information/'}personal_information/personal_information.json`, files);
    const data = {
        username: decodeURIComponent(escape(personalInfo.profile_user[0].string_map_data.Username.value)),
        name: decodeURIComponent(escape(personalInfo.profile_user[0].string_map_data.Name ? personalInfo.profile_user[0].string_map_data.Name.value : "No Name")),
        bio: decodeURIComponent(escape(personalInfo.profile_user[0].string_map_data.Bio ? personalInfo.profile_user[0].string_map_data.Bio.value : "No Bio")),
        lastPFPUpdate: personalInfo.profile_user[0].media_map_data["Profile Photo"].creation_timestamp,
    }
    return data;
}

export const accountAge = async (files) => {
    try {
        const firstStoryTimestamp = await firstStory(files);
        const now = Math.floor(Date.now() / 1000);
        const days = Math.floor((now - firstStoryTimestamp) / (24 * 60 * 60));
        return days;
    } catch (error) {
        return 0;
    }
}

const messageCache = new Map();

export const filterMessagesByYear = (allMessages, year) => {
    if (!year) return allMessages;
    const cacheKey = `year_${year}`;
    if (messageCache.has(cacheKey)) {
        return messageCache.get(cacheKey);
    }
    
    const yearStart = new Date(year, 0, 1).getTime();
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999).getTime();
    
    const filtered = [];
    for (let i = 0; i < allMessages.length; i++) {
        const conv = allMessages[i];
        const filteredMessages = [];
        let myMessagesCount = 0;
        
        for (let j = 0; j < conv.all.length; j++) {
            const msg = conv.all[j];
            if (msg.timestamp_ms && msg.timestamp_ms >= yearStart && msg.timestamp_ms <= yearEnd) {
                filteredMessages.push(msg);
                if (msg.sender_name === conv.participantName) {
                    myMessagesCount++;
                }
            }
        }
        
        if (filteredMessages.length > 0) {
            filtered.push({
                ...conv,
                all: filteredMessages,
                count: filteredMessages.length,
                myMessages: myMessagesCount
            });
        }
    }
    
    messageCache.set(cacheKey, filtered);
    return filtered;
};

export const clearMessageCache = () => {
    messageCache.clear();
    cachedYears = null;
};

export const avgMessagesPerDay = (filteredMessages, year = null, firstStoryTimestamp = null) => {
    try {
        let totalMessages = 0;
        for (const conv of filteredMessages) {
            totalMessages += conv.count;
        }

        if (year) {
            const startDate = new Date(year, 0, 1).getTime();
            const endDate = new Date(year, 11, 31, 23, 59, 59).getTime();
            const days = Math.max(1, Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000)));
            return Math.round((totalMessages / days) * 10) / 10;
        } else {
            if (!firstStoryTimestamp) return 0;
            const now = Math.floor(Date.now() / 1000);
            const days = Math.max(1, Math.floor((now - firstStoryTimestamp) / (24 * 60 * 60)));
            return Math.round((totalMessages / days) * 10) / 10;
        }
    } catch (error) {
        return 0;
    }
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const mostActiveDay = (filteredMessages) => {
    try {
        const dayCounts = new Array(7).fill(0);

        for (const conv of filteredMessages) {
            for (const message of conv.all) {
                if (message.timestamp_ms) {
                    const day = new Date(message.timestamp_ms).getDay();
                    dayCounts[day]++;
                }
            }
        }

        let maxDay = 0;
        let maxCount = 0;
        for (let i = 0; i < 7; i++) {
            if (dayCounts[i] > maxCount) {
                maxCount = dayCounts[i];
                maxDay = i;
            }
        }
        return DAY_NAMES[maxDay];
    } catch (error) {
        return 'N/A';
    }
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const mostActiveMonth = (filteredMessages) => {
    try {
        const monthCounts = new Array(12).fill(0);

        for (const conv of filteredMessages) {
            for (const message of conv.all) {
                if (message.timestamp_ms) {
                    const month = new Date(message.timestamp_ms).getMonth();
                    monthCounts[month]++;
                }
            }
        }

        let maxMonth = 0;
        let maxCount = 0;
        for (let i = 0; i < 12; i++) {
            if (monthCounts[i] > maxCount) {
                maxCount = monthCounts[i];
                maxMonth = i;
            }
        }
        return MONTH_NAMES[maxMonth];
    } catch (error) {
        return 'N/A';
    }
}

let cachedYears = null;

export const getAvailableYears = (allMessages, useCache = true) => {
    try {
        if (useCache && cachedYears) return cachedYears;
        
        const years = new Set();
        for (const conv of allMessages) {
            for (const message of conv.all) {
                if (message.timestamp_ms) {
                    const year = new Date(message.timestamp_ms).getFullYear();
                    years.add(year);
                }
            }
        }
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        if (useCache) cachedYears = sortedYears;
        return sortedYears;
    } catch (error) {
        return [];
    }
}

export const clearYearsCache = () => {
    cachedYears = null;
};

export const filterStoriesPostedByYear = (storiesData, year) => {
    if (!year) return storiesData.count;
    let count = 0;
    const yearStart = new Date(year, 0, 1).getTime() / 1000;
    const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
    
    for (const story of storiesData.stories || []) {
        const timestamp = story.creation_timestamp || story.taken_at;
        if (timestamp && timestamp >= yearStart && timestamp <= yearEnd) {
            count++;
        }
    }
    return count;
}

export const filterLikedPostsByYear = (likedPostsData, year) => {
    if (!year) return likedPostsData.count;
    let count = 0;
    const yearStart = new Date(year, 0, 1).getTime() / 1000;
    const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
    
    for (const item of likedPostsData.data || []) {
        if (item.string_list_data && item.string_list_data.length > 0) {
            const timestamp = item.string_list_data[0].timestamp;
            if (timestamp && timestamp >= yearStart && timestamp <= yearEnd) {
                count++;
            }
        }
    }
    return count;
}

export const filterLikedCommentsByYear = (likedCommentsData, year) => {
    if (!year) return likedCommentsData.count;
    let count = 0;
    const yearStart = new Date(year, 0, 1).getTime() / 1000;
    const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
    
    for (const item of likedCommentsData.data || []) {
        if (item.string_list_data && item.string_list_data.length > 0) {
            const timestamp = item.string_list_data[0].timestamp;
            if (timestamp && timestamp >= yearStart && timestamp <= yearEnd) {
                count++;
            }
        }
    }
    return count;
}

export const filterLikedStoriesByYear = (likedStoriesData, year) => {
    if (!year) return likedStoriesData.count;
    let count = 0;
    const yearStart = new Date(year, 0, 1).getTime() / 1000;
    const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
    
    for (const item of likedStoriesData.data || []) {
        const timestamp = item.timestamp || item.string_list_data?.[0]?.timestamp;
        if (timestamp && timestamp >= yearStart && timestamp <= yearEnd) {
            count++;
        }
    }
    return count;
}

export const filterCommentsByYear = (commentsData, year) => {
    if (!year || !commentsData) return commentsData?.count || 0;
    let count = 0;
    const yearStart = new Date(year, 0, 1).getTime() / 1000;
    const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
    
    const comments = commentsData.comments || [];
    
    for (const comment of comments) {
        let timestamp = null;
        
        if (comment.string_map_data && comment.string_map_data.Time && comment.string_map_data.Time.timestamp) {
            timestamp = comment.string_map_data.Time.timestamp;
        } else if (comment.timestamp !== undefined && comment.timestamp !== null) {
            timestamp = comment.timestamp;
        } else if (comment.created_at !== undefined && comment.created_at !== null) {
            timestamp = comment.created_at;
        } else if (comment.time !== undefined && comment.time !== null) {
            timestamp = comment.time;
        } else if (comment.string_list_data && Array.isArray(comment.string_list_data) && comment.string_list_data.length > 0) {
            timestamp = comment.string_list_data[0].timestamp;
        }
        
        if (timestamp !== undefined && timestamp !== null) {
            let ts = typeof timestamp === 'number' ? timestamp : parseInt(timestamp);
            if (ts > 4102444800) {
                ts = ts / 1000;
            }
            if (ts && ts >= yearStart && ts <= yearEnd) {
                count++;
            }
        }
    }
    return count;
}
