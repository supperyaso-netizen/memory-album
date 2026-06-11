import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VideosPage() {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  
  // Load videos from localStorage (where Admin Panel saves them)
  useEffect(() => {
    loadVideos();
    
    // Listen for storage changes (when admin adds new videos)
    const handleStorageChange = (e) => {
      if (e.key === 'admin_videos') {
        loadVideos();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const loadVideos = () => {
    const savedVideos = localStorage.getItem('admin_videos');
    console.log('Loading videos from localStorage:', savedVideos); // Debug log
    
    if (savedVideos && JSON.parse(savedVideos).length > 0) {
      setVideos(JSON.parse(savedVideos));
    } else {
      setVideos([]);
    }
  };
  
  const VideoModal = ({ video, onClose }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
          <video
            controls
            autoPlay
            className="w-full rounded-2xl"
            poster={video.thumbnail}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
          <div className="mt-4 text-center">
            <h3 className="text-white text-xl">{video.title}</h3>
            <p className="text-rose-400">{video.date}</p>
          </div>
        </div>
      </motion.div>
    );
  };
  
  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black p-4 pb-24">
        <button
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
        >
          <ArrowLeft className="w-6 h-6 text-rose-400" />
        </button>
        <div className="text-center mt-20">
          <Play className="w-16 h-16 text-rose-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">No videos added yet.</p>
          <p className="text-rose-400 text-sm mt-2">Go to Admin Panel and add videos! 🎥</p>
        </div>
      </div>
    );
  }
  
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
          Our Video Memories
        </h1>
        <p className="text-gray-400 mt-2">{videos.length} precious moments captured 🎬</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="group cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-64 object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition duration-300 flex items-center justify-center">
                <div className="w-16 h-16 bg-rose-500/80 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-sm">
                {video.duration}
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-white font-semibold">{video.title}</h3>
              <p className="text-rose-400 text-sm">{video.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}