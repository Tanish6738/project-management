import React from 'react'

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center font-['Poppins'] bg-white top-0 left-0 sticky shadow-md px-6 py-4 z-50">
      <h1 className="text-3xl font-bold text-black">Project</h1>
      <ul className="flex space-x-8">
        <li className="text-gray-700 hover:text-black cursor-pointer transition-colors">Contact</li>
        <li className="text-gray-700 hover:text-black cursor-pointer transition-colors">About</li>
        <li className="text-gray-700 hover:text-black cursor-pointer transition-colors">Key Features</li>
        <li className="text-gray-700 hover:text-black cursor-pointer transition-colors">Working</li>
      </ul>
    </nav>
  )
}

export default Navbar
