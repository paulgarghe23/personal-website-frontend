import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero-overlay" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="animate-fade-in max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-serif font-semibold text-foreground mb-8 leading-tight tracking-tight">
            AI Agents, <span className="text-accent">Built to Trust</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            AI Engineer building production agents that multiply your impact
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-primary font-medium shadow-lift px-8 py-6 text-base"
            >
              <Link to="/projects">Recent Work <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <a href="/Paul_CV.pdf" download className="inline-block">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 text-foreground border-white/20 hover:bg-white/10 backdrop-blur-sm font-medium px-8 py-6 text-base"
              >
                Download Resume
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
