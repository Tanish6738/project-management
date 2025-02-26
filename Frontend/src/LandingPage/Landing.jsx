import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import About from "./About";

const Landing = () => {
  return (
    <div className="box-border p-8">
      <Navbar />
      <Hero />
      <Features />
      <About />
    </div>
  );
};

export default Landing;
