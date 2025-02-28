import React from 'react'
import StackCarousel from '../ani/UI/StackCarousel'
import CustomPage1 from '../ani/UI/CustomPage1'

const Features = () => {
  const theme = {
    colors: {
      primary: 'black',
      secondary: 'gray',
      background: 'white',
      text: {
        primary: 'black',
        secondary: 'gray-500',
        light: 'white'
      }
    },
    gradient: {
      from: 'white',
      to: 'white'
    },
    animated: {
      underline: {
        stroke: '#000000',
        strokeWidth: 4,
        fill: 'none',
        pathAnimation: {
          delay: 0.3,
          duration: 1.5,
          bounce: 0
        },
        opacityAnimation: {
          delay: 0.3,
          duration: 0.8
        }
      },
      text: {
        color: 'black',
        highlightedColor: 'black'
      }
    }
  };

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

  const highlights = [
    "Real-time team collaboration",
    "Interactive project timelines",
    "Intuitive task management",
    "Resource allocation tracking"
  ];

  return (
    <section className={`min-h-screen flex flex-col items-center w-full py-16 bg-${theme.colors.background}`}>
      <div className="w-full text-center mb-16">
        <h1 className={`text-5xl font-['Berlin_Sans_FB'] text-${theme.colors.primary} border-b-2 border-${theme.colors.primary} inline-block pb-2`}>
          Key Features
        </h1>
      </div>
      <div className="flex justify-center items-center w-full">
        <CustomPage1
          theme={{
            primary: theme.colors.primary,
            secondary: theme.colors.secondary,
            text: {
              light: theme.colors.text.light,
              dark: theme.colors.text.primary,
              muted: theme.colors.text.secondary
            },
            background: {
              gradient: theme.gradient
            },
            animated: theme.animated
          }}
          heading={{
            preText: "Discover ",
            highlightedText: "Powerful Features",
            postText: " for Projects "
          }}
          description="Transform your project management experience with our comprehensive suite of tools designed to streamline collaboration and boost productivity."
          features={featureCards}
          highlights={highlights}
          stackConfig={{
            cardDimensions: { width: 350, height: 250 },
            sensitivity: 120,
            randomRotation: true
          }}
        />
      </div>
    </section>
  )
}

export default Features
