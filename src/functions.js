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
    return postComments.length + reelComments.comments_reels_comments.length;
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
        // Must be only letters, at least 3 characters long
        return /^[a-zA-Z]{3,}$/.test(word) && 
               // Not in stop words
               !ignoreWordsLength4Or5.includes(word.toLowerCase()) &&
               // Not just repeating letters (like 'haha', 'hahaha')
               !/^(.)\1+$/.test(word) &&
               // Not common repetitive patterns
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
        for (let i = 2; i <= 15; i++) {
            const extra = await read(`your_instagram_activity/messages/inbox/${dm}/message_${i}.json`, files);
            if (extra) messages.messages.push(...extra.messages);
        }
        if (messages.title && messages.participants.length >= 2) {
            allDMS.push({ username: decodeURIComponent(escape(messages.title.toString())), name: decodeURIComponent(escape(dm.toString())), count: messages.messages.length, myMessages: messages.messages.filter((message) => message.sender_name === messages.participants[1].name).length, participants: messages.participants.length, all: messages.messages });
        }
    };
    const allWords = [];
    for (const conv of allDMS) {
        for (const message of conv.all) {
            if (message.content && message.sender_name !== conv.name) {
                const words = message.content.split(" ");
                for (const word of words) {
                    allWords.push(word);
                }
            }
        }
    }
    console.log(findMostRepeatedWord(allWords.filter(word => word.length > 3)));
    const words = allWords.filter((word) => word.length > 4);
    return { allDMS, favWords: findMostRepeatedWord(words).slice(0, 15) };
}

export const storiesPosted = async (files) => {
    const stories = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}media/stories.json`, files);
    return stories ? stories.ig_stories.length : 0;
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
    return storiesLiked.story_activities_story_likes.length;
}

export const likedPosts = async (files) => {
    const likedPosts = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}likes/liked_posts.json`, files);
    return likedPosts.likes_media_likes.length;
}

export const likedComments = async (files) => {
    const likedComments = await read(`${files.map(f => f.name).includes('your_activity_across_facebook/') ? 'your_instagram_activity/' : 'your_instagram_activity/'}likes/liked_comments.json`, files);
    return likedComments.likes_comment_likes.length;
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