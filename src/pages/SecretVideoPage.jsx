import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Award, ArrowLeft, Star, Check, Headphones, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WrongAnswerMessage = ({ attempt, onClose }) => {
  const messages = [
    { text: "Memory Not Found ❌ Boyfriend Disappointed Level: 25% 😭❤️", emoji: "😭", level: "25%" },
    { text: "Suspicious Activity Detected 🤨 Indha memory unakku nyabagam illaya? ❤️", emoji: "🤨", level: "50%" },
    { text: "Emergency Alert 🚨 Girlfriend Memory System Offline 😭", emoji: "🚨", level: "75%" },
    { text: "⚠️ FINAL WARNING ⚠️\nLast chance before contacting Boyfriend support team! 😭 ", emoji: "📞", level: "100%" }
  ];
  
  const message = messages[Math.min(attempt - 1, messages.length - 1)];
  const isFinal = attempt >= 4;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div 
        className="bg-gradient-to-br from-red-950/95 to-black/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-red-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-7xl mb-4">{message.emoji}</div>
          <p className="text-red-300 text-lg whitespace-pre-line">{message.text}</p>
          
          {!isFinal && (
            <div className="mt-4">
              <div className="w-full bg-black/50 rounded-full h-2">
                <motion.div 
                  className="bg-red-500 rounded-full h-2"
                  initial={{ width: "0%" }}
                  animate={{ width: message.level }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-red-400 text-xs mt-2">Boyfriend Disappointment Level: {message.level}</p>
            </div>
          )}
          
          {isFinal && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t border-red-500/30"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Headphones className="w-5 h-5 text-rose-400" />
                <span className="text-rose-400 font-semibold">Contact Support</span>
              </div>
              <p className="text-gray-300 text-sm">📞 Call Boyfriend Support Team: <br/> 
              <span className="text-rose-400 font-mono">+91 9360875121</span></p>
            </motion.div>
          )}
          
          <button
            onClick={onClose}
            className="mt-6 bg-red-500/20 hover:bg-red-500/30 text-white px-6 py-2 rounded-lg transition text-sm"
          >
            {isFinal ? "I'll Remember Next Time 😢" : "Try Again ❤️"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CorrectAnswerMessage = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      onClick={onComplete}
    >
      <motion.div 
        className="bg-gradient-to-br from-green-950/90 to-black/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-green-500/30 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <div className="text-7xl mb-4">✅</div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-green-300 text-xl font-semibold"
        >
          Identity Verified ❤️
        </motion.p>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-rose-300 mt-2"
        >
          Welcome Darling 😘
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onComplete}
          className="mt-6 bg-gradient-to-r from-rose-500 to-rose-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition"
        >
          Open Secret Videos 🎥
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Secret Videos Data - Update with YOUR video paths
const secretVideos = [
  {
    id: 1,
    title: "Our first video call 💕",
    videoUrl: "/videos/secret1.mp4",  // Put video in public/videos/ folder
    thumbnail: "/videos/pookie.jpg",
    duration: "58:23",
    date: " 06 April 2026"
  },
  {
    id: 2,
    title: "VC with my Pookie  🐾",
    videoUrl: "/videos/secret2.mp4",
    thumbnail: "/videos/pookie.jpg",
    duration: "46:30",
    date: " 07 April 2026"
  },
  {
    id: 3,
    title: "VC with my Pookie  ✨",
    videoUrl: "/videos/secret3.mp4",
    thumbnail: "/videos/pookie.jpg",
    duration: "01:31:55",
    date: " 08 April 2026"
  },
  {
    id: 4,
    title: "VC with my Pookie  💌",
    videoUrl: "/videos/secret4.mp4",
    thumbnail: "/videos/pookie.jpg",
    duration: "53:18",
    date: " 09 April 2026"
  },
  {
    id: 5,
    title: "VC with my Pookie  💌",
    videoUrl: "/videos/secret5.mp4",
    thumbnail: "/videos/pookie.jpg",
    duration: "33:29",
    date: " 16 May 2026"
  }
];

const VideoModal = ({ video, onClose }) => {
  const [videoError, setVideoError] = useState(false);
  
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
        {!videoError ? (
          <video
            controls
            autoPlay
            className="w-full rounded-2xl"
            poster={video.thumbnail}
            onError={() => setVideoError(true)}
          >
            <source src={video.videoUrl} type="video/mp4" />
            <source src={video.videoUrl.replace('.mp4', '.webm')} type="video/webm" />
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="bg-gradient-to-br from-rose-950/30 to-black/50 rounded-2xl p-8 text-center border border-rose-500/30">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-white text-xl mb-2">Video Not Found</h3>
            <p className="text-gray-400 mb-4">
              Please add your video file to: <br/>
              <code className="text-rose-400">public/videos/{video.videoUrl.split('/').pop()}</code>
            </p>
            <div className="bg-black/50 rounded-lg p-4 text-left">
              <p className="text-rose-300 text-sm mb-2">📁 How to add video:</p>
              <p className="text-gray-400 text-xs">1. Create folder: <code className="text-rose-400">public/videos/</code></p>
              <p className="text-gray-400 text-xs">2. Copy your video to: <code className="text-rose-400">public/videos/{video.videoUrl.split('/').pop()}</code></p>
              <p className="text-gray-400 text-xs">3. Refresh and try again</p>
            </div>
          </div>
        )}
        <div className="mt-4 text-center">
          <h3 className="text-white text-xl">{video.title}</h3>
          <p className="text-rose-400">{video.date}</p>
        </div>
      </div>
    </motion.div>
  );
};

const SecretVideoGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full px-6 py-3 mb-6">
          
          <span className="text-white font-semibold"> ennoda voice kekkathu</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {secretVideos.map((video, index) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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
};

export default function SecretVideoPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorAttempt, setErrorAttempt] = useState(0);
  
  const correctAnswer = 'may 06';
  
  const dateOptions = [
    { value: 'april 01', label: 'April 1, 2026', emoji: '🌸' },
    { value: 'march 22', label: 'March 22, 2026', emoji: '💕' },
    { value: 'june 15', label: 'June 15, 2026', emoji: '✨' },
    { value: 'may 06', label: 'May 6, 2026', emoji: '💋' }
    
  ];
  
  const handleUnlock = () => {
    if (selectedDate === correctAnswer) {
      setShowSuccess(true);
      setShowError(false);
    } else {
      const newAttempt = errorAttempt + 1;
      setErrorAttempt(newAttempt);
      setShowError(true);
      
      const delay = newAttempt >= 4 ? 6000 : 4000;
      setTimeout(() => {
        setShowError(false);
      }, delay);
    }
  };
  
  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setIsUnlocked(true);
  };
  
  if (isUnlocked) {
    return (
      <div className="min-h-screen bg-black p-4 pb-24">
        <button
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 z-20 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition"
        >
          <ArrowLeft className="w-6 h-6 text-rose-400" />
        </button>
        <SecretVideoGallery />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AnimatePresence>
        {showError && <WrongAnswerMessage attempt={errorAttempt} onClose={() => setShowError(false)} />}
        {showSuccess && <CorrectAnswerMessage onComplete={handleSuccessComplete} />}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-8 border border-rose-500/30"
      >
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Secret Videos Locked 🔒</h2>
          <p className="text-gray-400">Answer correctly to unlock our secret videos</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-rose-400 mb-3 text-center">
              When was our First Kiss? 💋<br/>
              <span className="text-sm text-gray-500">(Our most special moment)</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {dateOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(option.value)}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    selectedDate === option.value
                      ? 'bg-gradient-to-r from-rose-500 to-rose-700 border-rose-400 shadow-lg shadow-rose-500/30'
                      : 'bg-black/50 border border-rose-500/30 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-white font-medium">{option.label}</span>
                  </div>
                  {selectedDate === option.value && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleUnlock}
            disabled={!selectedDate}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unlock Secret Videos 🎥
          </button>
          
          <p className="text-center text-gray-500 text-xs">
            Hint: It happened after our first date! 💋
          </p>
        </div>
      </motion.div>
    </div>
  );
}