import React from 'react'
import { TextAnimate } from '../App/Elements/TextAnimate'

const PreHero = () => {
  return (
    <div className='relative min-h-screen flex flex-col justify-center items-center pt-24 pb-32 overflow-hidden bg-black text-white'>
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover opacity-90"
        >
          {/* <source src="/Videos/Untitled design.mp4" type="video/mp4" /> */}
          <source src="/MP.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content container */}
      <div className="relative z-10 text-center max-w-4xl px-4">
        <TextAnimate
          as="h1"
          by="character"
          animation="blurInUp"
          delay={0.2}
          duration={0.8}
          className="text-6xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          ProjectFlow
        </TextAnimate>
        
        <TextAnimate
          as="p"
          by="word"
          animation="fadeIn"
          delay={1}
          duration={0.5}
          className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
        >
          Streamline your workflow, maximize productivity, and deliver exceptional results
        </TextAnimate>
      </div>
    </div>
  )
}

export default PreHero