'use client'

import { motion } from 'framer-motion'
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  PhoneOff, Volume2, VolumeX, Settings
} from 'lucide-react'

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
  const ControlButton = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick, 
    variant = 'default',
    showLabel = false 
  }: { 
    icon: any
    label: string
    active: boolean
    onClick: () => void
    variant?: 'default' | 'danger'
    showLabel?: boolean
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative group flex flex-col items-center justify-center gap-1
        min-w-[48px] min-h-[48px] md:min-w-[56px] md:min-h-[56px]
        rounded-2xl transition-all shadow-lg hover:shadow-xl
        touch-manipulation
        ${variant === 'danger' 
          ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
          : active
            ? 'bg-gradient-to-br from-white/90 to-white/70 text-gray-800 border-2 border-white/50'
            : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white border-2 border-gray-700'
        }
      `}
      title={label}
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
      {showLabel && (
        <span className="text-xs font-medium hidden lg:block">{label}</span>
      )}
      
      {/* Tooltip */}
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg
                     opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </span>

      {/* Active indicator */}
      {active && variant === 'default' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
        />
      )}
    </motion.button>
  )

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full glass-card p-3 md:p-4"
    >
      <div className="flex items-center justify-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 md:gap-3 px-2">
          {/* Microphone */}
          <ControlButton
            icon={isMicOn ? Mic : MicOff}
            label={isMicOn ? 'Mute' : 'Unmute'}
            active={isMicOn}
            onClick={onToggleMic}
          />

          {/* Camera */}
          <ControlButton
            icon={isCameraOn ? Video : VideoOff}
            label={isCameraOn ? 'Stop Video' : 'Start Video'}
            active={isCameraOn}
            onClick={onToggleCamera}
          />

          {/* Screen Share */}
          <ControlButton
            icon={isScreenSharing ? MonitorOff : Monitor}
            label={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            active={isScreenSharing}
            onClick={onToggleScreenShare}
          />

          {/* System Audio (when screen sharing) */}
          {isScreenSharing && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <ControlButton
                icon={shareSystemAudio ? Volume2 : VolumeX}
                label={shareSystemAudio ? 'Disable System Audio' : 'Enable System Audio'}
                active={shareSystemAudio}
                onClick={() => onToggleSystemAudio(!shareSystemAudio)}
              />
            </motion.div>
          )}

          {/* Divider */}
          <div className="w-px h-10 bg-white/30 mx-1 hidden md:block" />

          {/* End Call */}
          <ControlButton
            icon={PhoneOff}
            label="End Call"
            active={false}
            onClick={onEndCall}
            variant="danger"
          />
        </div>
      </div>

      {/* Status Bar (Mobile) */}
      <div className="flex md:hidden items-center justify-center gap-3 mt-3 pt-3 border-t border-white/20">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          {isMicOn ? (
            <Mic className="w-3 h-3 text-green-600" />
          ) : (
            <MicOff className="w-3 h-3 text-red-600" />
          )}
          <span>{isMicOn ? 'Mic On' : 'Muted'}</span>
        </div>
        
        <div className="w-px h-4 bg-gray-300" />
        
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          {isCameraOn ? (
            <Video className="w-3 h-3 text-green-600" />
          ) : (
            <VideoOff className="w-3 h-3 text-red-600" />
          )}
          <span>{isCameraOn ? 'Video On' : 'Video Off'}</span>
        </div>

        {isScreenSharing && (
          <>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <Monitor className="w-3 h-3" />
              <span>Sharing</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
