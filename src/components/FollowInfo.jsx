import React from 'react'

function FollowInfo({ result }) {
    const blur = (classname) => {
        const el = document.querySelector(`.${classname}`);
        el.style.filter.includes('blur') ? el.style.filter = 'unset' : el.style.filter = 'blur(6px)';
    }
    return (
        <div className="flex flex-col lg:flex-row lg:justify-between gap-[1rem] lg:gap-[1.7rem] lg:mx-0">
            <div className="stats-box mt-8 lg:w-[33%] lg:mx-0 h-max lg:mt-4 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <h2 className='text-[1.475rem] cursor-pointer' onClick={() => blur('firstfollower')}>
                        First Follower
                    </h2>
                    <div className="stats-subcontainer mt-1 firstfollower">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.firstFollower}</h3>
                    </div>
                </div>
            </div>
            <div className="stats-box lg:w-[33%] lg:mx-0 h-max lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <h2 className='text-[1.475rem] cursor-pointer' onClick={() => blur('followers')}>
                        Followers
                    </h2>
                    <div className="stats-subcontainer mt-1 followers">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.followers.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
            <div className="stats-box lg:w-[33%] lg:mx-0 h-max lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <h2 className='text-[1.375rem] cursor-pointer' onClick={() => blur('following')}>
                        Following
                    </h2>
                    <div className="stats-subcontainer mt-1 following">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.following.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FollowInfo;