import React, { useState } from 'react';
import { Unzip, AsyncUnzipInflate } from "fflate";
import { getSaved, getComments, messages, getDMS, storiesPosted, following, followers, firstFollower, blocked, personalInfo, closeFriends, storiesLiked, likedPosts, likedComments, devices, firstStory } from '../functions';
import { Tooltip } from 'react-tooltip';
import LoadingBar from 'react-top-loading-bar'
import Leaderboard from './Leaderboard';
import FollowInfo from './FollowInfo';
import Posted from './Posted';
import Liked from './Liked';
import Relations from './Relations';
import Misc from './Misc';
import downloadScreenshot from '../downloadScreenshot';
import { useEffect } from 'react';

function Upload() {
    const [result, setResult] = useState('');
    const [progress, setProgress] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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
            console.log('zip file acquired!');
            setLoading(true);
            setProgress(progress + 20)
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
                if (!filenames.includes('personal_information/')) return alert("Invalid Instagram Data Package!")
                async function extract(files, options) {
                    const data = {};
                    const { allDMS: allMessages, favWords } = await messages(files);
                    const leaderboard = allMessages.filter(u => u.participants < 3).sort((a, b) => b.count - a.count).slice(0, 10);
                    data.saved = await getSaved(files);
                    data.totalComments = await getComments(files);
                    data.totalDMS = getDMS(files).length;
                    data.topDMS = leaderboard;
                    data.messagesSent = allMessages.reduce((a, b) => a + b.myMessages, 0);
                    data.messagesReceived = allMessages.reduce((a, b) => a + b.count, 0) - data.messagesSent;
                    data.storiesPosted = await storiesPosted(files);
                    data.following = await following(files);
                    data.followers = await followers(files);
                    data.firstFollower = await firstFollower(files);
                    data.blocked = await blocked(files);
                    data.favoriteWords = favWords;
                    data.closeFriends = await closeFriends(files);
                    data.storiesLiked = await storiesLiked(files);
                    data.likedPosts = await likedPosts(files);
                    data.likedComments = await likedComments(files);
                    data.devices = await devices(files);
                    data.firstStory = await firstStory(files);
                    data.personalInfo = await personalInfo(files);
                    const { topDMS, ...rest } = data;
                    window.downloadable = { ...rest, topDMS: topDMS.map(({ all, participants, ...others }) => others) };
                    setResult(data)
                    setLoading(false);
                }
                extract(files)
            }

            startUpload();
            setProgress(100);
            setOpen(false);
        } else {
            alert('wrong file type!')
        }
    }
    const blur = (classname) => {
        const el = document.querySelector(`.${classname}`);
        el.style.filter.includes('blur') ? el.style.filter = 'unset' : el.style.filter = 'blur(6px)';
    }
    return (
        <>
            <div id="theapp" className='relative'>
                <LoadingBar
                    color='#06f'
                    progress={progress}
                    onLoaderFinished={() => setProgress(0)}
                />
                <div className={`content ${result ? 'mt-[2vh]' : ''} mb-10 ${result ? 'px-[4%]' : ''}`}>
                    <h1 className='cursor-pointer' onClick={() => window.open("/", "_blank")}><span className={`text-[#06f]`}>I</span>nsta<span className='text-[#06f]'>W</span>rapped</h1>
                    {open && <div className="modal absolute mx-auto flex justify-center items-center" style={{ zIndex: '999', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 2px 15px 0px, 0 0 0 max(100vw, 100vh) #00000999' }}>
                        <div className="modal-content relative bg-[#070809] rounded-lg border border-[#333] flex flex-col" style={{ backdropFilter: 'blur(15px)', width: '80vw' }}>
                            <i className="fa-solid fa-xmark absolute right-0 m-4 text-gray-400 bg-[#ffffff0d] rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white" onClick={() => setOpen(false)} style={{ zIndex: 100, cursor: 'pointer' }}></i>
                            <div className="w-full mt-5 pb-4">
                                <div>
                                    <div className="text-6xl font-bold text-white mb-2" style={{ fontFamily: 'MatterTRIAL' }}><span className={`text-[#06f]`} style={{ fontFamily: 'MatterTRIAL' }}>A</span>bout</div>
                                    <div className="mt-6 text-xl font-medium flex flex-col p-4 lg:p-0 gap-2 items-center text-white"><span className='gap-2'>This is an <a className="opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }} href="https://github.com/CoderPopCat/instawrapped">Open Source</a> Instagram Data Package Explorer, built with&nbsp;<svg className='inline' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>&nbsp;&&nbsp;<i className="text-[red] fas fa-heart"></i></span><span className="gap-2">Your data is <span className="text-[#06f]">NOT</span> sent to our servers, and is processed by your device itself.</span><span className="gap-2">This tool is open source on GitHub, You may view the code / Host it on your own machine.</span></div>
                                </div>
                            </div>
                            <div className="credits flex gap-2 justify-center items-center">
                                <a href="https://zero.is-a.dev" target="_blank" className="mb-4 pill-button bg-[#ffffff0d] p-[0.4rem] px-5 hover:bg-[#1b1f23] border-[2px] border-[#1b1f23] rounded-[3rem] cursor-pointer">Created By <a className='text-[#06f]' href="https://zero.is-a.dev">Sharan</a></a>
                            </div>
                        </div>
                    </div>}
                    {!result && (<p className="text-xl"><a className="opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }} href="https://github.com/CoderPopCat/instawrapped">Open Source</a> Instagram Data Package Explorer by <a className="creditname opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }} href="https://zero.is-a.dev" target='_blank'>Sharan</a></p>)}
                    {!result && (
                        <>
                            <Tooltip id='about' />
                            <Tooltip id='guide' />
                            <Tooltip id='demo' />
                            <Tooltip id='donate' />
                            <Tooltip id='star' />
                            <div className="home-buttons mt-[2vh] flex flex-wrap justify-center items-center gap-[1rem]">
                                <button onClick={() => setOpen(true)} data-tooltip-id='about' data-tooltip-content='About this web app and the privacy notice.' data-tooltip-float={false} data-tooltip-variant='dark' className="pill-button bg-[#ffffff0d] p-[0.7rem] px-5 hover:bg-[#1b1f23] border-[2px] border-[#1b1f23] rounded-[3rem]"><span className="btn-text text-gray-300"><i className="text-gray-300 text-lg fas mr-2 fa-circle-info"></i>About</span></button>
                                <a data-tooltip-id='guide' data-tooltip-content='View a guide on how to download your .zip package' data-tooltip-float={false} data-tooltip-variant='dark' href='/guide' target="_blank" className="pill-button bg-[#ffffff0d] p-[0.7rem] px-5 hover:bg-[#1b1f23] border-[2px] border-[#1b1f23] rounded-[3rem]"><span className="btn-text text-gray-300"><i className="text-gray-300 text-lg fas mr-2 fa-circle-question"></i>Guide</span></a>
                                <a data-tooltip-id='demo' data-tooltip-content='Try out the UI with dummy data.' data-tooltip-float={false} data-tooltip-variant='dark' href="/demo" target="_blank" className="pill-button bg-[#ffffff0d] p-[0.7rem] px-5 hover:bg-[#1b1f23] border-[2px] border-[#1b1f23] rounded-[3rem]"><span className="btn-text text-gray-300"><i className="text-gray-300 text-lg far mr-2 fa-window"></i>Demo</span></a>
                                <a data-tooltip-id='donate' data-tooltip-content='Consider donating if you liked this project ;)' data-tooltip-float={false} data-tooltip-variant='dark' href="https://ko-fi.com/popcatdev" target='_blank' className="pill-button bg-[#ffffff0d] p-[0.7rem] px-5 hover:bg-[#1b1f23] border-[2px] border-[#118c4f] rounded-[3rem]"><span className="btn-text text-gray-300"><i className="text-[#118c4f] text-lg fas mr-2 fa-dollar"></i>Donate</span></a>
                                <a data-tooltip-id='star' data-tooltip-content='Star the repository of this project on GitHub!' data-tooltip-float={false} data-tooltip-variant='dark' href="https://github.com/CoderPopCat/instawrapped" target='_blank' className="pill-button bg-[#ffffff0d] p-[0.7rem] px-5 hover:bg-[#1b1f23] border-[2px] border-[#fee12b] rounded-[3rem]"><span className="btn-text text-gray-300"><i className="text-[#fee12b] text-lg fas mr-2 fa-star"></i>Star On GitHub</span></a>
                            </div>
                        </>
                    )}
                    {loading && (
                        <div class="loader"></div>
                    )}
                    {!(!loading && result) && (<div className="upload-container flex justify-center items-center upload mt-[2vh]">
                        <div className="flex items-center justify-center w-[75%]">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-[#0b0c0d] bg-transparent border-gray-600" style={{ backdropFilter: 'blur(25px)' }}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-[gray-500] text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-xl text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                    <p className="text-lg mt-[-4px] text-gray-400">Accepted: .zip</p>
                                </div>
                                <input id="dropzone-file" type="file" accept=".zip" onChange={(e) => onUpload(e.target.files)} className="hidden" />
                            </label>
                        </div>
                    </div>)}
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
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-[1rem] mt-[0.75rem] lg:gap-[1.7rem] lg:mx-0">
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
                                                JSON.stringify(window.downloadable)
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

export default Upload;