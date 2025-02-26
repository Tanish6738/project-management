import React from 'react'

const About = () => {
  const teamMembers = [
    {
      name: "John Doe",
      role: "Lead Developer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
    },
    {
      name: "Jane Smith",
      role: "UI/UX Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
    },
    {
      name: "Mike Johnson",
      role: "Product Manager",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
    }
  ];

  return (
    <section className="min-h-screen py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-['Berlin_Sans_FB'] text-gray-900 border-b-2 border-gray-900 inline-block pb-2">
            About Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold text-gray-800">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              We are dedicated to revolutionizing project management through innovative solutions
              that empower teams to collaborate effectively and deliver outstanding results.
              Our platform combines cutting-edge technology with intuitive design to streamline
              your workflow and boost productivity.
            </p>
          </div>
          <div className="bg-gray-100 p-8 rounded-lg">
            <h3 className="text-3xl font-semibold text-gray-800 mb-6">Why Choose Us?</h3>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-800 rounded-full mr-3"></span>
                Intuitive and user-friendly interface
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-800 rounded-full mr-3"></span>
                Real-time collaboration features
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-800 rounded-full mr-3"></span>
                Advanced project tracking capabilities
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-800 rounded-full mr-3"></span>
                Comprehensive analytics and reporting
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mb-12">
          <h3 className="text-3xl font-semibold text-gray-800">Meet Our Team</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <img 
                src={member.image} 
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h4 className="text-xl font-semibold text-gray-800">{member.name}</h4>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
