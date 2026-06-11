import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Menu,
  Search,
  X,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memoryData } from "../data/memoryData";

export default function ChatsPage() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef([]);
  const containerRef = useRef(null);
  


  const totalSections = memoryData.length;
  const totalMessages = memoryData.reduce(
    (total, section) => total + section.messages.length,
    0
  );

  // Filter chapters for search
  const filteredChapters = useMemo(() => {
    return memoryData.filter((chapter, idx) =>
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idx.toString().includes(searchTerm)
    );
  }, [searchTerm]);

  // Scroll to specific chapter
  const scrollToChapter = useCallback((index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      setActiveChapter(index);
      setIsDrawerOpen(false);
    }
  }, []);

  // Update active chapter on scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = window.scrollY;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);

    // Update active chapter based on scroll position
    for (let i = 0; i < sectionRefs.current.length; i++) {
      const ref = sectionRefs.current[i];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveChapter(i);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Fast navigator jump
  const handleNavigatorClick = (index) => {
    scrollToChapter(index);
  };

  const handleNavigatorDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percent = y / rect.height;
    const index = Math.floor(percent * totalSections);
    if (index >= 0 && index < totalSections) {
      scrollToChapter(index);
    }
  };

  const totalRead = useMemo(() => {
    return Math.floor(scrollProgress);
  }, [scrollProgress]);

  return (
    <div className="min-h-screen bg-black" ref={containerRef}>
      {/* Premium Background Effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-rose-950/20 via-black to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Premium Sticky Header */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-rose-500/20 shadow-2xl"
        >
          <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => navigate("/")}
                className="group flex items-center gap-2 text-rose-400 transition-all duration-300 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 rounded-full px-4 py-2 text-rose-400 active:scale-95 transition-all duration-300"
              >
                <Menu className="w-4 h-4" />
                <span className="text-sm font-medium">Chapters</span>
              </button>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
                Our Memory Album
                <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {totalMessages} precious moments · {totalSections} beautiful chapters
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3 mt-4">
              <div className="flex-1 bg-white/5 backdrop-blur-sm border border-rose-500/20 rounded-2xl px-4 py-3">
                <p className="text-rose-400 text-xs flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Chapters
                </p>
                <p className="text-white text-2xl font-bold">{totalSections}</p>
              </div>
              <div className="flex-1 bg-white/5 backdrop-blur-sm border border-rose-500/20 rounded-2xl px-4 py-3">
                <p className="text-rose-400 text-xs flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> Messages
                </p>
                <p className="text-white text-2xl font-bold">{totalMessages}</p>
              </div>
              <div className="flex-1 bg-white/5 backdrop-blur-sm border border-rose-500/20 rounded-2xl px-4 py-3">
                <p className="text-rose-400 text-xs flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Read
                </p>
                <p className="text-white text-2xl font-bold">{totalRead}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Memory Sections */}
        <div className="px-4 py-6 pb-32">
          {memoryData.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              ref={el => sectionRefs.current[sectionIndex] = el}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.05 }}
              className="mb-12"
            >
              {/* Premium Chapter Header */}
              <div className="sticky top-24 z-10 bg-black/60 backdrop-blur-md rounded-2xl p-4 mb-5 border border-rose-500/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-rose-400">
                      {section.title}
                    </h2>
                    <p className="text-gray-500 text-xs">
                      {section.messages.length} messages
                    </p>
                  </div>
                  <Heart className="w-5 h-5 text-rose-400/50" />
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3 pl-2">
                {section.messages.map((msg, msgIndex) => (
                  <motion.div
                    key={msgIndex}
                    initial={{ opacity: 0, x: msg.sender.includes("Yaso") ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.sender.includes("Yaso") ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        msg.sender.includes("Yaso")
                          ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-br-sm shadow-xl"
                          : "bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 rounded-bl-sm"
                      }`}
                      style={{ userSelect: "none", WebkitTapHighlightColor: "transparent" }}
                    >
                     <div className="flex items-center justify-between mb-1">
  <p className="text-xs text-rose-300">
    {msg.sender}
  </p>

  {msg.time && (
    <span className="text-[10px] text-white/40 font-medium">
  {msg.time}
</span>
  )}
</div>

<p className="text-white whitespace-pre-wrap leading-relaxed">
  {msg.text}
</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Elegant Separator */}
              {sectionIndex < totalSections - 1 && (
                <div className="flex justify-center my-8">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                  <Heart className="w-4 h-4 text-rose-500/50 mx-2" />
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reading Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 left-4 z-30 bg-black/80 backdrop-blur-md rounded-full px-3 py-2 border border-rose-500/30 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
          <span className="text-rose-400 text-xs font-medium">{totalRead}% Memories Read</span>
        </div>
      </motion.div>

      {/* Floating Chapter Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all duration-300"
      >
        <Heart className="w-6 h-6 fill-white" />
        <span className="text-[9px] font-medium mt-0.5">Menu</span>
      </motion.button>

      {/* Right Side Fast Navigator */}
      <div className="fixed right-1 top-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col gap-1 py-4">
          {memoryData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigatorClick(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                idx === activeChapter
                  ? "bg-rose-500 w-3 h-3 shadow-lg shadow-rose-500/50"
                  : "bg-rose-500/30 hover:bg-rose-500/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Premium Chapter Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-85 bg-gradient-to-b from-gray-900 via-black to-black z-50 shadow-2xl border-l border-rose-500/20"
            >
              <div className="p-5 border-b border-rose-500/20 bg-black/50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-rose-400 text-lg font-bold flex items-center gap-2">
                      Memory Chapters
                      <Heart className="w-4 h-4 fill-rose-400" />
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">{totalSections} beautiful chapters</p>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search memories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-rose-500/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-all text-sm"
                  />
                </div>
              </div>
              
              <div className="h-[calc(100%-140px)] overflow-y-auto">
                {filteredChapters.map((chapter, idx) => {
                  const originalIndex = memoryData.findIndex(c => c.title === chapter.title);
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToChapter(originalIndex)}
                      className={`w-full text-left px-5 py-3.5 border-b border-gray-800/50 transition-all duration-300 ${
                        activeChapter === originalIndex
                          ? "bg-gradient-to-r from-rose-500/20 to-transparent border-l-4 border-l-rose-500"
                          : "hover:bg-white/5"
                      }`}
                    >

                      
                      <div className="flex items-center gap-3">
                        <span className="text-rose-400 text-xs font-mono font-bold">
                          #{String(originalIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="text-gray-200 text-sm flex-1">
                          {chapter.title}
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                      </div>
                      <p className="text-gray-600 text-xs mt-1 pl-8">
                        {chapter.messages.length} messages
                      </p>
                    </button>
                  );
                })}
                {filteredChapters.length === 0 && (
                  <div className="text-center text-gray-500 py-20">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No memories found 💔</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}