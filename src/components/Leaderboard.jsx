import React from 'react'

function Leaderboard({ result }) {
    return (
        <div className="stats-box lg:w-[33%] lg:mx-0 lg:mt-4 mt-6 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex justify-start h-max">
            <div className="stats-content w-[93%] m-3 text-left">
                <h2 className='text-[1.65rem]'>
                    Top DMs
                </h2>
                <div className="mt-3 leaderboard flex flex-col gap-[0.7rem]">
                    {result.topDMS.map((user, i) => {
                        return (
                            <div className='leaderboard-item duration-75 cursor-pointer hover:bg-[#ffffff0d] hover:px-4 rounded-lg flex justify-between w-full items-center'>
                                <div className={`mr-3 user-position p-4 ${i + 1 === 1 ? 'bg-[#da9e3b]' : i + 1 === 2 ? 'bg-[#989898]' : i + 1 === 3 ? 'bg-[#ae7458]' : 'bg-[#ffffff0d]'} flex justify-center items-center text-white rounded-full h-10 w-10`}>{i + 1}</div>
                                <div className="user-name text-2xl flex w-full justify-between items-center flex-row">
                                    <span className="font-semibold">{user.username}</span>
                                    <div className="flex flex-col justify-start text-right">
                                        <span className="text-[19px] flex items-center flex-row justify-between gap-1 text-right text-white">{user.count.toLocaleString()} Total <svg xmlns="http://www.w3.org/2000/svg" height="24" className="fill-gray-300 hover:fill-white ml-2" width="24"><path d="M6 14h8v-2H6Zm0-3h12V9H6Zm0-3h12V6H6ZM2 22V4q0-.825.588-1.413Q3.175 2 4 2h16q.825 0 1.413.587Q22 3.175 22 4v12q0 .825-.587 1.413Q20.825 18 20 18H6Z"></path></svg></span>
                                        <span className="text-[19px] flex items-center flex-row justify-between gap-1 text-right text-white">{user.myMessages.toLocaleString()} By Me <svg xmlns="http://www.w3.org/2000/svg" height="24" className="fill-gray-300 hover:fill-white ml-2" width="24"><path d="M6 14h8v-2H6Zm0-3h12V9H6Zm0-3h12V6H6ZM2 22V4q0-.825.588-1.413Q3.175 2 4 2h16q.825 0 1.413.587Q22 3.175 22 4v12q0 .825-.587 1.413Q20.825 18 20 18H6Z"></path></svg></span>
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