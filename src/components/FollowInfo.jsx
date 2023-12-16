import React from 'react'

function FollowInfo({ result }) {
    return (
        <div className="flex flex-col lg:flex-row lg:justify-between gap-[1rem] lg:gap-[1.7rem] lg:mx-0">
            <div className="stats-box mt-8 lg:w-[33%] lg:mx-0 h-max lg:mt-4 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <h2 className='w-max text-[1.475rem]'>
                        First Follower
                    </h2>
                    <div className="stats-subcontainer mt-1">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.firstFollower}</h3>
                    </div>
                </div>
            </div>
            <div className="stats-box lg:w-[33%] lg:mx-0 h-max lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <h2 className='text-[1.475rem]'>
                        Followers
                    </h2>
                    <div className="stats-subcontainer mt-1">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.followers.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
            <div className="stats-box lg:w-[33%] lg:mx-0 h-max lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <h2 className='text-[1.475rem]'>
                        Following
                    </h2>
                    <div className="stats-subcontainer mt-1">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.following.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FollowInfo;