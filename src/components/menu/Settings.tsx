import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, Music } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

interface SettingsProps {
  onBack: () => void;
}

function VolumeSlider({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 w-40">
        {icon}
        <span className="text-stone-200">{label}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value * 100}
        onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        className="flex-1 h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
      <span className="w-12 text-right text-stone-400">{Math.round(value * 100)}%</span>
    </div>
  );
}

export default function Settings({ onBack }: SettingsProps) {
  const { masterVolume, musicVolume, isMuted, setMasterVolume, setMusicVolume, toggleMute } = useAudio();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 font-serif">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-4xl font-bold text-amber-100">Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Audio Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-amber-200 mb-6">Audio</h2>

            <div className="space-y-6">
              {/* Mute Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-stone-200">Mute All Audio</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    isMuted
                      ? 'bg-rose-900/50 border-rose-700 text-rose-300'
                      : 'bg-stone-800 border-stone-700 text-stone-300 hover:border-amber-600'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-5 h-5" />
                      <span>Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      <span>Unmuted</span>
                    </>
                  )}
                </motion.button>
              </div>

              <div className="border-t border-stone-800 pt-6 space-y-4">
                {/* Master Volume */}
                <VolumeSlider
                  label="Master"
                  value={masterVolume}
                  onChange={setMasterVolume}
                  icon={<Volume2 className="w-5 h-5 text-amber-500" />}
                />

                {/* Music Volume */}
                <VolumeSlider
                  label="Music"
                  value={musicVolume}
                  onChange={setMusicVolume}
                  icon={<Music className="w-5 h-5 text-amber-500" />}
                />
              </div>

              {isMuted && (
                <p className="text-stone-500 text-sm italic">
                  All audio is currently muted. Click the button above to unmute.
                </p>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
