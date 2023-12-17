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
    const savedPosts = await read("saved/saved_posts.json", files)
    return savedPosts.saved_saved_media.length;
}

export const getComments = async (files) => {
    const postComments = await read("comments/post_comments_1.json", files);
    const reelComments = await read("comments/reels_comments.json", files);
    return postComments.length + reelComments.comments_reels_comments.length;
}

export const getStories = async (files) => {
    const stories = await read("content/stories.json", files);
    return stories.ig_stories.length;
}

export const getDMS = (files) => {
    const dms = (files.filter((file) => file.name.startsWith(`messages/inbox`) && file.name.endsWith(".json")).map(f => f.name));
    const unique = [...new Set(dms.map((dm) => dm.split("/")[2]))];
    return unique;
}


function findMostRepeatedWord(words) {
    const ignoreWordsLength4Or5 = ['sent', 'from', 'attachment', 'the', 'and', 'that', 'with', 'this', 'have', 'your', 'from', 'will', 'been', 'they', 'were', 'which', 'would', 'about'];

    function isEnglishWord(word) {
        return /^[a-zA-Z]+$/.test(word);
    }

    function shouldIgnore(word) {
        const lowerCaseWord = word.toLowerCase();
        return ignoreWordsLength4Or5.includes(lowerCaseWord) || ignoreWordsLength4Or5.includes(lowerCaseWord.substring(0, 5));
    }

    const wordFrequencyMap = new Map();

    words.forEach((word) => {
        const lowercaseWord = word.toLowerCase();
        if (!shouldIgnore(lowercaseWord) && isEnglishWord(lowercaseWord)) {
            const count = wordFrequencyMap.get(lowercaseWord) || 0;
            wordFrequencyMap.set(lowercaseWord, count + 1);
        }
    });

    const wordFrequencyArray = Array.from(wordFrequencyMap.entries());
    wordFrequencyArray.sort((a, b) => b[1] - a[1]);

    const top10Words = wordFrequencyArray.slice(0, 10);
    const top10WordsOnly = top10Words.map((pair) => ({ word: pair[0], count: pair[1] }));

    return top10WordsOnly;
}

export const messages = async (files) => {
    const dms = getDMS(files);
    const allDMS = [];
    const debug = [];
    for (const dm of dms) {
        const messages = await read(`messages/inbox/${dm}/message_1.json`, files);
        for (let i = 2; i <= 4; i++) {
            const extra = await read(`messages/inbox/${dm}/message_${i}.json`, files);
            if (extra) messages.messages.push(...extra.messages);
        }
        if (messages.title) {
            allDMS.push({ username: decodeURIComponent(escape(messages.title.toString())), name: decodeURIComponent(escape(dm.toString())), count: messages.messages.length, myMessages: messages.messages.filter((message) => message.sender_name === messages.participants[1].name).length, participants: messages.participants.length });
            debug.push({ username: decodeURIComponent(escape(messages.title.toString())), name: decodeURIComponent(escape(dm.toString())), count: messages.messages, myMessages: messages.messages.filter((message) => message.sender_name === messages.participants[1].name).length, participants: messages.participants.length })
        }
    };
    console.log(debug);
    const allWords = [];
    for (const conv of debug) {
        for (const message of conv.count) {
            if (message.content) {
                const words = message.content.split(" ");
                for (const word of words) {
                    allWords.push(word);
                }
            }
        }
    }
    const words = allWords.filter((word) => word.length > 3);
    return {allDMS, favWords: findMostRepeatedWord(words)};
}

export const storiesPosted = async (files) => {
    const stories = await read("content/stories.json", files);
    return stories.ig_stories.length;
}

export const following = async (files) => {
    const following = await read("followers_and_following/following.json", files);
    return following.relationships_following.length;
}

export const followers = async (files) => {
    const followers = await read("followers_and_following/followers_1.json", files);
    const followerCount = followers.length;
    for (let i = 2; i <= 15; i++) {
        const extra = await read(`followers_and_following/followers_${i}.json`, files);
        if (extra) followerCount += extra.length;
    }
    return followerCount;
}

export const firstFollower = async (files) => {
    const followers = await read("followers_and_following/followers_1.json", files);
    for (let i = 2; i <= 15; i++) {
        const extra = await read(`followers_and_following/followers_${i}.json`, files);
        if (extra) followers.push(...extra);
    }
    const first = followers[followers.length - 1].string_list_data[0].value;
    console.log(first)
    return first;
}

export const blocked = async (files) => {
    const blocked = await read("followers_and_following/blocked_accounts.json", files);
    return blocked.relationships_blocked_users.length;
}

export const closeFriends = async (files) => {
    const closeFriends = await read("followers_and_following/close_friends.json", files);
    return closeFriends.relationships_close_friends.length;
}

export const storiesLiked = async (files) => {
    const storiesLiked = await read("story_sticker_interactions/story_likes.json", files);
    return storiesLiked.story_activities_story_likes.length;
}

export const likedPosts = async (files) => {
    const likedPosts = await read("likes/liked_posts.json", files);
    return likedPosts.likes_media_likes.length;
}

export const likedComments = async (files) => {
    const likedComments = await read("likes/liked_comments.json", files);
    return likedComments.likes_comment_likes.length;
}

export const devices = async (files) => {
    const devices = await read("device_information/devices.json", files);
    return devices.devices_devices.length;
}

export const firstStory = async (files) => {
    const personalInfo = await read("personal_information/account_information.json", files);
    return personalInfo.profile_account_insights[0].string_map_data["First Story Time"].timestamp;
}

export const personalInfo = async (files) => {
    const personalInfo = await read("personal_information/personal_information.json", files);
    const data = {
        username: decodeURIComponent(escape(personalInfo.profile_user[0].string_map_data.Username.value)),
        name: decodeURIComponent(escape(personalInfo.profile_user[0].string_map_data.Name.value)),
        bio: decodeURIComponent(escape(personalInfo.profile_user[0].string_map_data.Bio.value)),
        lastPFPUpdate: personalInfo.profile_user[0].media_map_data["Profile Photo"].creation_timestamp,
    }
    return data;
}