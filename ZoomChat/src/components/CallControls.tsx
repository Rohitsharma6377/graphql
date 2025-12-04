'use client'

import { motion } from 'framer-motion'

interface CallControlsProps {
  isCameraOn: boolean
  isMicOn: boolean
  isScreenSharing: boolean
  shareSystemAudio: boolean
  onToggleCamera: () => void
  onToggleMic: () => void
  onToggleScreenShare: () => void
  onToggleSystemAudio: (value: boolean) => void
  onEndCall: () => void
}

export default function CallControls({
  isCameraOn,
  isMicOn,
  isScreenSharing,
  shareSystemAudio,
  onToggleCamera,
  onToggleMic,
  onToggleScreenShare,
  onToggleSystemAudio,
  onEndCall,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 glass-card">
      {/* Microphone */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleMic}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isMicOn
            ? 'bg-white/60 hover:bg-white/80 text-gray-700'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isMicOn ? 'Mute' : 'Unmute'}
      >
        {isMicOn ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </motion.button>

      {/* Camera */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleCamera}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isCameraOn
            ? 'bg-white/60 hover:bg-white/80 text-gray-700'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCameraOn ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
              clipRule="evenodd"
            />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
        )}
      </motion.button>

      {/* Screen Share */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleScreenShare}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isScreenSharing
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-white/60 hover:bg-white/80 text-gray-700'
        }`}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm9 3a1 1 0 102 0 1 1 0 00-2 0z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>

      {/* System Audio Toggle (when screen sharing) */}
      {!isScreenSharing && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleSystemAudio(!shareSystemAudio)}
          className={`px-4 h-12 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${
            shareSystemAudio
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-white/60 hover:bg-white/80 text-gray-700'
          }`}
          title="Include system audio when screen sharing"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">
            {shareSystemAudio ? 'System Audio ON' : 'System Audio OFF'}
          </span>
        </motion.button>
      )}

      {/* End Call */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEndCall}
        className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
        title="End call"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      </motion.button>
    </div>
  )
}
