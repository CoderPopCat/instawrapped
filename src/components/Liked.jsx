import React from 'react'
import { Tooltip } from 'react-tooltip';

function Liked({ result }) {
    return (
        <div className="flex flex-col lg:flex-row lg:justify-between gap-[1rem] lg:gap-[1.7rem] lg:mx-0">
            <div className="stats-box mt-8 lg:w-[35%] lg:mx-0 h-max lg:mt-4 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <Tooltip id='posts' />
                    <h2 className='text-[1.475rem]'>
                        <i data-tooltip-id='posts' data-tooltip-content='Liked' data-tooltip-float={false} data-tooltip-variant='dark' className="fas fa-heart"></i> Posts
                    </h2>
                    <div className="stats-subcontainer mt-1">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.likedPosts.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
            <div className="stats-box lg:w-[35%] lg:mx-0 h-max lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                    <Tooltip id='comments' />
                    <h2 className='text-[1.475rem]'>
                        <i data-tooltip-id='comments' data-tooltip-content='Liked' data-tooltip-float={false} data-tooltip-variant='dark' className="fas fa-heart"></i> Comments
                    </h2>
                    <div className="stats-subcontainer mt-1">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.likedComments.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
            <div className="stats-box lg:w-[35%] lg:mx-0 h-max lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                <div className="stats-content m-3 lg:text-left text-center">
                <Tooltip id='stories' />
                    <h2 className='text-[1.475rem]'>
                        <i data-tooltip-id='stories' data-tooltip-content='Liked' data-tooltip-float={false} data-tooltip-variant='dark' className="fas fa-heart"></i> Stories
                    </h2>
                    <div className="stats-subcontainer mt-1">
                        <h3 className="text-2xl text-gray-300 font-thin">{result.storiesLiked.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Liked;