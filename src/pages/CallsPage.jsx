import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Heart, Play, Pause, Phone, Clock, 
  Volume2, VolumeX, Music, Calendar,
  Cloud, Edit2, Check, X, Plus, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Audio Seek Bar with full control
const AudioSeekBar = ({ currentTime, duration, onSeek }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  
  const percentage = duration > 0 ? ((isDragging ? seekValue : currentTime) / duration) * 100 : 0;
  
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newTime = percentage * duration;
    onSeek(newTime);
  };
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newTime = percentage * duration;
    setSeekValue(newTime);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, x / width));
      const newTime = percentage * duration;
      setSeekValue(newTime);
    }
  };
  
  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      onSeek(seekValue);
    }
  };
  
  useEffect(() => {
    if (!isDragging) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isDragging]);
  
  return (
    <div className="w-full space-y-2">
      <div 
        className="relative h-2 bg-rose-500/20 rounded-full cursor-pointer group"
        onClick={handleSeek}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="absolute h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
};

// Simple animated waveform
const AudioWaveform = ({ isPlaying }) => {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-gradient-to-t from-rose-400 to-rose-600 rounded-full"
          animate={{
            height: isPlaying ? [4, 20, 4] : 4,
            opacity: isPlaying ? [0.5, 1, 0.5] : 0.3
          }}
          transition={{
            duration: 0.4,
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.02,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Add Call Modal Component
const AddCallModal = ({ onClose, onAdd, isOpen }) => {
  const [callNumber, setCallNumber] = useState('');
  const [callDate, setCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');

  const handleUrlChange = (e) => {
    setAudioUrl(e.target.value);
    setError('');
  };

  const handleSubmit = () => {
    if (!callNumber.trim()) {
      setError('Please enter a call number');
      return;
    }
    if (!audioUrl.trim()) {
      setError('Please enter an audio URL');
      return;
    }

    const newCall = {
      id: Date.now(),
      title: callNumber.trim(),
      date: callDate,
      time: callTime,
      audioUrl: audioUrl.trim(),
      createdAt: new Date().toISOString()
    };

    const existingCalls = localStorage.getItem('audio_calls');
    let calls = existingCalls ? JSON.parse(existingCalls) : [];
    calls.push(newCall);
    localStorage.setItem('audio_calls', JSON.stringify(calls));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'audio_calls',
      newValue: JSON.stringify(calls)
    }));
    
    onAdd(newCall);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-rose-950/30 to-black/80 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-rose-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="w-6 h-6 text-rose-400" />
            Add New Call
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-rose-400 text-sm mb-2">Call Number</label>
            <input
              type="text"
              value={callNumber}
              onChange={(e) => setCallNumber(e.target.value)}
              placeholder="e.g., 83, 84, 85"
              className="w-full bg-black/50 border border-rose-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-rose-400 text-sm mb-2">Date</label>
              <input
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                className="w-full bg-black/50 border border-rose-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition"
              />
            </div>
            <div>
              <label className="block text-rose-400 text-sm mb-2">Time</label>
              <input
                type="time"
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                className="w-full bg-black/50 border border-rose-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-rose-400 text-sm mb-2">Audio URL</label>
            <input
              type="url"
              value={audioUrl}
              onChange={handleUrlChange}
              placeholder="https://your-supabase-url/audio.mp3"
              className="w-full bg-black/50 border border-rose-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition"
            />
            <p className="text-gray-500 text-xs mt-1">Example: https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/1.mp3</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!audioUrl.trim() || !callNumber.trim()}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Call Recording
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CallCard = ({ call, isPlaying, onPlay, onPause, onFavoriteToggle, isFavorited }) => {
  const audioRef = useRef(null);
  const [audioError, setAudioError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };
    const handleEnded = () => onPause();
    const handleLoadedData = () => {
      setIsLoading(false);
      if (!isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    const handleError = (e) => {
      console.error("Audio error:", e);
      setAudioError(true);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !audioError) {
      audio.play().catch(error => {
        console.error("Audio play error:", error);
        setAudioError(true);
        onPause();
      });
    } else if (!isPlaying) {
      audio.pause();
    }
  }, [isPlaying, audioError, onPause]);

  const handlePlay = () => {
    setAudioError(false);
    onPlay();
  };

  const handleSeek = (time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const isValidAudioUrl = call.audioUrl && call.audioUrl !== '' && 
    (call.audioUrl.startsWith('http') || call.audioUrl.startsWith('blob:'));

  const displayDate = call.date ? new Date(call.date).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }) : 'Date not set';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-5 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-rose-400" />
              </div>
              {isPlaying && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <p className="text-white font-bold text-xl">#{call.title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-rose-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{displayDate}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{call.time}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400/60 text-xs">
                  <Music className="w-3 h-3" />
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Favorite Button - Per User */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onFavoriteToggle(call.id)}
            className="p-2 transition"
          >
            <Heart 
              className={`w-6 h-6 transition-all ${
                isFavorited 
                  ? 'text-rose-500 fill-rose-500' 
                  : 'text-gray-400 hover:text-rose-400'
              }`} 
            />
          </motion.button>
        </div>
        
        {call.audioUrl && call.audioUrl.includes('supabase.co') && (
          <div className="mb-3 flex items-center gap-1 text-xs text-rose-400/60">
            <Cloud className="w-3 h-3" />
            <span>Cloud Audio</span>
            <span className="text-gray-500 ml-1">(Call {call.title})</span>
          </div>
        )}
        
        {audioError && (
          <div className="mb-3 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg">
            ⚠️ Unable to play audio. Check your internet connection.
          </div>
        )}
        
        {isLoading && isValidAudioUrl && !audioError && (
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            <span className="text-gray-400 text-xs ml-2">Loading audio...</span>
          </div>
        )}
        
        {isValidAudioUrl && !audioError && duration > 0 && (
          <div className="mb-4">
            <AudioSeekBar 
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <AudioWaveform isPlaying={isPlaying && !isLoading && isValidAudioUrl && !audioError} />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? onPause : handlePlay}
            disabled={!isValidAudioUrl || audioError}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPlaying 
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30'
                : 'bg-gradient-to-r from-rose-500/80 to-rose-600/80 hover:shadow-lg hover:shadow-rose-500/30'
            } ${(!isValidAudioUrl || audioError) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </motion.button>
          
          {isValidAudioUrl && !audioError && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500/40 flex items-center justify-center transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
              </motion.button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-24 h-1 bg-rose-500/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400"
              />
            </div>
          )}
        </div>
        
        {isValidAudioUrl && (
          <audio 
            ref={audioRef} 
            src={call.audioUrl}
            preload="metadata"
            crossOrigin="anonymous"
          />
        )}
      </div>
    </motion.div>
  );
};

export default function CallsPage() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFavorites, setUserFavorites] = useState([]);

  // Load user favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('user_favorites');
    if (savedFavorites) {
      setUserFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save user favorites to localStorage
  const saveUserFavorites = (favorites) => {
    localStorage.setItem('user_favorites', JSON.stringify(favorites));
    setUserFavorites(favorites);
  };

  // Toggle favorite for a call
  const toggleFavorite = (callId) => {
    let newFavorites;
    if (userFavorites.includes(callId)) {
      newFavorites = userFavorites.filter(id => id !== callId);
    } else {
      newFavorites = [...userFavorites, callId];
    }
    saveUserFavorites(newFavorites);
  };

  // Check if a call is favorited by user
  const isCallFavorited = (callId) => {
    return userFavorites.includes(callId);
  };

  // ============================================
  // 📝 EDIT YOUR 82 CALLS HERE - Only number, date, time, audioUrl
  // ============================================
  
  const allAudioCalls = [
    // Call 1 to 10
    { id: 1, title: "1", date: "2024-06-01", time: "10:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/1.mp3" },
    { id: 2, title: "2", date: "2024-06-02", time: "02:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/2.mp3" },
    { id: 3, title: "3", date: "2024-06-03", time: "07:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/3.mp3" },
    { id: 4, title: "4", date: "2024-06-04", time: "11:20 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/4.mp3" },
    { id: 5, title: "5", date: "2024-06-05", time: "09:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/5.mp3" },
    { id: 6, title: "6", date: "2024-06-06", time: "03:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/6.mp3" },
    { id: 7, title: "7", date: "2024-06-07", time: "08:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/7.mp3" },
    { id: 8, title: "8", date: "2024-06-08", time: "10:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/8.mp3" },
    { id: 9, title: "9", date: "2024-06-09", time: "01:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/9.mp3" },
    { id: 10, title: "10", date: "2024-06-10", time: "06:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/10.mp3" },
    
    // Call 11 to 20
    { id: 11, title: "11", date: "2024-06-11", time: "09:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/11.mp3" },
    { id: 12, title: "12", date: "2024-06-12", time: "04:20 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/12.mp3" },
    { id: 13, title: "13", date: "2024-06-13", time: "11:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/13.mp3" },
    { id: 14, title: "14", date: "2024-06-14", time: "07:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/14.mp3" },
    { id: 15, title: "15", date: "2024-06-15", time: "02:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/15.mp3" },
    { id: 16, title: "16", date: "2024-06-16", time: "08:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/16.mp3" },
    { id: 17, title: "17", date: "2024-06-17", time: "12:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/17.mp3" },
    { id: 18, title: "18", date: "2024-06-18", time: "05:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/18.mp3" },
    { id: 19, title: "19", date: "2024-06-19", time: "10:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/19.mp3" },
    { id: 20, title: "20", date: "2024-06-20", time: "03:00 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/20.mp3" },
    
    // Call 21 to 30
    { id: 21, title: "21", date: "2024-06-21", time: "11:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/21.mp3" },
    { id: 22, title: "22", date: "2024-06-22", time: "04:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/22.mp3" },
    { id: 23, title: "23", date: "2024-06-23", time: "09:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/23.mp3" },
    { id: 24, title: "24", date: "2024-06-24", time: "06:00 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/24.mp3" },
    { id: 25, title: "25", date: "2024-06-25", time: "01:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/25.mp3" },
    { id: 26, title: "26", date: "2024-06-26", time: "07:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/26.mp3" },
    { id: 27, title: "27", date: "2024-06-27", time: "12:00 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/27.mp3" },
    { id: 28, title: "28", date: "2024-06-28", time: "08:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/28.mp3" },
    { id: 29, title: "29", date: "2024-06-29", time: "03:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/29.mp3" },
    { id: 30, title: "30", date: "2024-06-30", time: "10:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/30.mp3" },
    
    // Call 31 to 40
    { id: 31, title: "31", date: "2024-07-01", time: "05:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/31.mp3" },
    { id: 32, title: "32", date: "2024-07-02", time: "11:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/32.mp3" },
    { id: 33, title: "33", date: "2024-07-03", time: "08:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/33.mp3" },
    { id: 34, title: "34", date: "2024-07-04", time: "02:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/34.mp3" },
    { id: 35, title: "35", date: "2024-07-05", time: "09:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/35.mp3" },
    { id: 36, title: "36", date: "2024-07-06", time: "04:45 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/36.mp3" },
    { id: 37, title: "37", date: "2024-07-07", time: "12:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/37.mp3" },
    { id: 38, title: "38", date: "2024-07-08", time: "07:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/38.mp3" },
    { id: 39, title: "39", date: "2024-07-09", time: "01:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/39.mp3" },
    { id: 40, title: "40", date: "2024-07-10", time: "06:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/40.mp3" },
    
    // Call 41 to 50
    { id: 41, title: "41", date: "2024-07-11", time: "10:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/41.mp3" },
    { id: 42, title: "42", date: "2024-07-12", time: "03:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/42.mp3" },
    { id: 43, title: "43", date: "2024-07-13", time: "09:00 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/43.mp3" },
    { id: 44, title: "44", date: "2024-07-14", time: "05:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/44.mp3" },
    { id: 45, title: "45", date: "2024-07-15", time: "12:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/45.mp3" },
    { id: 46, title: "46", date: "2024-07-16", time: "08:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/46.mp3" },
    { id: 47, title: "47", date: "2024-07-17", time: "02:45 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/47.mp3" },
    { id: 48, title: "48", date: "2024-07-18", time: "11:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/48.mp3" },
    { id: 49, title: "49", date: "2024-07-19", time: "07:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/49.mp3" },
    { id: 50, title: "50", date: "2024-07-20", time: "04:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/50.mp3" },
    
    // Call 51 to 60
    { id: 51, title: "51", date: "2024-07-21", time: "10:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/51.mp3" },
    { id: 52, title: "52", date: "2024-07-22", time: "01:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/52.mp3" },
    { id: 53, title: "53", date: "2024-07-23", time: "09:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/53.mp3" },
    { id: 54, title: "54", date: "2024-07-24", time: "06:00 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/54.mp3" },
    { id: 55, title: "55", date: "2024-07-25", time: "03:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/55.mp3" },
    { id: 56, title: "56", date: "2024-07-26", time: "11:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/56.mp3" },
    { id: 57, title: "57", date: "2024-07-27", time: "08:00 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/57.mp3" },
    { id: 58, title: "58", date: "2024-07-28", time: "05:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/58.mp3" },
    { id: 59, title: "59", date: "2024-07-29", time: "12:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/59.mp3" },
    { id: 60, title: "60", date: "2024-07-30", time: "07:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/60.mp3" },
    
    // Call 61 to 70
    { id: 61, title: "61", date: "2024-08-01", time: "02:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/61.mp3" },
    { id: 62, title: "62", date: "2024-08-02", time: "10:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/62.mp3" },
    { id: 63, title: "63", date: "2024-08-03", time: "06:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/63.mp3" },
    { id: 64, title: "64", date: "2024-08-04", time: "11:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/64.mp3" },
    { id: 65, title: "65", date: "2024-08-05", time: "04:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/65.mp3" },
    { id: 66, title: "66", date: "2024-08-06", time: "09:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/66.mp3" },
    { id: 67, title: "67", date: "2024-08-07", time: "01:15 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/67.mp3" },
    { id: 68, title: "68", date: "2024-08-08", time: "07:30 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/68.mp3" },
    { id: 69, title: "69", date: "2024-08-09", time: "03:45 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/69.mp3" },
    { id: 70, title: "70", date: "2024-08-10", time: "12:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/70.mp3" },
    
    // Call 71 to 82
    { id: 71, title: "71", date: "2024-08-11", time: "08:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/71.mp3" },
    { id: 72, title: "72", date: "2024-08-12", time: "05:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/72.mp3" },
    { id: 73, title: "73", date: "2024-08-13", time: "10:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/73.mp3" },
    { id: 74, title: "74", date: "2024-08-14", time: "02:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/74.mp3" },
    { id: 75, title: "75", date: "2024-08-15", time: "09:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/75.mp3" },
    { id: 76, title: "76", date: "2024-08-16", time: "06:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/76.mp3" },
    { id: 77, title: "77", date: "2024-08-17", time: "11:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/77.mp3" },
    { id: 78, title: "78", date: "2024-08-18", time: "04:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/78.mp3" },
    { id: 79, title: "79", date: "2024-08-19", time: "01:00 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/79.mp3" },
    { id: 80, title: "80", date: "2024-08-20", time: "07:15 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/80.mp3" },
    { id: 81, title: "81", date: "2024-08-21", time: "12:30 AM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/81.mp3" },
    { id: 82, title: "82", date: "2024-08-22", time: "08:45 PM", audioUrl: "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio/82.mp3" }
  ];
  
  // Load calls from localStorage or use generated data
  useEffect(() => {
    loadCalls();
    
    const handleStorageChange = (e) => {
      if (e.key === 'audio_calls') {
        loadCalls();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const loadCalls = () => {
    const savedCalls = localStorage.getItem('audio_calls');
    
    if (savedCalls && JSON.parse(savedCalls).length > 0) {
      try {
        let callsData = JSON.parse(savedCalls);
        callsData = callsData.filter(call => call && call.id);
        const sorted = callsData.sort((a, b) => parseInt(a.title) - parseInt(b.title));
        setCalls(sorted);
      } catch (error) {
        console.error("Error parsing calls:", error);
        setCalls(allAudioCalls);
        localStorage.setItem('audio_calls', JSON.stringify(allAudioCalls));
      }
    } else {
      setCalls(allAudioCalls);
      localStorage.setItem('audio_calls', JSON.stringify(allAudioCalls));
    }
  };
  
  const handleAddCall = (newCall) => {
    loadCalls();
  };
  
  // Filter by user favorites and search term
  const filteredCalls = calls.filter(call => {
    const matchesFavorite = showFavoritesOnly ? isCallFavorited(call.id) : true;
    const matchesSearch = searchTerm === '' || 
      call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.date.includes(searchTerm);
    return matchesFavorite && matchesSearch;
  });
  
  const handlePlay = (id) => {
    if (playingId && playingId !== id) {
      setPlayingId(null);
      setTimeout(() => setPlayingId(id), 100);
    } else {
      setPlayingId(id);
    }
  };
  
  const handlePause = () => {
    setPlayingId(null);
  };
  
  const totalCalls = calls.length;
  const favoriteCalls = userFavorites.length;
  
  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-rose-950/10 via-black to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-rose-500/20">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 transition mb-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
                  Call Memories
                </h1>
                <p className="text-gray-400 mt-1">82 Special Voice Calls 💕</p>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-500/20">
                  <p className="text-rose-400 text-xs">Total Calls</p>
                  <p className="text-white text-xl font-bold">{totalCalls}</p>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-rose-500/20">
                  <p className="text-rose-400 text-xs">My Favorites</p>
                  <p className="text-white text-xl font-bold">{favoriteCalls}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by call number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-rose-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  showFavoritesOnly 
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-black/50 border border-rose-500/30 text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                {showFavoritesOnly ? 'My Favorites' : 'All Calls'}
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-lg hover:shadow-rose-500/30 transition"
              >
                <Plus className="w-4 h-4" />
                Add Call
              </button>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm">
              Showing {filteredCalls.length} of {calls.length} calls
            </p>
          </div>
          
          {/* Calls Grid */}
          {filteredCalls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-full flex items-center justify-center">
                  <Heart className="w-16 h-16 text-rose-400 opacity-50" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {showFavoritesOnly ? 'No Favorite Calls Yet' : 'No Calls Found'}
              </h2>
              <p className="text-gray-400">
                {showFavoritesOnly 
                  ? 'Click the heart icon on any call to add to your favorites ❤️' 
                  : searchTerm ? 'Try a different search term' : 'Click the + button to add a call'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredCalls.map((call) => (
                  <CallCard
                    key={call.id}
                    call={call}
                    isPlaying={playingId === call.id}
                    onPlay={() => handlePlay(call.id)}
                    onPause={handlePause}
                    onFavoriteToggle={toggleFavorite}
                    isFavorited={isCallFavorited(call.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 z-20 bg-gradient-to-r from-rose-500 to-rose-600 p-4 rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all group"
      >
        <Plus className="w-6 h-6 text-white group-hover:scale-110 transition" />
      </button>
      
      <AnimatePresence>
        {showAddModal && (
          <AddCallModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddCall}
          />
        )}
      </AnimatePresence>
    </div>
  );
}