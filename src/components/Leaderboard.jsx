import React from 'react'

function Leaderboard({ result }) {
    const blur = (classname) => {
        const el = document.querySelector(`.${classname}`);
        el.style.filter.includes('blur') ? el.style.filter = 'unset' : el.style.filter = 'blur(15px)';
    }
    return (
        <div className="stats-box lg:w-[33%] lg:mx-0 lg:mt-4 mt-6 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex justify-start h-max">
            <div className="stats-content w-[93%] m-3 text-left">
                <h2 className='text-[1.65rem] cursor-pointer' onClick={() => blur('topdms')}>
                    Top DMs
                </h2>
                <div className="mt-3 leaderboard flex flex-col gap-[0.7rem] topdms">
                    {result.topDMS.map((user, i) => {
                        return (
                            <div key={i} className='leaderboard-item duration-75 cursor-pointer hover:bg-[#ffffff0d] hover:px-4 rounded-lg flex justify-between w-full items-center'>
                                <div className={`mr-3 user-position p-4 ${i + 1 === 1 ? 'bg-[#da9e3b]' : i + 1 === 2 ? 'bg-[#989898]' : i + 1 === 3 ? 'bg-[#ae7458]' : 'bg-[#ffffff0d]'} flex justify-center items-center text-white rounded-full h-10 w-10`}>{i + 1}</div>
                                <div className="user-name text-2xl flex leaderboard-pain w-full justify-between items-center">
                                    <span className="lbuser font-semibold text-ellipsis break-words w-[50%]">{user.username}</span>
                                    <div className="flex flex-col justify-start text-right">
                                        <span className="text-[14px] lg:text-[19px] flex items-center flex-row justify-between gap-1 text-right text-white">{user.count.toLocaleString()} Total <i className='ml-2 fas fa-message-lines'></i></span>
                                        <span className="text-[14px] lg:text-[19px] flex items-center flex-row justify-between gap-1 text-right text-white">{user.myMessages.toLocaleString()} By Me <i className='ml-2 fas fa-message-lines'></i></span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Leaderboard;