import React from "react";

const Landing = () => {
  return (
    <div className="box-border p-8">
      <nav className="flex justify-between items-center font-['Poppins'] bg-white top-0 left-0 sticky">
        <h1 className="text-3xl font-bold">Project</h1>
        <ul className="flex space-x-4">
          <li>Contact</li>
          <li>About</li>
          <li>Key Features</li>
          <li>Working</li>
        </ul>
      </nav>

      <section className="h-[60vh] flex flex-col w-full mt-[2vh]">
        <div className="flex flex-col justify-center items-center h-full w-full">
          <h1 className="text-9xl tracking-tighter font-bold text-white stroke uppercase cursor-default">Making the Developement Easier </h1>
        </div>
        
      </section>

      <section className="h-[75vh] flex flex-col w-full mt-[1vh] bg-blue-500">
        <div className="w-full">
          <h1 className="text-5xl font-['Berlin_Sans_FB'] underline">Key Features</h1>
        </div>
        <div className="">

        </div>
      </section>
    </div>
  );
};

export default Landing;
