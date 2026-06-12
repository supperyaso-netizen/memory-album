import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Heart, Play, Pause, Phone, Clock, 
  Star, Volume2, VolumeX, Music, User, Calendar,
  Cloud, Edit2, Check, X, Plus, Search, List, Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Parse duration string like "01:17:07" or "20:58" to seconds
const parseDurationString = (durationStr) => {
  if (!durationStr) return 0;
  
  if (durationStr.includes('/')) {
    const parts = durationStr.split('/');
    durationStr = parts[1]?.trim() || parts[0]?.trim();
  }
  
  const parts = durationStr.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else {
    return parseInt(parts[0]) || 0;
  }
};

// Audio Seek Bar
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

// Audio Waveform
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

// Add Call Modal
const AddCallModal = ({ onClose, onAdd, isOpen }) => {
  const [callTitle, setCallTitle] = useState('');
  const [callDate, setCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  const handleUrlChange = (e) => {
    setAudioUrl(e.target.value);
    setError('');
  };

  const handleGetDuration = async () => {
    if (!audioUrl) return;
    
    try {
      const tempAudio = new Audio(audioUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        setDuration(Math.floor(tempAudio.duration));
      });
      tempAudio.addEventListener('error', () => {
        setError('Unable to load audio from URL');
      });
    } catch (err) {
      setError('Invalid audio URL');
    }
  };

  const handleSubmit = () => {
    if (!callTitle.trim()) {
      setError('Please enter a call title');
      return;
    }
    if (!audioUrl.trim()) {
      setError('Please enter an audio URL');
      return;
    }

    const newCall = {
      id: Date.now(),
      title: callTitle.trim(),
      date: callDate,
      time: callTime,
      audioUrl: audioUrl.trim(),
      duration: duration,
      durationFormatted: formatDuration(duration),
      createdAt: new Date().toISOString()
    };

    const existingCalls = localStorage.getItem('admin_calls');
    let calls = existingCalls ? JSON.parse(existingCalls) : [];
    calls.push(newCall);
    localStorage.setItem('admin_calls', JSON.stringify(calls));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'admin_calls',
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
            <label className="block text-rose-400 text-sm mb-2">Call Title</label>
            <input
              type="text"
              value={callTitle}
              onChange={(e) => setCallTitle(e.target.value)}
              placeholder="e.g., Lucy(83)"
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
            <div className="flex gap-2">
              <input
                type="url"
                value={audioUrl}
                onChange={handleUrlChange}
                placeholder="https://your-supabase-url/audio.mp3"
                className="flex-1 bg-black/50 border border-rose-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition"
              />
              <button
                onClick={handleGetDuration}
                className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition text-rose-400 text-sm"
              >
                Get Duration
              </button>
            </div>
            {duration > 0 && (
              <p className="text-green-400 text-xs mt-2">✓ Duration: {formatDuration(duration)}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!audioUrl.trim() || !callTitle.trim()}
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

const CallCard = ({ call, index, isPlaying, onPlay, onPause, onEdit, onDelete }) => {
  const audioRef = useRef(null);
  const [audioError, setAudioError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(call.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(call.title);
  const [editDate, setEditDate] = useState(call.date);
  const [editTime, setEditTime] = useState(call.time);
  const [customDuration, setCustomDuration] = useState(call.duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => onPause();
    const handleError = (e) => {
      console.error("Audio error:", e);
      setAudioError(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
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

  const saveEdit = () => {
    const updatedCall = {
      ...call,
      title: editTitle,
      date: editDate,
      time: editTime,
      duration: customDuration,
      durationFormatted: formatDuration(customDuration)
    };
    onEdit(call.id, updatedCall);
    setIsEditing(false);
  };

  const isValidAudioUrl = call.audioUrl && call.audioUrl !== '' && 
    (call.audioUrl.startsWith('http') || call.audioUrl.startsWith('blob:'));

  const displayDate = call.date ? new Date(call.date).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }) : 'Date not set';

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-950/20 to-black/40 backdrop-blur-md rounded-2xl p-5 border border-rose-500/20"
      >
        <div className="space-y-3">
          <div>
            <label className="text-rose-400 text-xs block mb-1">Call Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white"
              placeholder="Call title"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-rose-400 text-xs block mb-1">Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-rose-400 text-xs block mb-1">Time</label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-rose-400 text-xs block mb-1">Duration (seconds)</label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => setCustomDuration(parseInt(e.target.value) || 0)}
              placeholder="Duration in seconds"
              className="w-full bg-black/50 border border-rose-500/30 rounded-lg p-2 text-white text-sm"
            />
            <p className="text-gray-500 text-xs mt-1">Current: {formatDuration(customDuration)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex-1 bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
              <Check className="w-4 h-4 inline" /> Save
            </button>
            <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-500 text-white px-3 py-1 rounded-lg text-sm">
              <X className="w-4 h-4 inline" /> Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

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
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500/30 to-rose-600/30 flex items-center justify-center">
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
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-2xl">{call.title}</p>
              </div>
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
                  <Timer className="w-3 h-3" />
                  <span>{call.durationFormatted || formatDuration(call.duration)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(true)} 
              className="text-blue-400 hover:text-blue-300 transition p-2 rounded-lg hover:bg-white/10"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(call.id)} 
              className="text-red-400 hover:text-red-300 transition p-2 rounded-lg hover:bg-white/10"
              title="Delete"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {call.audioUrl && call.audioUrl.includes('supabase.co') && (
          <div className="mb-3 flex items-center gap-1 text-xs text-rose-400/60">
            <Cloud className="w-3 h-3" />
            <span>Cloud Audio</span>
          </div>
        )}
        
        {audioError && (
          <div className="mb-3 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg">
            ⚠️ Unable to play audio. Check your internet connection.
          </div>
        )}
        
        {duration > 0 && (
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
            <AudioWaveform isPlaying={isPlaying && isValidAudioUrl && !audioError} />
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Complete data from 1 to 82 with CLEAR TITLES
  const generateAudioCalls = () => {
    const baseUrl = "https://lghzrewutybboombrafj.supabase.co/storage/v1/object/public/audio";
    
    // All 82 calls ordered from 1 to 82 with clear titles
    const callsData = [
      { number: 1, title: "Lucy(1)", date: "2026-01-05", time: "4:10 pm", durationStr: "00:15" },
      { number: 2, title: "Lucy(2)", date: "2026-01-10", time: "4:13 pm", durationStr: "16:47" },
      { number: 3, title: "Lucy(3)", date: "2026-02-20", time: "7:20 am", durationStr: "11:41" },
      { number: 4, title: "Lucy(4)", date: "2026-02-24", time: "7:21 am", durationStr: "12:23" },
      { number: 5, title: "Lucy(5)", date: "2026-03-02", time: "7:21 am", durationStr: "04:32" },
      { number: 6, title: "Lucy(6)", date: "2026-03-02", time: "7:27 am", durationStr: "07:04" },
      { number: 7, title: "Lucy(7)", date: "2026-03-03", time: "5:09 pm", durationStr: "20:05" },
      { number: 8, title: "Lucy(8)", date: "2026-03-04", time: "7:04 am", durationStr: "19:59" },
      { number: 9, title: "Lucy(9)", date: "2026-03-04", time: "3:16 pm", durationStr: "09:17" },
      { number: 10, title: "Lucy(10)", date: "2026-03-05", time: "7:03 am", durationStr: "35:08" },
      { number: 11, title: "Lucy(11)", date: "2026-03-05", time: "4:40 pm", durationStr: "55:21" },
      { number: 12, title: "Lucy(12)", date: "2026-03-06", time: "7:15 am", durationStr: "12:15" },
      { number: 13, title: "Lucy(13)", date: "2026-03-06", time: "7:29 am", durationStr: "11:24" },
      { number: 14, title: "Lucy(14)", date: "2026-03-06", time: "3:15 pm", durationStr: "14:33" },
      { number: 15, title: "Lucy(15)", date: "2026-03-07", time: "3:54 pm", durationStr: "17:20" },
      { number: 16, title: "Lucy(16)", date: "2026-03-09", time: "7:04 am", durationStr: "35:26" },
      { number: 17, title: "Lucy(17)", date: "2026-03-09", time: "3:18 pm", durationStr: "01:06" },
      { number: 18, title: "Lucy(18)", date: "2026-03-10", time: "7:35 am", durationStr: "08:57" },
      { number: 19, title: "Lucy(19)", date: "2026-03-10", time: "3:09 pm", durationStr: "14:57" },
      { number: 20, title: "Lucy(20)", date: "2026-03-10", time: "4:32 pm", durationStr: "24:32" },
      { number: 21, title: "Lucy(21)", date: "2026-03-11", time: "3:00 pm", durationStr: "24:03" },
      { number: 22, title: "Lucy(22)", date: "2026-03-11", time: "4:41 pm", durationStr: "49:53" },
      { number: 23, title: "Lucy(23)", date: "2026-03-12", time: "7:46 am", durationStr: "16:31" },
      { number: 24, title: "Lucy(24)", date: "2026-03-12", time: "3:06 pm", durationStr: "20:51" },
      { number: 25, title: "Lucy(25)", date: "2026-03-13", time: "7:15 am", durationStr: "15:09" },
      { number: 26, title: "Lucy(26)", date: "2026-03-13", time: "4:21 pm", durationStr: "10:48" },
      { number: 27, title: "Lucy(27)", date: "2026-03-13", time: "4:21 pm", durationStr: "10:48" },
      { number: 28, title: "Lucy(28)", date: "2026-03-26", time: "8:57 am", durationStr: "10:43" },
      { number: 29, title: "Lucy(29)", date: "2026-04-01", time: "8:52 am", durationStr: "00:31" },
      { number: 30, title: "Lucy(30)", date: "2026-04-02", time: "8:39 am", durationStr: "24:33" },
      { number: 31, title: "Lucy(31)", date: "2026-04-04", time: "12:45 pm", durationStr: "03:26" },
      { number: 32, title: "Lucy(32)", date: "2026-04-04", time: "2:35 pm", durationStr: "55:10" },
      { number: 33, title: "Lucy(33)", date: "2026-04-04", time: "4:17 pm", durationStr: "25:38" },
      { number: 34, title: "Lucy(34)", date: "2026-04-05", time: "1:09 pm", durationStr: "44:00" },
      { number: 35, title: "Lucy(35)", date: "2026-04-06", time: "7:04 am", durationStr: "37:05" },
      { number: 36, title: "Lucy(36)", date: "2026-04-07", time: "7:21 am", durationStr: "16:37" },
      { number: 37, title: "Lucy(37)", date: "2026-04-08", time: "7:10 am", durationStr: "08:52" },
      { number: 38, title: "Lucy(38)", date: "2026-04-09", time: "7:11 am", durationStr: "24:53" },
      { number: 39, title: "Lucy(39)", date: "2026-04-10", time: "7:08 am", durationStr: "01:49:35" },
      { number: 40, title: "Lucy(40)", date: "2026-04-11", time: "6:57 am", durationStr: "14:49" },
      { number: 41, title: "Lucy(41)", date: "2026-04-11", time: "2:47 pm", durationStr: "06:42" },
      { number: 42, title: "Lucy(42)", date: "2026-04-11", time: "8:21 pm", durationStr: "50:33" },
      { number: 43, title: "Lucy(43)", date: "2026-04-11", time: "9:14 pm", durationStr: "01:05:53" },
      { number: 44, title: "Lucy(44)", date: "2026-04-12", time: "3:09 pm", durationStr: "33:44" },
      { number: 45, title: "Lucy(45)", date: "2026-04-13", time: "9:50 am", durationStr: "09:18" },
      { number: 46, title: "Lucy(46)", date: "2026-04-13", time: "10:01 am", durationStr: "07:18" },
      { number: 47, title: "Lucy(47)", date: "2026-04-13", time: "10:52 am", durationStr: "36:41" },
      { number: 48, title: "Lucy(48)", date: "2026-04-13", time: "11:33 am", durationStr: "13:29" },
      { number: 49, title: "Lucy(49)", date: "2026-04-13", time: "12:00 pm", durationStr: "11:59" },
      { number: 50, title: "Lucy(50)", date: "2026-04-13", time: "12:21 pm", durationStr: "18:51" },
      { number: 51, title: "Lucy(51)", date: "2026-04-14", time: "7:06 am", durationStr: "13:22" },
      { number: 52, title: "Lucy(52)", date: "2026-04-14", time: "8:32 am", durationStr: "01:02" },
      { number: 53, title: "Lucy(53)", date: "2026-04-14", time: "8:45 am", durationStr: "00:33" },
      { number: 54, title: "Lucy(54)", date: "2026-04-15", time: "6:59 am", durationStr: "01:26:17" },
      { number: 55, title: "Lucy(55)", date: "2026-04-18", time: "10:27 am", durationStr: "07:13" },
      { number: 56, title: "Lucy(56)", date: "2026-04-18", time: "3:01 pm", durationStr: "27:26" },
      { number: 57, title: "Lucy(57)", date: "2026-04-20", time: "6:59 am", durationStr: "01:24:05" },
      { number: 58, title: "Lucy(58)", date: "2026-04-22", time: "11:56 am", durationStr: "10:14" },
      { number: 59, title: "Lucy(59)", date: "2026-04-23", time: "7:17 am", durationStr: "01:37:00" },
      { number: 60, title: "Lucy(60)", date: "2026-04-23", time: "9:00 am", durationStr: "02:25" },
      { number: 61, title: "Lucy(61)", date: "2026-04-24", time: "8:03 am", durationStr: "24:29" },
      { number: 62, title: "Lucy(62)", date: "2026-04-24", time: "9:38 pm", durationStr: "39:27" },
      { number: 63, title: "Lucy(63)", date: "2026-04-25", time: "8:37 pm", durationStr: "01:10:18" },
      { number: 64, title: "Lucy(64)", date: "2026-04-26", time: "9:23 pm", durationStr: "27:21" },
      { number: 65, title: "Lucy(65)", date: "2026-04-28", time: "9:30 pm", durationStr: "18:05" },
      { number: 66, title: "Lucy(66)", date: "2026-05-01", time: "3:02 pm", durationStr: "15:59" },
      { number: 67, title: "Lucy(67)", date: "2026-05-01", time: "8:34 pm", durationStr: "25:22" },
      { number: 68, title: "Lucy(68)", date: "2026-05-01", time: "9:00 pm", durationStr: "51:25" },
      { number: 69, title: "Lucy(69)", date: "2026-05-02", time: "8:28 am", durationStr: "17:22" },
      { number: 70, title: "Lucy(70)", date: "2026-05-02", time: "8:14 pm", durationStr: "04:41" },
      { number: 71, title: "Lucy(71)", date: "2026-05-02", time: "8:20 pm", durationStr: "24:08" },
      { number: 72, title: "Lucy(72)", date: "2026-05-03", time: "8:19 am", durationStr: "01:01:50" },
      { number: 73, title: "Lucy(73)", date: "2026-05-03", time: "12:26 pm", durationStr: "28:15" },
      { number: 74, title: "Lucy(74)", date: "2026-05-04", time: "7:18 am", durationStr: "05:13" },
      { number: 75, title: "Lucy(75)", date: "2026-05-04", time: "7:43 am", durationStr: "28:19" },
      { number: 76, title: "Lucy(76)", date: "2026-05-04", time: "9:08 pm", durationStr: "01:11:31" },
      { number: 77, title: "Lucy(77)", date: "2026-05-05", time: "7:23 am", durationStr: "23:00" },
      { number: 78, title: "Lucy(78)", date: "2026-05-07", time: "7:09 am", durationStr: "32:28" },
      { number: 79, title: "Lucy(79)", date: "2026-05-07", time: "7:46 am", durationStr: "15:24" },
      { number: 80, title: "Lucy(80)", date: "2026-05-08", time: "7:11 am", durationStr: "51:05" },
      { number: 81, title: "Lucy(81)", date: "2026-05-08", time: "4:00 pm", durationStr: "20:58" },
      { number: 82, title: "Lucy(82)", date: "2026-05-09", time: "7:18 am", durationStr: "01:17:07" }
    ];
    
    return callsData.map(call => {
      const durationSeconds = parseDurationString(call.durationStr);
      return {
        id: call.number,
        title: call.title,
        date: call.date,
        time: call.time,
        audioUrl: `${baseUrl}/${call.number}.mp3`,
        duration: durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        createdAt: new Date(call.date).toISOString()
      };
    });
  };
  
  const allAudioCalls = generateAudioCalls();
  
  useEffect(() => {
    loadCalls();
    
    const handleStorageChange = (e) => {
      if (e.key === 'admin_calls') {
        loadCalls();
        setRefreshKey(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const loadCalls = () => {
    const savedCalls = localStorage.getItem('admin_calls');
    
    if (savedCalls && JSON.parse(savedCalls).length > 0) {
      try {
        let callsData = JSON.parse(savedCalls);
        callsData = callsData.filter(call => call && call.id);
        const sorted = callsData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setCalls(sorted);
      } catch (error) {
        console.error("Error parsing calls:", error);
        setCalls(allAudioCalls);
        localStorage.setItem('admin_calls', JSON.stringify(allAudioCalls));
      }
    } else {
      setCalls(allAudioCalls);
      localStorage.setItem('admin_calls', JSON.stringify(allAudioCalls));
    }
  };
  
  const handleAddCall = (newCall) => {
    loadCalls();
    setRefreshKey(prev => prev + 1);
  };
  
  const handleEditCall = (id, updatedCall) => {
    const updatedCalls = calls.map(call => call.id === id ? updatedCall : call);
    setCalls(updatedCalls);
    localStorage.setItem('admin_calls', JSON.stringify(updatedCalls));
    setRefreshKey(prev => prev + 1);
  };
  
  const handleDeleteCall = (id) => {
    if (confirm('Delete this call recording?')) {
      const updatedCalls = calls.filter(call => call.id !== id);
      setCalls(updatedCalls);
      localStorage.setItem('admin_calls', JSON.stringify(updatedCalls));
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const filteredCalls = calls.filter(call => {
    const matchesSearch = searchTerm === '' || 
      call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.date.includes(searchTerm);
    return matchesSearch;
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
  const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
  
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
                  <p className="text-rose-400 text-xs">Total Duration</p>
                  <p className="text-white text-xl font-bold">{Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6">
          {/* Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title (Lucy, Lucy1, etc)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-rose-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-lg hover:shadow-rose-500/30 transition"
            >
              <Plus className="w-4 h-4" />
              Add Call
            </button>
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
                  <Phone className="w-16 h-16 text-rose-400 opacity-50" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No Calls Found
              </h2>
              <p className="text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Click the + button to add a call'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredCalls.map((call, idx) => (
                  <CallCard
                    key={`${call.id}-${refreshKey}`}
                    call={call}
                    index={idx}
                    isPlaying={playingId === call.id}
                    onPlay={() => handlePlay(call.id)}
                    onPause={handlePause}
                    onEdit={handleEditCall}
                    onDelete={handleDeleteCall}
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