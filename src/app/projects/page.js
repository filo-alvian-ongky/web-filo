"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Apple, Cpu, Play, BarChart3 } from "lucide-react";
import Card from "../../components/Card";

const projects = [
  {
    id: "fruitsense",
    title: "FruitSense App",
    tags: ["AI & Mobile", "Marketplace"],
    embedUrl: "https://www.canva.com/design/DAHJjRnShp0/NP4NuZwDhYS4VWi6dQZoYQ/view?embed",
    colorClass: "from-green-100 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/10",
    vectorIcon: <Apple size={100} className="text-emerald-500/80" />
  },
  {
    id: "fortunas",
    title: "Fortunas AI",
    tags: ["Business Intelligence", "Assistant Management"],
    embedUrl: "https://www.canva.com/design/DAHJjUdm9xQ/9zYv0ehSrRekGfcrBe9ktw/view?embed",
    colorClass: "from-blue-100 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10",
    vectorIcon: (
      <div className="relative">
        <Cpu size={100} className="text-blue-500/80" />
        <BarChart3 size={40} className="absolute -bottom-2 -right-2 text-indigo-600" />
      </div>
    )
  }
];

export default function Projects() {
  const [selectedId, setSelectedId] = useState(null);
  const activeProject = projects.find((p) => p.id === selectedId);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold mb-12 tracking-tighter"
        >
          Karya & Proyek.
        </motion.h1>

        {/* GRID PROYEK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project) => (
            <motion.div 
              key={project.id} 
              layoutId={project.id} 
              onClick={() => setSelectedId(project.id)} 
              // TAMBAHAN: Efek klik membal pada Card Project
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer group"
            >
              <Card className="p-0 overflow-hidden flex flex-col h-full border-none bg-gray-50 dark:bg-neutral-900/40 relative">
                
                {/* VECTOR COVER AREA */}
                <div className={`h-80 bg-gradient-to-br ${project.colorClass} flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-[1.01]`}>
                  <div className="absolute top-10 -right-10 w-40 h-40 bg-white/20 dark:bg-white/5 rounded-full blur-3xl"></div>
                  
                  <motion.div className="z-10 transition-transform duration-500 group-hover:scale-110">
                    {project.vectorIcon}
                  </motion.div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 p-4 bg-white/90 dark:bg-blue-600 text-blue-600 dark:text-white rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                      <Play size={28} fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* INFO AREA */}
                <div className="p-8">
                  <h2 className="text-3xl font-bold tracking-tighter mb-4 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-4 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* MODAL PLAYER */}
        <AnimatePresence>
          {selectedId && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100] cursor-zoom-out"
              />
              
              <div className="fixed inset-0 flex items-center justify-center z-[101] px-4 md:px-10 pointer-events-none">
                <motion.div
                  layoutId={selectedId}
                  className="bg-black w-full max-w-6xl aspect-video rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl pointer-events-auto relative border border-white/10"
                >
                  <button 
                    onClick={() => setSelectedId(null)}
                    // TAMBAHAN: Efek klik membal pada tombol close
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-red-500 backdrop-blur-md text-white rounded-2xl z-[102] transition-transform active:scale-90"
                  >
                    <X size={24} strokeWidth={2.5} />
                  </button>

                  <div className="w-full h-full bg-neutral-900">
                    <iframe
                      src={activeProject.embedUrl}
                      className="w-full h-full border-none"
                      allowFullScreen
                      allow="autoplay"
                    ></iframe>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}