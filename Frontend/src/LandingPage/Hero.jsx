import React from 'react'

const Hero = () => {
  return (
    <section className="h-[60vh] flex flex-col w-full mt-[2vh] bg-white">
        <div className="flex flex-col justify-center items-center h-full w-full">
          <h1 className="text-9xl tracking-tighter font-bold uppercase cursor-default relative">
            <span className="text-white stroke ">Making the Development Easier</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-transparent mix-blend-overlay"></div>
          </h1>
        </div>
    </section>
  )
}

export default Hero
