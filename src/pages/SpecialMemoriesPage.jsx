import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MemoriesGallery = () => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [memories, setMemories] = useState([]);
  
  // Load photos from localStorage
  useEffect(() => {
    loadPhotos();
  }, []);
  
  const loadPhotos = () => {
    const savedMemories = localStorage.getItem('admin_special_memories');
    if (savedMemories && JSON.parse(savedMemories).length > 0) {
      setMemories(JSON.parse(savedMemories));
    } else {
      // Default photos if nothing in localStorage
      const defaultPhotos = [
        {
          id: 1,
          url: "/videos/love.png",
          caption: "Our First Date ❤️",
          date: "April 1, 2026"
        },
        {
          id: 2,
          url: "/videos/kiss.jpeg",
          caption: "First Kiss Unforgettable 💕",
          date: "May 6, 2026"
        }
      ];
      setMemories(defaultPhotos);
      localStorage.setItem('admin_special_memories', JSON.stringify(defaultPhotos));
    }
  };
  
  // Listen for storage changes (when admin adds new photos)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'admin_special_memories') {
        loadPhotos();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const currentIndex = selectedPhoto ? memories.findIndex(p => p.id === selectedPhoto.id) : -1;
  
  const handleNext = () => {
    if (currentIndex < memories.length - 1) {
      setSelectedPhoto(memories[currentIndex + 1]);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(memories[currentIndex - 1]);
    }
  };
  
  // Full Screen Viewer Component
  const FullScreenViewer = ({ photo, onClose, onNext, onPrev, hasNext, hasPrev }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition hover:scale-110"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        {/* Previous Button */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition hover:scale-110"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}
        
        {/* Next Button */}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition hover:scale-110"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
        
        {/* Image Container */}
        <div className="max-w-7xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
          {photo.type === 'video' ? (
  <video
    src={photo.url}
    controls
    autoPlay
    className="max-w-full max-h-[85vh] object-contain rounded-lg"
  />
) : (
  <motion.img
    key={photo.id}
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
    src={photo.url}
    alt={photo.caption}
    className="max-w-full max-h-[85vh] object-contain rounded-lg"
  />
)}
          
          {/* Caption and Date */}
          <div className="text-center mt-4">
            <p className="text-white text-xl font-semibold">{photo.caption}</p>
            <p className="text-rose-400 text-sm mt-1">{photo.date}</p>
          </div>
        </div>
        
        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
          {currentIndex + 1} / {memories.length}
        </div>
      </motion.div>
    );
  };
  
  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-rose-400 mx-auto mb-4 opacity-50" />
        <p className="text-gray-400">No memories added yet.</p>
        <p className="text-rose-400 text-sm mt-2">Add photos from Admin Panel! 📸</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full px-6 py-3">
          <Award className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Certified Memory ❤️</span>
        </div>
        <p className="text-gray-400 mt-3 text-sm">{memories.length} Special Memories Captured 📸</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/30 to-black/50 backdrop-blur-sm border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedPhoto(memory)}
          >
            {memory.type === 'video' ? (
  <video
    src={memory.url}
    className="w-full h-64 object-cover"
    controls
  />
) : (
  <img
    src={memory.url}
    alt={memory.caption}
    className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
  />
)}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-semibold text-lg">{memory.caption}</p>
              <p className="text-rose-400 text-sm">{memory.date}</p>
            </div>
            
            {/* Click hint overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <div className="bg-rose-500/80 rounded-full p-3">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Full Screen Viewer Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <FullScreenViewer
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={currentIndex < memories.length - 1}
            hasPrev={currentIndex > 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SpecialMemoriesPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
      >
        <ArrowLeft className="w-6 h-6 text-rose-400" />
      </button>
      
      <div className="text-center mb-8 mt-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          Special Memories ❤️
        </h1>
        <p className="text-gray-400 mt-2">Click on any memory to view full screen 📸</p>
      </div>
      
      <MemoriesGallery />
    </div>
  );
}