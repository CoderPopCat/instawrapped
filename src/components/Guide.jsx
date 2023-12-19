import React from 'react'

function Guide() {
    return (
        <div id="theapp">
            <div className={`content mt-[2vh] mb-10 px-[4%]`}>
                <h1 className='cursor-pointer' onClick={() => window.open("/", "_blank")}><span className={`text-[#06f]`}>G</span>uide</h1>
                <p className="text-xl font-medium underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }}>Downloading Your Instagram Data Package</p>
            </div>
        </div>
    )
}

export default Guide
