import React from 'react'
import StackCarousel from '../ani/UI/StackCarousel'

const Features = () => {
  const featureCards = [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
      title: "Team Collaboration",
      description: "Work seamlessly with your team members in real-time with our advanced collaboration tools."
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
      title: "Project Timeline",
      description: "Track your project progress with interactive timelines and milestone management."
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      title: "Task Management",
      description: "Organize and prioritize tasks efficiently with our intuitive task management system."
    }
  ];

  return (
    <section className="min-h-screen flex flex-col items-center w-full py-16 bg-gray-50">
      <div className="w-full text-center mb-16">
        <h1 className="text-5xl font-['Berlin_Sans_FB'] text-gray-900 border-b-2 border-gray-900 inline-block pb-2">
          Key Features
        </h1>
      </div>
      <div className="flex justify-center items-center">
        <StackCarousel 
          cardsData={featureCards}
          theme={{
            card: {
              background: 'white',
              text: {
                title: 'from-gray-900 to-gray-800',
                description: 'gray-600'
              },
              overlay: {
                from: 'gray-100/50',
                via: 'transparent',
                to: 'gray-100/50'
              }
            },
            animation: {
              stiffness: 260,
              damping: 20,
              duration: 0.5
            }
          }}
          config={{
            randomRotation: true,
            sensitivity: 150,
            cardDimensions: { width: 320, height: 400 },
            showControls: true,
            showDescription: true,
            maxRotation: 4,
            scaleStep: 0.05,
            stiffness: 300,
            damping: 25,
            mass: 0.8,
            velocity: 0.2,
            dragPower: 0.2
          }}
        />
      </div>
    </section>
  )
}

export default Features
