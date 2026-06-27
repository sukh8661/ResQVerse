import {
  Twitter,
  Facebook,
  Linkedin,
  Github,
  AlertTriangle,
  Users,
  Heart,
  Shield,
  Globe,
  Zap,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
function Footer() {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const quickLinks = [
    { name: "Request Emergency Help", href: "/emergency", icon: AlertTriangle },
    { name: "Volunteer Registration", href: "/volunteer", icon: Users },
    { name: "Make a Donation", href: "/donate", icon: Heart },
    { name: "Track Donations", href: "/transparency", icon: Shield }
  ];
  const resources = [
    { name: "Emergency Guidelines", href: "/guidelines" },
    { name: "Safety Tips", href: "/safety" },
    { name: "Disaster Preparedness", href: "/preparedness" },
    { name: "First Aid Guide", href: "/first-aid" },
    { name: "Community Resources", href: "/resources" }
  ];
  const about = [
    { name: "Our Mission", href: "/mission" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Success Stories", href: "/stories" },
    { name: "Partner Organizations", href: "/partners" },
    { name: "Annual Reports", href: "/reports" }
  ];
  const emergencyContacts = [
    { type: "Emergency Hotline", value: "1-800-ResQVerse", available: "24/7" },
    { type: "SMS Emergency", value: "Text HELP to 50555", available: "24/7" },
    { type: "Email Support", value: "emergency@ResQVerse.org", available: "Priority Response" }
  ];
  return <footer className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white" data-testid="footer-main">

      {
    /* Main Footer Content */
  }
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-8 mb-12">
            
            {
    /* Brand Section */
  }
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                
                  <img
    src="../src/photos/Rescue_Logo.jpg"
    alt="ResQVerse Logo"
    className="h-10 w-10 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
  />
                
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    ResQVerse
                  </h3>
                  <p className="text-gray-400 text-sm">Unified Disaster Relief Platform</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-base mb-6 leading-relaxed">
                Connecting survivors, volunteers, NGOs, and donors with AI-powered coordination during disasters. 
                Every second counts when lives are at stake. No cry for help goes unheard.
              </p>

              {
    /* Social Links */
  }
              <div className="flex space-x-3">
                <a href="#" className="w-11 h-11 bg-gray-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110" data-testid="link-social-twitter">
                  <Twitter className="text-white h-5 w-5" />
                </a>
                <a href="#" className="w-11 h-11 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110" data-testid="link-social-facebook">
                  <Facebook className="text-white h-5 w-5" />
                </a>
                <a href="#" className="w-11 h-11 bg-gray-800 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110" data-testid="link-social-linkedin">
                  <Linkedin className="text-white h-5 w-5" />
                </a>
                <a href="#" className="w-11 h-11 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110" data-testid="link-social-github">
                  <Github className="text-white h-5 w-5" />
                </a>
              </div>
            </div>

            {
    /* Quick Actions */
  }
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
                <Zap className="h-5 w-5 mr-2 text-red-400" />
                Quick Actions
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => {
    const Icon = link.icon;
    return <li key={index}>
                      <Link
      href={link.href}
      className="flex items-center text-gray-300 hover:text-red-400 transition-colors duration-200 group"
    >
                        <Icon className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="text-sm">{link.name}</span>
                        <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    </li>;
  })}
              </ul>
            </div>

            {
    /* Resources */
  }
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-400" />
                Resources
              </h4>
              <ul className="space-y-3">
                {resources.map((link, index) => <li key={index}>
                    <Link
    href={link.href}
    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm block group"
  >
                      <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                        {link.name}
                      </span>
                    </Link>
                  </li>)}
              </ul>
            </div>

            {
    /* About */
  }
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-400" />
                About
              </h4>
              <ul className="space-y-3">
                {about.map((link, index) => <li key={index}>
                    <Link
    href={link.href}
    className="text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm block group"
  >
                      <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                        {link.name}
                      </span>
                    </Link>
                  </li>)}
              </ul>
            </div>
          </div>



          {
    /* Bottom Section */
  }
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-sm text-gray-400 text-center lg:text-left">
                © {currentYear} ResQVerse. All rights reserved. • Built for humanity in crisis • 
                <span className="text-red-400 ml-1">Emergency Hotline: +91 9876543210</span>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors" data-testid="link-privacy-policy">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors" data-testid="link-terms">
                  Terms of Service
                </Link>
                <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors" data-testid="link-accessibility">
                  Accessibility
                </Link>
                <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
              </div>
            </div>

        </div>
        </div>
      </div>
    </footer>;
}
export {
  Footer as default
};
