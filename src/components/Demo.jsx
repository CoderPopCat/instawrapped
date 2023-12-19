import React, { useEffect, useState } from 'react';
import { faker } from '@faker-js/faker';
import { Tooltip } from 'react-tooltip';
import LoadingBar from 'react-top-loading-bar'
import Leaderboard from './Leaderboard';
import FollowInfo from './FollowInfo';
import Posted from './Posted';
import Liked from './Liked';
import Relations from './Relations';
import Misc from './Misc';
import downloadScreenshot from '../downloadScreenshot';

function Demo() {
    const [result, setResult] = useState('');
    const [progress, setProgress] = useState(0);
    const topDMS = [];
    for (let i = 0; i<10; i++) {
        topDMS.push({
            "username": faker.internet.displayName().replace(/_/g, ' '),
            "count": 3000 + Math.floor(Math.random() * 9000),
            "myMessages": 2000 + Math.floor(Math.random() * 5000),
            "participants": 2
        })
    }
    const data = {
        "saved": 312,
        "totalComments": 2334,
        "totalDMS": 242,
        "topDMS": topDMS.sort((a, b) => b.count - a.count),
        "messagesSent": 65462,
        "messagesReceived": 35435,
        "storiesPosted": 232,
        "following": 4323,
        "followers": 7973,
        "firstFollower": faker.internet.userName(),
        "blocked": 11,
        "personalInfo": {
            "username": faker.internet.userName(),
            "name": "ℂ𝕠𝕠𝕝 𝕌𝕤𝕖𝕣",
            "bio": "- Programmer 💻\n- Nerd 🤓\n- Loves this app ♥",
            "lastPFPUpdate": 1672581865
        },
        "favoriteWords": [
            {
                "word": "what",
                "count": 10015
            },
            {
                "word": "lmao",
                "count": 1779
            },
            {
                "word": "like",
                "count": 1587
            },
            {
                "word": "good",
                "count": 1530
            },
            {
                "word": "just",
                "count": 1318
            },
            {
                "word": "real",
                "count": 1020
            },
            {
                "word": "then",
                "count": 977
            },
            {
                "word": "same",
                "count": 867
            },
            {
                "word": "only",
                "count": 858
            },
            {
                "word": "time",
                "count": 856
            }
        ],
        "closeFriends": 3,
        "storiesLiked": 2950,
        "likedPosts": 23071,
        "likedComments": 15100,
        "devices": 5,
        "firstStory": 1606752109
    };
    const generate = () => {
        setResult(data);
    }
    useEffect(() => {
        generate();
        setProgress(100);
    }, []);
    const blur = (classname) => {
        const el = document.querySelector(`.${classname}`);
        el.style.filter.includes('blur') ? el.style.filter = 'unset' : el.style.filter = 'blur(6px)';
    }
    return (
        <>
            <div id="theapp">
                <LoadingBar
                    color='#06f'
                    progress={progress}
                    onLoaderFinished={() => setProgress(0)}
                />
                <div className={`content ${result ? 'mt-[2vh]' : ''} mb-10 ${result ? 'px-[4%]' : ''}`}>
                    <h1 className='cursor-pointer'onClick={() => window.open("/", "_blank")}><span className={`text-[#06f]`}>I</span>nsta<span className='text-[#06f]'>W</span>rapped</h1>

                    {result && (
                        <div className="stats mt-3">
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-[1rem] lg:gap-[1.7rem] lg:mx-0">
                                <div className="stats-box lg:w-[33%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex justify-start">
                                    <div className="names m-3 text-left">
                                        <h2 className="text-[1.65rem]">{result.personalInfo.name}</h2>
                                        <p className="text-xl text-gray-300 mb-3 username-highlight"><span className="at">@</span>{result.personalInfo.username}</p>
                                        <div className="bio pt-3 border-t border-gray-600">{result.personalInfo.bio.split('\n').map((item, idx) => {
                                            return (
                                                <span key={idx}>
                                                    {item}
                                                    <br />
                                                </span>
                                            );
                                        })}</div>
                                    </div>
                                </div>
                                <div className="stats-box lg:w-[66%] lg:mx-0 lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex justify-start">
                                    <div className="stats-content m-3 text-left">
                                        <h2 className='text-[1.65rem] cursor-pointer' onClick={() => blur('favwords')}>
                                            Favorite Words
                                        </h2>
                                        <div className="stats-subcontainer mt-3 favwords">
                                            {result.favoriteWords.map((word, i) => {
                                                return (
                                                    <>
                                                        <Tooltip id={`word-count-${i}`} />
                                                        <span key={i} data-tooltip-id={`word-count-${i}`} data-tooltip-content={`Used ${word.count.toLocaleString()} Times!`} data-tooltip-float={false} data-tooltip-variant='dark' className="inline-block px-9 py-3 mb-2 mr-2 text-md font-semibold cursor-pointer text-gray-300 backdrop-blur-xl bg-[#ffffff0d] rounded-lg">{word.word}</span>
                                                    </>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-[1rem] lg:gap-[1.7rem] lg:mx-0">
                                <div className="stats-box mt-8 lg:w-[33%] lg:mx-0 lg:mt-4 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                                    <div className="stats-content m-3 lg:text-left text-center">
                                        <h2 className='text-[1.65rem] cursor-pointer' onClick={() => blur('conv')}>
                                            Total Conversations
                                        </h2>
                                        <div className="stats-subcontainer mt-3 conv">
                                            <h3 className="text-2xl text-gray-300 font-thin">{result.totalDMS.toLocaleString()}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="stats-box lg:w-[33%] lg:mx-0 lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                                    <div className="stats-content m-3 lg:text-left text-center">
                                        <h2 className='text-[1.65rem] cursor-pointer' onClick={() => blur('messagesSent')}>
                                            Messages Sent
                                        </h2>
                                        <div className="stats-subcontainer mt-3 messagesSent">
                                            <h3 className="text-2xl text-gray-300 font-thin">{result.messagesSent.toLocaleString()}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="stats-box lg:w-[33%] lg:mx-0 lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                                    <div className="stats-content m-3 lg:text-left text-center">
                                        <h2 className='text-[1.65rem] cursor-pointer' onClick={() => blur('received')}>
                                            Messages Received
                                        </h2>
                                        <div className="stats-subcontainer mt-3 received">
                                            <h3 className="text-2xl text-gray-300 font-thin">{result.messagesReceived.toLocaleString()}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-[1rem] mt-[1rem] lg:gap-[1.7rem] lg:mx-0">
                                <Leaderboard result={result} />
                                <div className="flex flex-col gap-[0.3rem] mb-10 w-[100%] lg:w-[66%]">
                                    <Liked result={result} />
                                    <Relations result={result} />
                                    <Posted result={result} />
                                    <FollowInfo result={result} />
                                    <Misc result={result} />
                                    <div className="buttons flex flex-col items-center justify-center lg:justify-normal lg:items-start lg:flex-row flex-wrap gap-5 mt-7 pt-4 border-t-[2px] border-gray-500 border-dashed">
                                        <Tooltip id='download' />
                                        <a data-tooltip-id='donate' data-tooltip-content="Download this information as .json [DO NOT SHARE WITH PEOPLE YOU DON'T TRUST]" data-tooltip-float={false} data-tooltip-variant='dark' class="hero-button" type="button"
                                            href={`data:text/json;charset=utf-8,${encodeURIComponent(
                                                JSON.stringify(result)
                                            )}`}
                                            download={`${result.personalInfo.username}.json`}
                                        >
                                            <span class="btn-text"><i className="far mr-2 fa-arrow-up-right-from-square"></i>Export .JSON</span>
                                        </a>
                                        <button onClick={() => downloadScreenshot(document.querySelector("html"), result.personalInfo.username.toString() + ".png")} href="https://ko-fi.com/popcatdev" target="_blank" class="hero-button">
                                            <span class="btn-text"><i className="far mr-2 fa-images"></i> Download As Img</span>
                                        </button>
                                        <Tooltip id='donate' />
                                        <a href="https://ko-fi.com/popcatdev" target="_blank" data-tooltip-id='donate' data-tooltip-content='Consider donating if you liked this project ;)' data-tooltip-float={false} data-tooltip-variant='dark' class="hero-button donate">
                                            <span class="btn-text"><i className="far mr-2 fa-dollar"></i>Donate</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Demo;