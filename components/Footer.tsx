import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-footer text-white mt-12 py-10 border-t-4 border-brand-breaking">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
             <h3 className="text-2xl font-bold mb-4">
              न्यूज़ऑर्बिट इंडिया
             </h3>
             <p className="text-text-muted text-sm leading-relaxed">
               भारत की धड़कन, दुनिया की नज़र।
             </p>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-bold mb-4 text-brand-link uppercase text-sm tracking-wider">हमसे जुड़ें (Follow Us)</h4>
            <div className="flex flex-col space-y-3 text-sm text-text-muted">
              {/* PASTE YOUR LINKS IN THE href="" ATTRIBUTES BELOW */}
              
              <a 
                href="https://www.facebook.com/share/1BtGdMdjXY/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-blue-500 transition"
              >
                <Facebook size={20} /> Facebook
              </a>

              <a 
                href="https://www.instagram.com/newsorbitindia?igsh=bmc0Z3ZkbmlmOTNj&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-pink-500 transition"
              >
                <Instagram size={20} /> Instagram
              </a>

              <a 
                href="https://youtube.com/@newsorbitindia?si=wvi3ob8WA-dauG6G" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-red-500 transition"
              >
                <Youtube size={20} /> YouTube
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} NewsOrbit India. सर्वाधिकार सुरक्षित.
        </div>
      </div>
    </footer>
  );
};

export default Footer;