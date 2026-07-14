import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import rescueeImage from "@/photos/rescuee.jpg";
function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useI18n();
  const heroSlides = [
    {
      title: t("hero_title"),
      subtitle: t("hero_subtitle"),
      background: "bg-black/60",
      image: rescueeImage
    },
    {
      title: t("hero_title"),
      subtitle: t("hero_subtitle"),
      background: "bg-black/60",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80"
    },
    {
      title: t("hero_title"),
      subtitle: t("hero_subtitle"),
      background: "bg-black/60",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80"
    }
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5e3);
    return () => clearInterval(timer);
  }, [heroSlides.length]);
  return <section className="relative flex min-h-[100svh] flex-col overflow-hidden" data-testid="section-hero">
      {
    /* Hero Background with Slideshow - Fixed Height */
  }
      <div className="absolute inset-0 z-0">
        {heroSlides.map((slide, index) => <div
    key={index}
    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
  >
            <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
    style={{
      backgroundImage: `url('${slide.image}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}
  />
            <div className={`absolute inset-0 ${slide.background}`} />
          </div>)}
      </div>

      {
    /* Hero Content - Adjusted alignment */
  }
      <div className="relative z-10 flex flex-1 flex-col justify-start pt-24 md:pt-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8">
              <h1
    className="mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-2xl transition-all duration-1000 sm:text-4xl md:mb-8 md:text-6xl"
    data-testid="hero-title"
    key={currentSlide}
    style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.8)" }}
  >
                {heroSlides[currentSlide].title.split(" ").map((word, index) => <span
    key={index}
    className={`inline-block transition-all duration-500 mr-3 md:mr-4 ${word === "Unheard" || word === "Impact" || word === "Strong" ? "text-yellow-300 drop-shadow-xl" : "text-white drop-shadow-xl"}`}
    style={{
      animationDelay: `${index * 100}ms`,
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
    }}
  >
                    {word}
                  </span>)}
              </h1>
              <p
    className="text-base md:text-xl text-gray-100 mt-2 md:mt-3 mb-12 max-w-4xl mx-auto transition-all duration-1000 leading-relaxed font-serif"
    data-testid="hero-description"
    key={`desc-${currentSlide}`}
    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
  >
                {heroSlides[currentSlide].subtitle}
              </p>
            </div>
            
            {
    /* 3 Big Action Buttons */
  }
            <div className="mx-auto mb-12 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <Link href="/emergency" data-testid="link-emergency">
                <Button
    size="lg"
    className="hero-glass-button hero-glass-red h-16 w-full px-6 py-3 text-base font-bold text-white transition-all duration-300 hover:scale-105 sm:h-20 sm:px-8"
    data-testid="button-emergency"
  >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🚨</span>
                    <span>Request Help</span>
                  </div>
                </Button>
              </Link>
              <Link href="/volunteer" data-testid="link-volunteer">
                <Button
    size="lg"
    className="hero-glass-button hero-glass-blue h-16 w-full px-6 py-3 text-base font-bold text-white transition-all duration-300 hover:scale-105 sm:h-20 sm:px-8"
    data-testid="button-volunteer"
  >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🤝</span>
                    <span>Volunteer</span>
                  </div>
                </Button>
              </Link>
              <Link href="/donate" data-testid="link-donate">
                <Button
    size="lg"
    className="hero-glass-button hero-glass-green h-16 w-full px-6 py-3 text-base font-bold text-white transition-all duration-300 hover:scale-105 sm:h-20 sm:px-8"
    data-testid="button-donate"
  >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">💳</span>
                    <span>Donate</span>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {
    /* Stats removed as requested */
  }

      {
    /* Slide Indicators */
  }
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {heroSlides.map((_, index) => <button
    key={index}
    onClick={() => setCurrentSlide(index)}
    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"}`}
  />)}
        </div>
      </div>
    </section>;
}
export {
  Hero as default
};
