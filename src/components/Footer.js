"use client";

import { ExternalLink, Mail, Phone, Heart } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Footer({ onOpenContact }) {
  return (
    <footer className="bg-gray-50 dark:bg-[#121212] pt-16 pb-8 border-t border-gray-200 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8 items-start">
          <div>
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Mari bekerja sama</div>
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">Punya proyek di pikiran?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Saya selalu terbuka untuk membahas proyek baru dan peluang. Ayo ciptakan sesuatu yang luar biasa bersama!
            </p>
            <button 
              onClick={onOpenContact} 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors gap-2 shadow-lg shadow-blue-500/20"
            >
              Hubungi Saya <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="md:text-right flex flex-col md:items-end justify-center h-full">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Media Sosial</div>
            
            {/* Social Buttons */}
            <div className="flex items-center gap-4 mb-6 md:justify-end">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:bg-blue-600 hover:text-white transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:bg-blue-600 hover:text-white transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/filoalvianongky" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 flex items-center justify-center text-black dark:text-white hover:bg-pink-600 hover:text-white transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>

            <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-400 md:items-end">
              <a href="mailto:filoalvianongky@gmail.com" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" /> filoalvianongky@gmail.com
              </a>
              <a href="tel:+6282140464565" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" /> +62 (821) 4046-4565
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 Filo Developer. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Filo
          </p>
        </div>
      </div>
    </footer>
  );
}