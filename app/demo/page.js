'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { OverView } from "../../components/OverView";
import { Profile } from "../../components/Profile";
import { Likes } from "../../components/Likes";
import { Followers } from '@/components/Followers';
import { OTD } from '@/components/OTD';
import { Messages } from '@/components/Messages';
import { ProfileTimeline } from '@/components/ProfileTimeline';
import { TopicsAds } from '@/components/TopicsAds';
import { Search } from '@/components/Search';

// ── helpers ──────────────────────────────────────────────────────────────────

function ts(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

// Seeded RNG (mulberry32) — keeps SSR and client output identical
function mulberry32(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);


// ── demo conversations ────────────────────────────────────────────────────────

const ME = 'alex_rivera';
const ME_DECODED = 'Alex Rivera';

// Build a session of back-and-forth exchanges starting at a base timestamp.
// Each exchange is [myMsg, theirMsg] — either can be null.
function session(otherName, baseMs, exchanges) {
  const msgs = [];
  let t = baseMs;
  for (const [mine, theirs] of exchanges) {
    t += 3 * 60 * 1000 + Math.floor(rand() * 12 * 60 * 1000); // 3–15 min between turns
    if (mine)   msgs.push({ sender_name: ME,        content: mine,   timestamp_ms: t });
    if (theirs) msgs.push({ sender_name: otherName, content: theirs, timestamp_ms: t + 60000 + Math.floor(rand() * 120000) });
    t += 60000;
  }
  return msgs;
}

// Date string → ms
const d = (s) => new Date(s).getTime();

function makeConvo({ username, name, participantsCount, participants, sessions }) {
  const all = sessions.flat().sort((a, b) => a.timestamp_ms - b.timestamp_ms);
  return {
    username, name, participantsCount,
    participants: participants ?? [{ name: ME }, { name: username }],
    participantName: ME,
    all, count: all.length, myMessages: all.filter(m => m.sender_name === ME).length,
  };
}

const dms = [
  makeConvo({
    username: 'Sofia Gomez', name: 'sofiagomez_official',
    participantsCount: 2,
    sessions: [
      session('Sofia Gomez', d('2023-04-03'), [
        ['hey! just followed you btw', 'omg thank you!! love your feed'],
        ['thanks 😊 your edits are insane', 'that means so much!!'],
      ]),
      session('Sofia Gomez', d('2023-07-19'), [
        ['are you going to the summer meetup?', 'yes!! so excited'],
        ['same, it\'s gonna be so fun', 'lowkey nervous but yeah'],
        ['don\'t be, everyone\'s so nice', 'that makes me feel better 🥹'],
      ]),
      session('Sofia Gomez', d('2023-10-08'), [
        ['ok your halloween reel 😭😭', 'LMAO I can\'t believe I posted that'],
        ['no it was iconic actually', 'you\'re too kind haha'],
        ['100% posting mine next week', 'send it to me first!!'],
      ]),
      session('Sofia Gomez', d('2024-02-14'), [
        ['happy valentines day bestie 💝', 'aww happy vday!! 🥰'],
        ['doing anything fun today?', 'just movies and takeout honestly'],
        ['that sounds perfect', 'right?? self care era'],
      ]),
      session('Sofia Gomez', d('2024-05-22'), [
        ['your photo dump just made my day', 'the beach ones came out so good'],
        ['the lighting was perfect', 'golden hour was on our side'],
        ['seriously put that on a canvas', 'haha maybe I will'],
      ]),
      session('Sofia Gomez', d('2024-09-14'), [
        ['did you get tickets to the show?', 'YES finally got through'],
        ['omg same!! we\'re going together?', 'obviously!! front section??'],
        ['we deserve it', '100% no debate'],
        ['so hyped', 'same this is gonna be so good'],
      ]),
      session('Sofia Gomez', d('2024-11-10'), [
        ['did you watch the game last night?', 'Yes!! insane ending omg'],
        ['that penalty was so wild', 'I literally screamed lol'],
        ['same 😭 my neighbours hate me', 'hahaha same honestly'],
        ['we should watch the next one together', "definitely, I'll bring snacks"],
        ['Deal! Saturday at mine?', 'perfect, see you then!'],
        ['also what snacks', 'chips, dip, maybe some cookies?'],
        ['perfect I\'ll handle drinks', 'love that for us ✨'],
      ]),
      session('Sofia Gomez', d('2025-01-01'), [
        ['HAPPY NEW YEAR!! 🎉🎉', 'HAPPY NEW YEAR bestie!!!! 🥳'],
        ['this year is gonna be our year', 'manifesting everything 🌟'],
        ['let\'s actually do the collab this year', 'yes!! putting it in the calendar rn'],
      ]),
      session('Sofia Gomez', d('2025-04-18'), [
        ['loved your spring dump!!', 'thank you!! the cherry blossoms were insane'],
        ['where was that??', 'the park near downtown, go before they\'re gone!!'],
        ['going this weekend for sure', 'yes!! bring the camera 📸'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Jake Turner', name: 'jaketurner_42',
    participantsCount: 2,
    sessions: [
      session('Jake Turner', d('2023-03-11'), [
        ['bro your photo dump is fire', 'thanks man, took forever to edit'],
        ['what preset do you use?', 'custom Lightroom one, I\'ll send it'],
        ['please yes 🙏', 'sending now'],
        ['you\'re the goat', 'haha anytime'],
      ]),
      session('Jake Turner', d('2023-06-28'), [
        ['did you see the new Sony lens?', 'yeah it\'s insane but the price 😭'],
        ['right?? highway robbery', 'saving up though ngl'],
        ['same bro, worth it', 'eventually lol'],
      ]),
      session('Jake Turner', d('2023-09-05'), [
        ['your portrait series is incredible', 'finally got the moody look right'],
        ['how long did that take', 'like 2 months of tweaking honestly'],
        ['the patience paid off', 'for sure'],
      ]),
      session('Jake Turner', d('2024-01-20'), [
        ['new year new camera body?', 'maybe if the budget allows lol'],
        ['treat yourself man', 'you\'re not wrong'],
        ['any shoots planned?', 'got a street series I want to do in spring'],
        ['let me know I\'m down to shoot together', 'definitely, I\'ll hit you up'],
      ]),
      session('Jake Turner', d('2024-04-07'), [
        ['dude the street series is incredible', 'appreciate it man, favourite project so far'],
        ['the black and white ones especially', 'those took forever to cull'],
        ['worth every hour', 'seriously thanks bro'],
      ]),
      session('Jake Turner', d('2024-09-22'), [
        ['these colours are insane', 'I spent like 3 hours on the tones alone'],
        ['it shows honestly', 'worth it though'],
        ['ok new goal: fix my editing', 'lmk if you need tips'],
        ['yes please', 'drop your VSCO handle too'],
        ['algorithm blessed your reel', 'finally lol'],
      ]),
      session('Jake Turner', d('2025-02-03'), [
        ['bro you hit 10k!!', 'I literally cried lol'],
        ['you deserve it so much', 'thank you man, this community is everything'],
        ['collab to celebrate?', 'let\'s do it, I\'ll DM you ideas'],
      ]),
      session('Jake Turner', d('2025-05-15'), [
        ['shoot this weekend?', 'yes!! what time'],
        ['golden hour so like 6pm?', 'perfect, the rooftop spot?'],
        ['exactly', 'see you there 📸'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Priya Nair', name: 'priya.nair',
    participantsCount: 2,
    sessions: [
      session('Priya Nair', d('2023-05-14'), [
        ['hey!! saw your comment on my reel, thank you 🥹', 'of course!! it was so good'],
        ['means a lot coming from you', 'your editing style is so unique'],
      ]),
      session('Priya Nair', d('2023-08-30'), [
        ['are you going to the creator event?', 'yes!! finally meeting people irl'],
        ['same I\'m so nervous lol', 'me too but excited'],
        ['we should find each other there', 'yes!! I\'ll save you a seat'],
      ]),
      session('Priya Nair', d('2023-12-31'), [
        ['happy new year!!', 'happy new year!! 🎉'],
        ['can\'t believe how fast this year went', 'right?? so much happened'],
        ['excited for what\'s next', 'same!! new year new content 💪'],
      ]),
      session('Priya Nair', d('2024-03-22'), [
        ['your vlog from Tokyo is everything', 'thank you!! it was such an amazing trip'],
        ['the food sections especially', 'I ate SO much lol'],
        ['worth it', 'every single bite'],
      ]),
      session('Priya Nair', d('2024-07-04'), [
        ['happy 4th!!', 'happy 4th!! doing anything fun?'],
        ['beach day with friends', 'perfect!! send photos 📸'],
        ['obviously', '🌊'],
      ]),
      session('Priya Nair', d('2024-10-19'), [
        ['loved your autumn aesthetic reel', 'the leaves were cooperating finally'],
        ['that location though', 'an hour drive but SO worth it'],
        ['dedication', 'always for the content lol'],
      ]),
      session('Priya Nair', d('2025-01-08'), [
        ['are you going to the meetup Friday?', "yes!! can't wait"],
        ["same, it's been forever", 'I know right, miss everyone'],
        ['text me when you arrive?', "will do, I'll save you a seat"],
        ['should we carpool?', 'yes! I can pick you up'],
        ['that would be amazing, 7pm?', 'perfect, I\'ll be there'],
        ['see you Friday!', 'can\'t wait 🎉'],
      ]),
      session('Priya Nair', d('2025-04-02'), [
        ['your spring series is stunning', 'finally got outside after winter lol'],
        ['the pastel tones are so good', 'I\'ve been obsessed with that palette'],
        ['collab when?', 'literally whenever, just say the word'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Carlos Mendes', name: 'carlosm_photo',
    participantsCount: 2,
    sessions: [
      session('Carlos Mendes', d('2023-06-10'), [
        ['hey can you review my portfolio?', 'of course, send the link'],
        ['https://carlosphoto.com', 'this is honestly stunning'],
        ['thanks so much, any tips?', 'the lighting in set 3 is perfect'],
      ]),
      session('Carlos Mendes', d('2023-09-17'), [
        ['thinking of adding a blog section', 'do it, your behind-the-scenes stuff would be great'],
        ['good call, maybe next month', 'let me know when it\'s live'],
        ['will do! thanks again', 'anytime ✌️'],
      ]),
      session('Carlos Mendes', d('2024-01-05'), [
        ['blog is live!!', 'yes!! reading it now'],
        ['the first post got way more views than expected', 'you\'re a great writer honestly'],
        ['stop you\'re making me blush', 'facts only'],
      ]),
      session('Carlos Mendes', d('2024-05-20'), [
        ['that wedding shoot was incredible', 'the couple was so photogenic it helped a lot'],
        ['the candid moments especially', 'those are always my favourites'],
        ['you have such a good eye for them', 'years of practice 📸'],
      ]),
      session('Carlos Mendes', d('2024-07-15'), [
        ['that was my favourite shoot too', 'the golden hour ones are 🔥'],
        ['the blog post about it got 10k reads', 'no way!!'],
        ['yes!! congrats', 'wild, thank you for the push to do the blog'],
      ]),
      session('Carlos Mendes', d('2024-11-28'), [
        ['portfolio refresh looking clean', 'finally updated it after like a year lol'],
        ['the new layout is way better', 'easier to navigate right?'],
        ['much cleaner', 'appreciate the feedback always'],
      ]),
      session('Carlos Mendes', d('2025-03-14'), [
        ['your film shots are insane', 'finally got into analog, no going back'],
        ['the grain is so good', 'it\'s addictive honestly'],
        ['what film stock?', 'Portra 400, it\'s perfect'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Emma Chen', name: 'emma.chen.art',
    participantsCount: 2,
    sessions: [
      session('Emma Chen', d('2023-08-05'), [
        ['your art is incredible!!', 'thank you so much 🥹'],
        ['the colour theory in your latest piece', 'I obsess over palettes way too much lol'],
        ['it shows in the best way', '💙'],
      ]),
      session('Emma Chen', d('2023-11-12'), [
        ['loved your process video', 'it took me so long to finally film one'],
        ['so glad you did', 'way more people watched than I expected'],
        ['your process is so satisfying to watch', 'thank you!! that means a lot'],
      ]),
      session('Emma Chen', d('2024-03-01'), [
        ['spring collection when?', 'I\'m working on it!!'],
        ['can\'t wait', 'the colour palette is so good this time'],
        ['any sneak peeks?', 'check your DMs 👀'],
        ['EMMA this is stunning', 'eek thank you!! still nervous to post'],
        ['post it!!! people will love it', 'ok ok you convinced me'],
      ]),
      session('Emma Chen', d('2024-07-22'), [
        ['the spring collection blew up!!', 'I still can\'t believe it honestly'],
        ['you deserved every single like', 'your support means everything to me'],
        ['always!! collab soon?', 'yes please I\'ve been thinking the same thing'],
      ]),
      session('Emma Chen', d('2024-11-03'), [
        ['your autumn illustration is my wallpaper now', 'stop that\'s so sweet 🥺'],
        ['the texture on the leaves', 'that took like 6 layers in Procreate'],
        ['it shows, absolutely worth it', 'thank you for always hyping me up'],
      ]),
      session('Emma Chen', d('2025-02-14'), [
        ['loved your story today!', 'aw thank you!! means a lot'],
        ['the colour palette was so good', 'I\'ve been experimenting a lot lately'],
        ['the collab idea sounds fun btw', 'yes we should plan it properly'],
        ['maybe something for spring?', 'botanical gardens?'],
        ['exactly what I was thinking!', 'let\'s lock in a date'],
        ['how about late March?', 'works for me, pencilling it in 🌸'],
      ]),
      session('Emma Chen', d('2025-05-02'), [
        ['the collab photos are everything', 'I\'m so happy with how they turned out'],
        ['the botanical garden was perfect', 'right?? we need to go back'],
        ['round 2 this autumn?', 'already looking forward to it'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Liam Foster', name: 'liamfoster_dev',
    participantsCount: 2,
    sessions: [
      session('Liam Foster', d('2023-04-20'), [
        ['bro did you see the Next.js 13 release?', 'yes!! the app router is wild'],
        ['game changer honestly', 'going to be migrating everything'],
        ['same, this weekend probably', 'let\'s compare notes after'],
      ]),
      session('Liam Foster', d('2023-07-15'), [
        ['finished the migration', 'how was it?'],
        ['painful but worth it', 'lol same experience here'],
        ['the new data fetching is so much cleaner', '100% no going back'],
      ]),
      session('Liam Foster', d('2023-10-30'), [
        ['hackathon this weekend?', 'in!! what are we building'],
        ['AI powered recipe app?', 'actually kind of genius'],
        ['let\'s do it, starting Friday night?', 'I\'ll bring coffee'],
        ['essential', '☕'],
      ]),
      session('Liam Foster', d('2024-02-08'), [
        ['open source project ideas?', 'I\'ve been thinking about a dev tools thing'],
        ['go on', 'like a CLI tool for managing env files'],
        ['that would actually be really useful', 'right?? I keep forgetting which vars go where'],
        ['let\'s build it', 'repo created, adding you now'],
      ]),
      session('Liam Foster', d('2024-06-14'), [
        ['the CLI tool hit 500 stars!!', 'NO WAY that\'s insane'],
        ['we shipped something people actually use', 'feels so good'],
        ['first public project that took off for me', 'same honestly'],
        ['blog post about the journey?', 'already writing it lol'],
      ]),
      session('Liam Foster', d('2024-12-03'), [
        ['did you see the new framework?', 'yeah it looks interesting'],
        ['we should build something with it', 'totally, weekend project?'],
        ['yes!! a local-first notes app', 'oh that\'s actually sick'],
        ['repo created, added you', 'on it, pushing something tonight'],
        ['legend', '🫡'],
      ]),
      session('Liam Foster', d('2025-03-22'), [
        ['notes app has 200 users now', 'started as a weekend thing 😭'],
        ['we should add collaboration features', 'yes!! been thinking the same'],
        ['v2 planning doc?', 'on it, check Notion'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Anika Patel', name: 'anika.patel',
    participantsCount: 2,
    sessions: [
      session('Anika Patel', d('2023-04-22'), [
        ['happy birthday!! 🎉', 'thank you so much!! 🥹'],
        ['hope you have the best day', 'this made my morning ❤️'],
        ['we need to celebrate properly', 'yes dinner this weekend?'],
        ['100%! you pick the place', 'the new Italian on 5th?'],
        ['can\'t wait 🎂', 'me neither 🥰'],
      ]),
      session('Anika Patel', d('2023-08-19'), [
        ['your summer looks are so good', 'thank you!! finally found my style I think'],
        ['the linen set in the last post', 'right?? it was £15 from a thrift store'],
        ['no way!!', 'I know!! thrift always wins'],
      ]),
      session('Anika Patel', d('2023-12-15'), [
        ['gift guide reel is so helpful!', 'hope it actually helps people lol'],
        ['I just bought three things from it', 'omg you\'re the best'],
        ['gifting genius tbh', 'I take this very seriously'],
      ]),
      session('Anika Patel', d('2024-04-22'), [
        ['happy birthday again!!', 'thank you bestie!! 🎂'],
        ['last year\'s birthday dinner was so fun', 'we need to top it this year'],
        ['rooftop restaurant?', 'say less I\'m booking rn'],
      ]),
      session('Anika Patel', d('2024-09-10'), [
        ['your autumn wardrobe content is so good', 'cosy season is my favourite to film'],
        ['the knitwear haul especially', 'I have a problem honestly'],
        ['not a problem, a passion', 'love that reframe lol'],
      ]),
      session('Anika Patel', d('2025-01-28'), [
        ['new year new content goals?', 'focusing on longer form this year'],
        ['great call, your long videos do so well', 'yeah comments are so much deeper'],
        ['newsletter next?', 'maybe!! been thinking about it'],
      ]),
      session('Anika Patel', d('2025-05-08'), [
        ['your podcast episode was so good!!', 'ahhh thank you!!!! I was so nervous'],
        ['you sounded so natural', 'I literally rehearsed it 4 times'],
        ['it paid off!!', '🥹 thank you for always listening'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Marcus Webb', name: 'mwebb_fitness',
    participantsCount: 2,
    sessions: [
      session('Marcus Webb', d('2023-05-08'), [
        ['gym tomorrow?', "let's go, 7am?"],
        ['deal', 'see you there 💪'],
      ]),
      session('Marcus Webb', d('2023-08-14'), [
        ['don\'t be late this time lol', 'I\'m ALWAYS on time'],
        ['you were 15 mins late last week', '...traffic'],
        ['sure sure', 'ok fine 7:05'],
        ['I\'ll allow it', '😂'],
      ]),
      session('Marcus Webb', d('2023-11-20'), [
        ['new PR on deadlifts today', 'LETS GO!! what weight?'],
        ['180kg finally', 'bro that\'s massive'],
        ['couldn\'t have done it without the training block', 'that program is no joke'],
      ]),
      session('Marcus Webb', d('2024-02-05'), [
        ['leg day or push?', 'push, legs are still dead'],
        ['same honestly', 'we went too hard Tuesday'],
        ['no regrets', 'no regrets 💪'],
        ['protein shake after?', 'obviously, the usual spot'],
      ]),
      session('Marcus Webb', d('2024-05-27'), [
        ['marathon training going well?', 'week 6, feeling good'],
        ['pace?', 'hitting 5:30 per km which is a pr for me'],
        ['you\'re going to crush it', 'hopefully!! nerves are real'],
        ['you\'ve put in the work', 'true, thank you bro'],
      ]),
      session('Marcus Webb', d('2024-09-01'), [
        ['you finished the marathon!!', 'I CRIED AT THE FINISH LINE'],
        ['3:52, that\'s incredible', 'beat my goal by 8 minutes'],
        ['that\'s what the early gym sessions were for', 'exactly, worth every 6am alarm'],
      ]),
      session('Marcus Webb', d('2025-03-01'), [
        ['gym this week?', 'yes!! missed last week, need to get back'],
        ['same, got lazy over the holidays', 'classic'],
        ['Tuesday 7am?', 'locked in 💪'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Zoe Kim', name: 'zoekim.creates',
    participantsCount: 2,
    sessions: [
      session('Zoe Kim', d('2023-06-02'), [
        ['your GRWM video is so fun', 'thank you!! it was so out of my comfort zone'],
        ['you should do more!!', 'maybe!! the engagement was actually good'],
        ['people love your energy', 'that\'s so kind 🥹'],
      ]),
      session('Zoe Kim', d('2023-09-18'), [
        ['podcast recommendation?', 'my current fave is Ologies'],
        ['I\'ve been meaning to start that one', 'do it!! every episode is fascinating'],
        ['ok starting today', 'you\'re going to love it'],
      ]),
      session('Zoe Kim', d('2024-01-14'), [
        ['new year new era for your content?', 'trying to be more consistent this year'],
        ['posting schedule?', 'aiming for twice a week'],
        ['you\'ve got this', 'thank you for believing in me 🥺'],
      ]),
      session('Zoe Kim', d('2024-04-29'), [
        ['your skincare routine reel went viral', 'I literally can\'t believe it'],
        ['the comment section is so wholesome', 'everyone is so sweet'],
        ['you made something people needed', '😭 thank you'],
      ]),
      session('Zoe Kim', d('2024-07-12'), [
        ['summer series is so good', 'I\'m having so much fun filming it'],
        ['the beach vlog especially', 'that day was perfect'],
        ['you captured it so well', 'thank you!! means a lot from you'],
      ]),
      session('Zoe Kim', d('2024-10-30'), [
        ['your reel got 50k views!!', 'WHAT no way'],
        ['check your insights', "omg I'm shaking"],
        ['you deserve it so much', 'I can\'t believe it'],
        ['algorithm said yes bestie', '😭😭 thank you for telling me'],
        ['obviously!! proud of you 🫶', 'you\'re the sweetest'],
      ]),
      session('Zoe Kim', d('2025-02-20'), [
        ['brand deal secured??', 'I KNOW I\'m still in shock'],
        ['you worked so hard for this', 'honestly couldn\'t have done it without the support'],
        ['you did this yourself!', 'we did it 🥹'],
      ]),
      session('Zoe Kim', d('2025-05-11'), [
        ['100k!!!', '100K I\'M SCREAMING'],
        ['I was there from 200 followers', 'you\'ve been here forever and I love you'],
        ['most deserved milestone', '🎉🎉 thank you for everything'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Ryan Park', name: 'ryanpark.jpg',
    participantsCount: 2,
    sessions: [
      session('Ryan Park', d('2023-03-25'), [
        ['yo your editing tutorial saved my life', 'haha glad it helped!!'],
        ['what app do you use for reels?', 'CapCut mostly, some Premiere for longer stuff'],
        ['makes sense, thanks bro', 'anytime!!'],
      ]),
      session('Ryan Park', d('2023-06-18'), [
        ['did you try the new CapCut update?', 'yes!! the AI features are wild'],
        ['the background remover is actually good now', 'right?? finally'],
        ['game changer for quick edits', 'I\'ve been using it non stop'],
      ]),
      session('Ryan Park', d('2023-10-04'), [
        ['your cinematic vlog style is so clean', 'appreciate it man, took ages to develop'],
        ['the transitions are so smooth', 'lots of failed attempts before lol'],
        ['can\'t even tell', 'that\'s the goal honestly'],
      ]),
      session('Ryan Park', d('2024-01-29'), [
        ['new lens?', 'yeah finally got the 35mm'],
        ['that\'s my favourite focal length', 'it\'s so versatile'],
        ['you\'re going to love it', 'already obsessed tbh'],
      ]),
      session('Ryan Park', d('2024-05-11'), [
        ['travel content from Japan looked amazing', 'best trip of my life honestly'],
        ['the street photography ones especially', 'Tokyo is a photographer\'s dream'],
        ['adding it to the list', 'go!! you won\'t regret it'],
      ]),
      session('Ryan Park', d('2024-08-23'), [
        ['beach shoot collab?', 'yes!! when are you thinking'],
        ['end of September before it gets cold', 'perfect, I\'ll block it off'],
        ['golden hour?', 'obviously, nothing else'],
        ['locked in 📸', '🔥'],
      ]),
      session('Ryan Park', d('2024-12-20'), [
        ['happy holidays!!', 'happy holidays!! hope you have a great one'],
        ['year in review — thoughts?', 'honestly one of my best years creatively'],
        ['same, the growth has been real', 'grateful for this community'],
        ['for real', '🙏'],
      ]),
      session('Ryan Park', d('2025-04-05'), [
        ['your spring series is 🔥', 'thank you!! finally getting consistent'],
        ['twice a week is such a good cadence', 'it\'s tough but worth it'],
        ['keep going bro', 'appreciate the support always'],
      ]),
    ],
  }),

  makeConvo({
    username: 'Dev Squad 🔥', name: 'dev_squad_group',
    participantsCount: 5,
    participants: [{ name: ME }, { name: 'Liam Foster' }, { name: 'Jake Turner' }, { name: 'Carlos Mendes' }, { name: 'Priya Nair' }],
    sessions: [
      session('Liam Foster', d('2023-05-12'), [
        ['anyone free for a call tonight?', null],
        [null, "I'm in"],
        ['same, 9pm?', null],
        [null, 'works for me'],
        ['let\'s do it', null],
      ]),
      session('Liam Foster', d('2023-08-19'), [
        ['anyone free for a call?', null],
        [null, "I'm in"],
        ['same, joining in 5', null],
        [null, 'what are we building?'],
        ['new portfolio site for the squad', null],
        [null, 'finally 🙌'],
        ['I\'ll set up the repo', null],
        [null, 'Figma file already started'],
        ['legend', null],
        [null, 'let\'s ship this weekend'],
        ['let\'s gooo', null],
      ]),
      session('Liam Foster', d('2023-11-25'), [
        ['portfolio site is live!!', null],
        [null, 'LETS GOOO 🎉'],
        ['looks incredible', null],
        [null, 'the team page especially'],
        ['we actually shipped it', null],
        [null, 'W squad'],
      ]),
      session('Liam Foster', d('2024-03-07'), [
        ['hackathon ideas?', null],
        [null, 'AI something'],
        ['AI code reviewer?', null],
        [null, 'actually that\'s good'],
        ['let\'s do it', null],
        [null, 'weekend of the 15th?'],
        ['locked in', null],
      ]),
      session('Liam Foster', d('2024-07-20'), [
        ['hackathon project got 3rd place!!', null],
        [null, 'YESSSS'],
        ['we almost won with no sleep', null],
        [null, 'most fun I\'ve had in ages'],
        ['same honestly', null],
        [null, 'round 2 next year?'],
        ['obviously', null],
      ]),
      session('Liam Foster', d('2024-11-09'), [
        ['squad meetup when?', null],
        [null, 'overdue honestly'],
        ['December?', null],
        [null, 'yes!! before everyone goes home for the holidays'],
        ['let\'s plan it this week', null],
        [null, 'I\'ll make a group doc'],
      ]),
      session('Liam Foster', d('2025-02-14'), [
        ['open source project?', null],
        [null, 'been thinking the same thing'],
        ['something actually useful', null],
        [null, 'dev tool? design tool?'],
        ['dev tool, let\'s stay in our lane', null],
        [null, '🫡 repo time'],
      ]),
      session('Liam Foster', d('2025-05-01'), [
        ['squad check in — everyone good?', null],
        [null, 'thriving'],
        ['living the dream', null],
        [null, 'getting there 💪'],
        ['that\'s all we can ask for', null],
        [null, 'love this group 🫶'],
      ]),
    ],
  }),
];

// ── heatmap data (2023-2025) ──────────────────────────────────────────────────

function generateHeatmap() {
  const map = {};
  const start = new Date('2023-01-01');
  const end = new Date('2025-06-23');
  const cur = new Date(start);
  while (cur <= end) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    const base = rand();
    const count = base > 0.35 ? Math.floor(base * 28) : 0;
    if (count) map[key] = count;
    cur.setDate(cur.getDate() + 1);
  }
  // spike a few famous dates
  map['2024-02-14'] = 45;
  map['2024-11-10'] = 38;
  map['2025-01-01'] = 52;
  map['2024-06-15'] = 34;
  return map;
}

const popularDayDates = generateHeatmap();

// ── popular times / days / months ─────────────────────────────────────────────

const popularTimes = {
  0: 12, 1: 8, 2: 5, 3: 3, 4: 2, 5: 4, 6: 18, 7: 42, 8: 87, 9: 134,
  10: 156, 11: 178, 12: 212, 13: 198, 14: 167, 15: 143, 16: 189, 17: 234,
  18: 287, 19: 312, 20: 345, 21: 298, 22: 187, 23: 76,
};

const popularDays = {
  Sunday: 1234, Monday: 987, Tuesday: 876, Wednesday: 1102,
  Thursday: 934, Friday: 1456, Saturday: 1678,
};

const popularMonths = {
  'Jan-2023': 234, 'Feb-2023': 198, 'Mar-2023': 312, 'Apr-2023': 267, 'May-2023': 345,
  'Jun-2023': 289, 'Jul-2023': 378, 'Aug-2023': 412, 'Sep-2023': 356, 'Oct-2023': 423,
  'Nov-2023': 398, 'Dec-2023': 445, 'Jan-2024': 389, 'Feb-2024': 412, 'Mar-2024': 467,
  'Apr-2024': 501, 'May-2024': 534, 'Jun-2024': 478, 'Jul-2024': 523, 'Aug-2024': 589,
  'Sep-2024': 612, 'Oct-2024': 578, 'Nov-2024': 634, 'Dec-2024': 523,
  'Jan-2025': 498, 'Feb-2025': 512, 'Mar-2025': 489, 'Apr-2025': 534,
  'May-2025': 512, 'Jun-2025': 387,
};

// ── liked posts ────────────────────────────────────────────────────────────────

const likedPostAuthors = [
  'natgeo', 'nasa', '9gag', 'architecturaldigest', 'humansofny',
  'designinspiration', 'dribbble', 'awwwards', 'producthunt', 'devdotto',
];

const likedPosts = Array.from({ length: 3847 }, (_, i) => ({
  title: likedPostAuthors[i % likedPostAuthors.length],
  string_list_data: [{
    href: `https://instagram.com/p/example${i}`,
    timestamp: ts('2023-01-01') + Math.floor(rand() * 2 * 365 * 86400),
  }],
}));

const likedComments = Array.from({ length: 912 }, (_, i) => ({
  string_list_data: [{
    href: `https://instagram.com/p/c${i}`,
    timestamp: ts('2023-06-01') + Math.floor(rand() * 1.5 * 365 * 86400),
  }],
}));

const topLikedAccounts = [
  { username: 'natgeo', count: 623 },
  { username: 'nasa', count: 487 },
  { username: '9gag', count: 412 },
  { username: 'architecturaldigest', count: 356 },
  { username: 'humansofny', count: 298 },
  { username: 'designinspiration', count: 276 },
  { username: 'dribbble', count: 234 },
  { username: 'awwwards', count: 198 },
  { username: 'producthunt', count: 167 },
  { username: 'devdotto', count: 145 },
];

const likedStoriesList = Array.from({ length: 1204 }, (_, i) => ({
  title: likedPostAuthors[i % likedPostAuthors.length],
  string_list_data: [{ timestamp: ts('2023-03-01') + Math.floor(rand() * 2 * 365 * 86400) }],
}));

const topLikedStoryAccounts = likedPostAuthors.map((u, i) => ({
  username: u,
  count: 180 - i * 15,
}));

// ── followers ─────────────────────────────────────────────────────────────────

const followerNames = [
  'sofia_g', 'jaketurner_42', 'priya.nair', 'carlosm_photo', 'emma.chen.art',
  'liam.foster', 'anika_patel', 'marcus_webb', 'zoe.kim', 'ryan_photo',
  'thecreativelab', 'designhunter', 'pixelcraft', 'buildwithcode', 'nightowlstudio',
  'sunsetlens', 'urbanframe', 'minimalvibes', 'colortheory', 'abstractmind',
];

const followersList = followerNames.map((u, i) => ({
  username: u,
  timestamp: ts('2020-03-01') + i * 30 * 86400,
}));

const followingNames = [
  'sofia_g', 'jaketurner_42', 'priya.nair', 'carlosm_photo', 'emma.chen.art',
  'liam.foster', 'anika_patel', 'marcus_webb', 'natgeo', 'nasa',
  '9gag', 'architecturaldigest', 'humansofny', 'designinspiration', 'dribbble',
  'awwwards', 'producthunt', 'devdotto', 'creativeboom', 'behance',
  'ghostonly', 'darkaccount', 'lurker99',
];

const followingList = followingNames.map((u, i) => ({
  username: u,
  timestamp: ts('2020-04-01') + i * 25 * 86400,
}));

const followerSet = new Set(followerNames);
const followingSet = new Set(followingNames);

const notFollowingBack = [...followingSet].filter(u => !followerSet.has(u));
const notFollowedBack = [...followerSet].filter(u => !followingSet.has(u));

// ── profile changes ────────────────────────────────────────────────────────────

const profileChanges = [
  { changed: 'Username', prev: 'alexrivera99', next: 'alex_rivera', timestamp: ts('2021-08-12') },
  { changed: 'Bio', prev: 'Just vibing', next: '📸 photography · ☕ coffee · building things', timestamp: ts('2022-03-05') },
  { changed: 'Profile Photo', prev: '', next: 'Updated', timestamp: ts('2023-01-20') },
  { changed: 'Website', prev: '', next: 'https://alexrivera.dev', timestamp: ts('2023-06-11') },
  { changed: 'Name', prev: 'Alex R', next: 'Alex Rivera', timestamp: ts('2024-02-28') },
];

// ── pfp data URL (gradient avatar) ────────────────────────────────────────────

function makePfpDataUrl() {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 72;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 72, 72);
  grad.addColorStop(0, '#0066ff');
  grad.addColorStop(0.5, '#833ab4');
  grad.addColorStop(1, '#e1306c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 72, 72);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', 36, 37);
  return canvas.toDataURL('image/png');
}

// ── top words ─────────────────────────────────────────────────────────────────

const topWords = [
  { word: 'coffee', count: 312 },
  { word: 'honestly', count: 287 },
  { word: 'amazing', count: 256 },
  { word: 'project', count: 234 },
  { word: 'weekend', count: 198 },
  { word: 'literally', count: 187 },
  { word: 'photography', count: 165 },
  { word: 'design', count: 154 },
  { word: 'building', count: 143 },
  { word: 'portfolio', count: 132 },
  { word: 'creative', count: 121 },
  { word: 'vibes', count: 112 },
  { word: 'coding', count: 98 },
  { word: 'travel', count: 89 },
  { word: 'cinema', count: 78 },
];

// ── comment list ──────────────────────────────────────────────────────────────

const commentsList = Array.from({ length: 234 }, (_, i) => ({
  media_list_data: [],
  string_list_data: [{
    href: `https://instagram.com/p/cmt${i}`,
    value: ['Great shot!', 'Love this!', 'Amazing ✨', 'Fire 🔥', 'Incredible work'][i % 5],
    timestamp: ts('2023-01-01') + Math.floor(rand() * 2 * 365 * 86400),
  }],
}));

// ── ads ───────────────────────────────────────────────────────────────────────

const adsViewedList = Array.from({ length: 1781 }, (_, i) => ({
  author: ['Nike', 'Apple', 'Spotify', 'Adobe', 'Figma', 'Notion', 'Vercel', 'Raycast', 'Linear', 'Arc'][i % 10],
  timestamp: ts('2023-06-01') + Math.floor(rand() * 2 * 365 * 86400),
}));

const advertisers = [
  'Nike', 'Apple', 'Spotify', 'Adobe', 'Figma', 'Notion', 'Vercel', 'Raycast',
  'Linear', 'Arc Browser', 'Anthropic', 'GitHub', 'Tailwind UI', 'PlanetScale',
  'Supabase', 'Cloudflare', 'Stripe', 'Loom', 'Framer', 'Webflow',
];

const metaCategories = [
  'Technology & Computing', 'Software (General)', 'Photography',
  'Design & Creative', 'Coffee & Cafes', 'Travel',
  'Architecture', 'Fitness & Wellness',
];

const interests = [
  'Photography', 'Design', 'Coffee', 'Travel', 'Technology',
  'Architecture', 'Cinema', 'Coding', 'Fitness', 'Music',
  'Street Photography', 'UI Design', 'Web Development', 'Minimalism',
];

const offMetaTrackers = [
  { title: 'dribbble.com', events: 87 },
  { title: 'figma.com', events: 74 },
  { title: 'behance.net', events: 63 },
  { title: 'awwwards.com', events: 58 },
  { title: 'github.com', events: 45 },
  { title: 'vercel.com', events: 39 },
  { title: 'producthunt.com', events: 34 },
];

// ── assembled demo data ────────────────────────────────────────────────────────

const DEMO_DATA = {
  // messages
  allMessages: dms,
  topDMS: [...dms].filter(d => d.participantsCount === 2).sort((a, b) => b.count - a.count).slice(0, 10),

  // time analytics
  popularTimes,
  popularDays,
  popularMonths,
  popularDayDates,
  mostActiveDate: '2025-01-01',
  mostActiveMonth: 'Dec 2024',
  avgMessagesPerDay: 8.4,

  // words
  topWords,

  // followers
  following: followingNames.length,
  followers: followerNames.length,
  firstFollower: 'sofia_g',
  mutual: [...followerSet].filter(u => followingSet.has(u)).length,
  blocked: 3,
  closeFriends: 5,
  unfollowed: [
    { username: 'old_friend_123', time: ts('2024-01-15') },
    { username: 'random_follow', time: ts('2023-11-03') },
    { username: 'brand_spam', time: ts('2023-08-22') },
  ],
  notFollowingBack,
  notFollowedBack,
  followersList,
  followingList,

  // likes
  likedPosts,
  likedComments,
  topLikedAccounts,
  likedStories: likedStoriesList.length,
  likedStoriesList,
  topLikedStoryAccounts,
  saved: 412,

  // activity
  totalStoriesPosted: 287,
  commentsPosted: commentsList.length,
  commentsList,
  lastPfpUpdate: ts('2023-01-20'),
  connectedDevices: 2,
  firstStory: ts('2020-09-15'),

  // profile
  rawName: ME,
  username: ME,
  name: ME_DECODED,
  bio: '📸 photography · ☕ coffee · building things',
  emojiPong: '42',
  pfpUrl: null, // generated client-side in component
  email: 'alex@example.com',
  dateOfBirth: 'January 5, 2000',
  gender: 'Prefer not to say',
  website: 'https://alexrivera.dev',
  privateAccount: 'false',
  dateJoined: ts('2019-07-12'),
  profileChanges,

  // topics & ads
  interests,
  adsViewed: adsViewedList,
  advertisers,
  optedOutOfMetaAds: false,
  metaCategories,
  locationsInterest: ['New York, NY', 'Los Angeles, CA', 'Tokyo, Japan', 'London, UK'],
  phoneOnFile: '+1 (555) 000-0000',
  basedIn: { country: 'United States', region: 'New York', city: 'Brooklyn' },
  offMetaTrackers,
};

// ── page ──────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [pendingConvo, setPendingConvo] = useState(null);

  const [pfpUrl, setPfpUrl] = useState(null);
  useEffect(() => { setPfpUrl(makePfpDataUrl()); }, []);

  const data = { ...DEMO_DATA, pfpUrl };

  return (
    <SidebarProvider>
      <AppSidebar data={data} activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-[#333] sticky top-0 z-10" style={{ background: '#0d0f12' }}>
          <SidebarTrigger />
          <span className="cursor-pointer sidebar-head text-center text-3xl">
            <span className="text-[#06f] font-inter">I</span>nsta<span className="text-[#06f] font-inter">W</span>rapped
          </span>
          <span className="ml-auto text-xs px-2 py-1 rounded-full font-semibold" style={{ background: '#0066ff22', color: '#06f', border: '1px solid #0066ff44' }}>
            Demo
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden">
          {activeSection === 'overview'   && <OverView data={data} />}
          {activeSection === 'followers'  && <Followers data={data} />}
          {activeSection === 'profile'    && <Profile data={data} />}
          {activeSection === 'likes'      && <Likes data={data} />}
          {activeSection === 'onthisday'  && <OTD data={data} />}
          {activeSection === 'messages'   && (
            <Messages
              data={data}
              pendingConvo={pendingConvo}
              onPendingConvoHandled={() => setPendingConvo(null)}
            />
          )}
          {activeSection === 'timeline'   && <ProfileTimeline data={data} />}
          {activeSection === 'topics'     && <TopicsAds data={data} />}
          {activeSection === 'search'     && (
            <Search
              data={data}
              onOpenConvo={(name, term) => {
                setActiveSection('messages');
                setPendingConvo({ name, term });
              }}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
