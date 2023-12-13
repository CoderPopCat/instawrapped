import './App.css'
import { useState } from 'react'
import './navbar.css'
import Upload from './components/Upload'

function App() {
  return (
    <>
      <div className="content">
        <h1><span className='text-[#06f]'>I</span>nsta<span className='text-[#06f]'>W</span>rapped</h1>
        <p className="text-xl"><a className="opensrc underline underline-offset-2 hover:underline-offset-4 duration-150" style={{ textDecorationColor: '#06f' }} href="https://github.com/CoderPopCat/instawrapper">Open Source</a> Instagram Data Package Explorer</p>
        <Upload />
      </div>
    </>
  )
}

export default App
