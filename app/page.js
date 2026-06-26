'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStats } from './StatsContext';
import LoadingBar from 'react-top-loading-bar';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Reading ZIP file...');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { setStats } = useStats();

  async function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a .zip file from Instagram.');
      return;
    }
    if (!file.stream) {
      setError("This browser doesn't support file streaming. Please try Chrome or Firefox.");
      return;
    }

    // Grab the stream reader synchronously before setLoading() unmounts the
    // input and the browser revokes access to the File object.
    const fileReader = file.stream().getReader();

    setLoading(true);
    setError('');
    setProgress(20);
    setLoadingStep('Importing parser...');

    try {
      const { Unzip, AsyncUnzipInflate } = await import('fflate');

      const unzipper = new Unzip();
      unzipper.register(AsyncUnzipInflate);
      setLoadingStep('Reading ZIP file...');

      const entries = {};
      unzipper.onfile = (f) => {
        if (f.name.endsWith('.json')) { entries[f.name] = f; return; }
        if (/\.(jpg|jpeg|png|webp)$/i.test(f.name) && f.name.includes('media/other/')) entries[f.name] = f;
      };

      while (true) {
        const { done, value } = await fileReader.read();
        if (done) { unzipper.push(new Uint8Array(0), true); break; }
        for (let i = 0; i < value.length; i += 65536) {
          unzipper.push(value.subarray(i, i + 65536));
        }
      }

      const keys = Object.keys(entries);
      setLoadingStep('Validating data...');

      if (!keys.some(k => k.endsWith('personal_information.json'))) {
        setError("Invalid Instagram data package. Make sure you requested JSON format (not HTML).");
        setLoading(false);
        return;
      }

      setStats({ entries, keys });
      setProgress(100);
      router.push('/mywrap');
    } catch (err) {
      console.error('[InstaWrapped] ZIP parse error:', err);
      setError("Couldn't read this file. Make sure it's a valid Instagram data export in JSON format.");
      setLoading(false);
    }
  }

  return (
    <div id="theapp" className="relative">
      <LoadingBar color="#06f" progress={progress} onLoaderFinished={() => setProgress(0)} />
      <div className="content mb-10">

        <h1 className="cursor-pointer" onClick={() => window.open('/', '_self')}>
          <span className="text-[#06f] font-inter">I</span>nsta<span className="text-[#06f] font-inter">W</span>rapped
        </h1>

        {open && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-center"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <div className="relative bg-[#070809] rounded-lg border border-[#333] flex flex-col w-[95vw] sm:w-[80vw] max-w-lg">
              <button
                className="absolute right-0 top-0 m-4 text-gray-400 hover:text-white text-xl cursor-pointer bg-transparent border-0"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
              <div className="w-full mt-5 pb-4 text-center px-6">
                <div className="text-5xl font-bold text-white mt-4 mb-2">
                  <span className="text-[#06f]">A</span>bout
                </div>
                <div className="mt-6 text-lg font-medium flex flex-col gap-3 items-center text-white">
                  <span>
                    This is an{' '}
                    <a className="opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" href="https://github.com/CoderPopCat/instawrapped">Open Source</a>{' '}
                    Instagram Data Package Explorer, built with ❤️
                  </span>
                  <span className="text-gray-400 text-base">
                    Your data is <strong>NOT</strong> sent to our servers, and is processed by your device itself.
                  </span>
                  <span className="text-gray-400 text-base">
                    Open source on GitHub — self-hosting is supported!
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-center items-center mb-5">
                <a
                  href="https://zero.is-a.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="pill-button"
                >
                  <span className="text-gray-300">
                    Created By <span className="text-[#06f]">Sharan</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}

        <p className="text-xl mt-1 text-gray-100">
          <a className="opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" href="https://github.com/CoderPopCat/instawrapped">Open Source</a>{' '}
          Instagram Data Package Explorer by{' '}
          <a className="opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" href="https://zero.is-a.dev">Sharan</a>
        </p>

        <div className="mt-[2vh] flex flex-wrap justify-center items-center gap-4">
          <button onClick={() => setOpen(true)} className="pill-button">
            <span className="text-gray-300 text-md flex items-center gap-2">
              <i className="fas fa-circle-info text-gray-300"></i>About
            </span>
          </button>

          <a href="/guide" target="_blank" rel="noreferrer" className="pill-button">
            <span className="text-gray-300 text-md flex items-center gap-2">
              <i className="fas fa-circle-question text-gray-300"></i>Guide
            </span>
          </a>

          <a href="/demo" target="_blank" rel="noreferrer" className="pill-button">
            <span className="text-gray-300 text-md flex items-center gap-2">
              <i className="text-gray-300 text-lg far mr-2 fa-window"></i>Demo
            </span>
          </a>

          <a href="https://ko-fi.com/popcatdev" target="_blank" rel="noreferrer" className="pill-button pg">
            <span className="text-gray-300 text-md flex items-center gap-2">
              <i className="fas fa-dollar-sign text-[#118c4f]"></i>Donate
            </span>
          </a>

          <a href="https://github.com/CoderPopCat/instawrapped" target="_blank" rel="noreferrer" className="pill-button py">
            <span className="text-gray-300 text-md flex items-center gap-2">
              <i className="fas fa-star text-[#fee12b]"></i>Star On GitHub
            </span>
          </a>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-1 mt-[2vh]">
            <span className="loader"></span>
          </div>
        )}

        <div className="flex justify-center items-center mt-[2vh]">
          <div className="flex items-center justify-center w-full sm:w-[85%] lg:w-[75%]">
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                dragging
                  ? 'bg-[#0d1020] border-[#06f]'
                  : 'hover:bg-[#0b0c0d] bg-transparent border-gray-600'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className={`w-8 h-8 mb-4 transition-colors ${dragging ? 'text-[#06f]' : 'text-gray-400'}`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-xl text-gray-400">
                  <span className="font-semibold">Click to open</span> or drag & drop
                </p>
                <p className="text-lg text-gray-400" style={{ marginTop: '-4px' }}>Accepted: .zip</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-4 text-sm">
          <span className="text-gray-400 font-trial flex items-center gap-1.5">
            <i className="fas fa-lock text-[#06f]"></i>
            Your data never leaves your device
          </span>
          <span className="text-gray-400 font-trial flex items-center gap-1.5">
            <i className="fas fa-microchip text-[#06f]"></i>
            Processed entirely in your browser
          </span>
          <a
            href="https://github.com/CoderPopCat/instawrapped/blob/main/app/mywrap/parser.worker.js"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-gray-400 font-trial hover:text-gray-300 transition-colors"
          >
            <i className="fab fa-github text-[#06f]"></i>
            View Code
          </a>
        </div>

        {error && (
          <p className="text-red-400 text-center mt-5 text-base">{error}</p>
        )}

      </div>
    </div>
  );
}
