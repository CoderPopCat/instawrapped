import React from 'react';
import { Tooltip } from 'react-tooltip';

function ActivityStats({ result }) {
    const blur = (classname) => {
        const el = document.querySelector(`.${classname}`);
        el.style.filter.includes('blur') ? el.style.filter = 'unset' : el.style.filter = 'blur(6px)';
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1rem] lg:gap-[1.7rem] lg:mx-0">
                <div className="stats-box lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                    <div className="stats-content m-3 lg:text-left text-center">
                        <h2 className='text-[1.475rem] cursor-pointer' onClick={() => blur('avgmessages')}>
                            Avg Messages/Day
                        </h2>
                        <div className="stats-subcontainer mt-3 avgmessages">
                            <h3 className="text-2xl text-gray-300 font-thin">{result?.avgMessagesPerDay ? result.avgMessagesPerDay.toLocaleString() : 'N/A'}</h3>
                        </div>
                    </div>
                </div>
                <div className="stats-box lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                    <div className="stats-content m-3 lg:text-left text-center">
                        <h2 className='text-[1.475rem] cursor-pointer' onClick={() => blur('mostactiveday')}>
                            Most Active Date
                        </h2>
                        <div className="stats-subcontainer mt-3 mostactiveday">
                            <Tooltip key='mad' id={`active-date`} />
                            <h3 data-tooltip-id={`active-date`} data-tooltip-content={`${result?.mostActiveDate.count.toLocaleString()} Messages!`} data-tooltip-float={false} data-tooltip-variant='dark' className="text-2xl text-gray-300 font-thin">{result?.mostActiveDate.date || 'N/A'}</h3>
                        </div>
                    </div>
                </div>
                <div className="stats-box lg:mt-4 mt-2 px-4 py-2 bg-[#ffffff0d] animate__delay-1s rounded-lg relative group flex lg:justify-start justify-center">
                    <div className="stats-content m-3 lg:text-left text-center">
                        <h2 className='text-[1.475rem] cursor-pointer' onClick={() => blur('mostactivemonth')}>
                            Most Active Month
                        </h2>
                        <div className="stats-subcontainer mt-3 mostactivemonth">
                            <h3 className="text-2xl text-gray-300 font-thin">{result?.mostActiveMonth || 'N/A'}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ActivityStats;