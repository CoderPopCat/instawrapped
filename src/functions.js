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

export const recentSearches = async (files) => {
    const recentSearches = await read("recent_searches/account_searches.json", files);
    if (!recentSearches.searches_user.length) return 0;
    return recentSearches.searches_user.map((search) => search.string_map_data.Search.value);
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

export const messages = async (files) => {
    const dms = getDMS(files);
    const allDMS = [];
    for (const dm of dms) {
        const messages = await read(`messages/inbox/${dm}/message_1.json`, files);
        for (let i = 2; i <= 4; i++) {
            const extra = await read(`messages/inbox/${dm}/message_${i}.json`, files);
            if (extra) messages.messages.push(...extra.messages);
        }
        if (messages.title) {
            allDMS.push({ username: decodeURIComponent(escape(messages.title.toString())), name: decodeURIComponent(escape(dm.toString())), count: messages.messages.length, myMessages: messages.messages.filter((message) => message.sender_name === messages.participants[1].name).length, participants: messages.participants.length })
        }
    };
    console.log(allDMS);
    return allDMS;
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