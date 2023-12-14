import React, { useState } from 'react';
import { Unzip, AsyncUnzipInflate } from "fflate";
import { getSaved, recentSearches, getComments, getStories, messages, getDMS, storiesPosted, following, followers, firstFollower, blocked, personalInfo } from '../functions';
import { Tooltip } from 'react-tooltip';

function Upload() {
    const [result, setResult] = useState('');
    const onUpload = (files) => {
        let uploaded = files[0]
        if (!uploaded) return alert('Please upload a file!');
        if (!uploaded.type) {
            if (uploaded[0] && uploaded[0].type) {
                uploaded = uploaded[0];
            } else {
                return alert('Please upload a file!');
            }
        }
        if (uploaded.type === "application/zip" ||
            uploaded.type === "application/x-zip-compressed") {
            console.log('zip file acquired!')
            async function startUpload() {
                const reader = new Unzip();
                reader.register(AsyncUnzipInflate);
                const files = [];
                reader.onfile = f => files.push(f);
                if (!uploaded.stream) return alert('This browser isn\'t supported, please try a different one!')
                const fileReader = uploaded.stream().getReader();
                while (true) {
                    const { done, value } = await fileReader.read();
                    if (done) {
                        reader.push(new Uint8Array(0), true);
                        break;
                    }
                    for (let i = 0; i < value.length; i += 65536) {
                        reader.push(value.subarray(i, i + 65536));
                    };
                }
                const filenames = files.map(f => f.name);
                console.log(files)
                if (!filenames.includes(`messages/`)) return alert('This file is not an Instagram data package!');
                async function extract(files, options) {
                    const data = {};
                    const { allDMS: allMessages, favWords } = await messages(files);
                    const leaderboard = allMessages.filter(u => u.participants < 3).sort((a, b) => b.count - a.count).slice(0, 10);
                    data.saved = await getSaved(files);
                    const searches = await recentSearches(files);
                    if (searches !== 0) data.recentSearches = searches;
                    data.totalComments = await getComments(files);
                    data.stories = await getStories(files);
                    data.totalDMS = getDMS(files).length;
                    data.topDMS = leaderboard;
                    data.messagesSent = allMessages.reduce((a, b) => a + b.myMessages, 0);
                    data.messagesReceived = allMessages.reduce((a, b) => a + b.count, 0) - data.messagesSent;
                    data.storiesPosted = await storiesPosted(files);
                    data.following = await following(files);
                    data.followers = await followers(files);
                    data.firstFollower = await firstFollower(files);
                    data.blocked = await blocked(files);
                    data.personalInfo = await personalInfo(files);
                    console.log(data)
                    data.favoriteWords = favWords;
                    setResult(data)
                }
                extract(files)
            }

            startUpload()
        } else {
            alert('wrong file type!')
        }
    }
    return (
        <>
            <div className={`content ${result ? 'mt-[2vh]' : ''} ${result ? 'px-[4%]' : ''}`}>
                <h1><span className={`text-[#06f]`}>I</span>nsta<span className='text-[#06f]'>W</span>rapped</h1>
                {!result && (<p className="text-xl"><a className="opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }} href="https://github.com/CoderPopCat/instawrapper">Open Source</a> Instagram Data Package Explorer</p>)}
                {!result && (<div className="flex justify-center items-center upload mt-[5vh]">
                    <div className="flex items-center justify-center w-[75%]">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#0b0c0d] bg-transparent border-gray-600" style={{ backdropFilter: 'blur(25px)' }}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-[gray-500] dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                <p className="mb-2 text-xl text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-lg mt-[-4px] text-gray-500 dark:text-gray-400">Accepted: .zip</p>
                            </div>
                            <input id="dropzone-file" type="file" accept=".zip" onChange={(e) => onUpload(e.target.files)} className="hidden" />
                        </label>
                    </div>
                </div>)}
                {result && (
                    <div className="stats">
                        <div className="block-1 lg:flex lg:justify-between gap-[2.5rem]">
                            <div className="stats-box lg:w-[33%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex justify-start">
                                <div className="names m-3 text-left">
                                    <h2 className="text-3xl">{result.personalInfo.name}</h2>
                                    <p className="text-xl text-gray-300 mb-3"><span className="at">@</span>{result.personalInfo.username}</p>
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
                            <div className="stats-box lg:w-[66%] lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex justify-start">
                                <div className="stats-content m-3 text-left">
                                    <h2 className='text-3xl'>
                                        Favorite Words
                                    </h2>
                                    <div className="fav-words mt-3">
                                        {result.favoriteWords.map((word, i) => {
                                            return (
                                                <>
                                                    <Tooltip id={`word-count-${i}`} />
                                                    <span key={i} data-tooltip-id={`word-count-${i}`} data-tooltip-content={`Used ${word.count} Times!`} data-tooltip-float={false} data-tooltip-variant='dark' className="inline-block px-9 py-3 mb-2 mr-2 text-md font-semibold cursor-pointer text-gray-300 backdrop-blur-xl bg-[#ffffff0d] rounded-lg">{word.word}</span>
                                                </>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Upload
