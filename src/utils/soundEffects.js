// Sound effects utility for playing game sound effects
import logger from '../logger';

class SoundEffects {
  constructor() {
    this.audioCache = new Map();
    this.volume = 1; // Default volume
  }

  // Load and cache audio file
  loadSound(soundName, filePath) {
    if (!this.audioCache.has(soundName)) {
      const audio = new Audio(filePath);
      audio.volume = this.volume;
      audio.preload = 'auto';
      this.audioCache.set(soundName, audio);
    }
    return this.audioCache.get(soundName);
  }

  // Play a sound effect
  playSound(soundName, filePath) {
    try {
      const audio = this.loadSound(soundName, filePath);
      
      // Reset the audio to the beginning
      audio.currentTime = 0;
      
      // Play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            logger.log(`Sound effect '${soundName}' played successfully`);
          })
          .catch(error => {
            logger.warn(`Failed to play sound effect '${soundName}':`, error);
          });
      }
    } catch (error) {
      logger.error(`Error playing sound effect '${soundName}':`, error);
    }
  }

  // Set volume for all sound effects
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    
    // Update volume for all cached audio files
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Clear all cached audio files
  clearCache() {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioCache.clear();
  }
}

// Create a singleton instance
const soundEffects = new SoundEffects();

// Specific sound effect functions
export const playSwitchPlayerSound = () => {
  soundEffects.playSound('switch_player', './assets/audio/effects/switch_player.mp3');
};

export const playMoveSound = () => {
  soundEffects.playSound('move', './assets/audio/effects/move1.mp3');
};

export const playCaptureSound = () => {
  soundEffects.playSound('capture', './assets/audio/effects/capture.mp3');
};

export const playPieceVanishSound = () => {
  soundEffects.playSound('piece_vanish', './assets/audio/effects/piece_vanish.mp3');
};

export const playNoMoveAvailableSound = () => {
  soundEffects.playSound('no_move_available', './assets/audio/effects/no_move_available.mp3');
};

// Volume control
export const setSoundEffectsVolume = (volume) => {
  soundEffects.setVolume(volume);
};

export const getSoundEffectsVolume = () => {
  return soundEffects.getVolume();
};

export default soundEffects;
