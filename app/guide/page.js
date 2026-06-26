'use client';

export default function GuidePage() {
  return (
    <div className="content mb-10 !px-4 sm:!px-[9%] !mt-[8vh] sm:!mt-[15vh]">
      <h1 className="cursor-pointer" onClick={() => window.open('/', '_self')}>
        <span className="text-[#06f] font-inter">I</span>nsta<span className="text-[#06f] font-inter">W</span>rapped
      </h1>

      <p className="text-gray-400 mt-1 text-base sm:text-lg">How to download your Instagram data</p>

      <div className="mt-4 flex justify-center">
        <div className="w-full sm:w-[90%] lg:w-[70%] rounded-xl overflow-hidden border border-[#333] shadow-2xl">
          <video
            src="/web_guide.mp4"
            controls
            playsInline
            className="w-full"
            style={{ display: 'block', background: '#000' }}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <a href="/" className="pill-button" style={{ border: 'none' }}>
          <span className="text-gray-300 text-md flex items-center gap-2">
            <i className="fas fa-arrow-left text-[#06f]"></i>
            Back to upload
          </span>
        </a>
      </div>
    </div>
  );
}
