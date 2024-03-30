import React from 'react'

function Guide() {
    return (
        <div id="theapp">
            <div className={`content flex justify-center flex-col items-center mt-[2vh] mb-10 px-[4%]`}>
                <h1 className='cursor-pointer' onClick={() => window.open("/", "_blank")}><span className={`text-[#06f]`}>G</span>uide</h1>
                <p className="text-xl font-medium underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }}>Downloading Your Instagram Data Package [.ZIP]</p>
                <div className="tutorial-box mt-[4vh] p-3 lg:p-6 rounded-lg border border-[#06f] w-[80vw] bg-[#ffffff0d]">
                    <div className="flex lg:flex-row flex-col-reverse justify-around">
                        <div className="laptop lg:w-[50%]">
                            <h2 className='text-[34px]'>Desktop</h2>
                            <div className="tut-content mt-2 flex flex-col items-left gap-[2.2rem] mx-3 lg:mx-7">
                                <img src="/assets/img/desktop.png" alt="Desktop" className='rounded-lg invert' />
                                <img src="/assets/img/continue.png" alt="Continue" className='rounded-lg' />
                                <h3 className='line flex items-center text-left text-[27px]'>Click Continue</h3>
                                <img src="/assets/img/request.png" alt="" className="rounded-lg" />
                                <p className='line text-left text-[22px]'>Press 'Download or Transfer Information'</p>
                                <img src="/assets/img/complete.png" alt="complete" className="rounded-lg" />
                                <p className='line text-left text-[22px]'>All Available Information</p>
                                <img src="/assets/img/todevice.png" alt="to device" className='rounded-lg' />
                                <p className="line text-left text-[22px]">Download to Device</p>
                                <img src="/assets/img/options.png" alt="options" className="rounded-lg w-[100%]" />
                                <img src="/assets/img/format.png" alt="format" className='rounded-lg' />
                                <p className='line text-left text-[22px]'>Select 'All Time' Date range & JSON format.</p>
                            </div>
                        </div>
                        <div className="mobile border-b-[1px] border-b-[#06f] mb-5 pb-5 lg:mb-0 lg:pb-0 lg:border-b-0 lg:w-[50%] lg:border-l-2 lg:border-l-[#333] lg:border-solid">
                            <h2 className='text-[34px]'>Mobile</h2>
                            <div className="tut-content mt-2 flex flex-col items-left gap-[1.2rem] mx-3 lg:mx-7">
                                <img src="/assets/img/phone-start.png" alt="Mobile" className='rounded-lg invert' />
                                <img src="/assets/img/activity.jpg" alt="Continue" className='rounded-lg' />
                                <h3 className='line flex items-center text-left text-[27px]'>Click</h3>
                                <img src="/assets/img/download.jpg" alt="" className="rounded-lg" />
                                <p className='line text-left text-[22px]'>Scroll Down And Click 'Download Your Information'</p>
                                <img src="/assets/img/transfer.jpg" alt="to device" className='rounded-lg' />
                                <p className="line text-left text-[22px]">Download to Device</p>
                                <img src="/assets/img/phone-select.png" alt="complete" className="rounded-lg" />
                                <p className='line text-left text-[22px]'>All Available Information</p>
                                <img src="/assets/img/phone-json.jpg" alt="format" className='rounded-lg' />
                                <p className='line text-left text-[22px]'>Select 'All Time' Date range & JSON format.</p>
                            </div>
                        </div>
                    </div>
                    <h3 className='mt-10 text-[25px] pt-[1.2rem] border-t-[2px] border-dashed border-gray-500'>Submit your request and upload the .zip file <a href="/" className="underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }}>Here</a> Upon receiving an email!</h3>
                </div>
            </div>
        </div>
    )
}

export default Guide
