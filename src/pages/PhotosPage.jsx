import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Heart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PhotosPage() {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Load Photos from localStorage
  const loadPhotos = () => {
    setLoading(true);
    try {
      const savedPhotos = localStorage.getItem('admin_photos');
      console.log("Loading photos from localStorage:", savedPhotos);
      
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        console.log("Parsed photos:", parsedPhotos);
        
        if (parsedPhotos && parsedPhotos.length > 0) {
          setPhotos(parsedPhotos);
        } else {
          setPhotos([]);
        }
      } else {
        console.log("No photos found in localStorage");
        setPhotos([]);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPhotos();
    
    // Listen for storage changes from admin panel
    const handleStorageChange = (e) => {
      console.log("Storage changed:", e.key, e.newValue);
      if (e.key === 'admin_photos') {
        loadPhotos();
        setRefreshKey(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (for same tab updates)
    const handlePhotosUpdate = () => {
      console.log("Photos update event received");
      loadPhotos();
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('photosUpdated', handlePhotosUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('photosUpdated', handlePhotosUpdate);
    };
  }, []);
  
  const currentIndex = selectedPhoto ? photos.findIndex(p => p.id === selectedPhoto.id) : -1;
  
  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };
  
  const FullScreenViewer = ({ photo, onClose, onNext, onPrev, hasNext, hasPrev }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center"
        onClick={onClose}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition">
          <X className="w-6 h-6 text-white" />
        </button>
        
        {hasPrev && (
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition">
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}
        
        {hasNext && (
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition">
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
        
        <div className="max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
          <img src={photo.url} alt={photo.caption} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
          <div className="text-center mt-4">
            <p className="text-white text-lg">{photo.caption}</p>
            <p className="text-rose-400 text-sm mt-1">{photo.date}</p>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      </motion.div>
    );
  };
  
  // Force refresh function
  const handleRefresh = () => {
    loadPhotos();
    setRefreshKey(prev => prev + 1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading photos...</p>
        </div>
      </div>
    );
  }
  
  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-black p-4 pb-24">
        <button 
          onClick={() => navigate('/')} 
          className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
        >
          <ArrowLeft className="w-6 h-6 text-rose-400" />
        </button>
        
        <div className="text-center mt-20">
          <Heart className="w-16 h-16 text-rose-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 text-lg">No photos added yet.</p>
          <p className="text-rose-400 text-sm mt-2">Add photos from Admin Panel! 📸</p>
          <button
            onClick={handleRefresh}
            className="mt-6 px-4 py-2 bg-rose-500/20 text-rose-400 rounded-lg inline-flex items-center gap-2 hover:bg-rose-500/30 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      <div className="flex justify-between items-center fixed top-4 left-4 right-4 z-20">
        <button onClick={() => navigate('/')} className="bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition">
          <ArrowLeft className="w-6 h-6 text-rose-400" />
        </button>
        
        <button onClick={handleRefresh} className="bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition">
          <RefreshCw className="w-5 h-5 text-rose-400" />
        </button>
      </div>
      
      <div className="text-center mb-8 mt-16">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          Our Photo Gallery
        </h1>
        <p className="text-gray-400 mt-2">{photos.length} beautiful moments captured 📸</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {photos.map((photo, index) => (
          <motion.div
            key={`${photo.id}-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl cursor-pointer bg-black/20"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img 
              src={photo.url} 
              alt={photo.caption} 
              className="w-full h-80 object-cover transition duration-500 group-hover:scale-110" 
              onError={(e) => {
                console.error("Image failed to load:", photo.url);
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition duration-300">
              <p className="text-white font-semibold">{photo.caption}</p>
              <p className="text-rose-400 text-sm">{photo.date}</p>
            </div>
            <div className="absolute top-2 right-2 bg-rose-500/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {selectedPhoto && (
          <FullScreenViewer
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={currentIndex < photos.length - 1}
            hasPrev={currentIndex > 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
}