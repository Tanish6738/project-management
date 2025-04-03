import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import About from "./About";
import HowItWorks from "./HowItWorks";
import Pricing from "./Pricing";
import Contact from "./Contact";
import Footer from "./Footer";

const Landing = () => {
  return (
    <div className="font-sans antialiased bg-gradient-to-b from-slate-50 to-white text-gray-900">
      <Navbar />
      <Hero />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,1))] -z-10"></div>
        <Features />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.01),transparent)] -z-10"></div>
        <HowItWorks />
        <About />
        <Pricing />
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default Landing;
