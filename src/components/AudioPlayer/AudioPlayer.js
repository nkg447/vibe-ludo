import React, { useState, useRef, useEffect } from 'react';
import './AudioPlayer.css';
import { useGame } from '../../store/GameContext';

const AudioPlayer = () => {
  const { gameState, actions } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('');
  const audioRef = useRef(null);

  // Use game state for audio status
  const isPlaying = gameState.isAudioPlaying;
  const currentAudio = gameState.currentAudioTrack;
  const audioPlayedBy = gameState.audioPlayedBy;

  // Available audio tracks
  const audioTracks = [
    {
      name: 'Chup chup chup bilkul chup',
      file: 'Chup chup chup bilkul chup.mp3'
    },
    {
      name: 'Unchi Pehchan',
      file: 'Is ka liya bari unchi pehchan chahiye unchi ponch chaiya.mp3'
    },
    {
      name: 'Khopri Tor',
      file: 'Khopri tor khopri tor salay ka.mp3'
    },
    {
      name: 'Pakad Mera Ko',
      file: 'Pakad mera ko mero ko janta ni hai ya.mp3'
    },
    {
      name: 'Baburao Style',
      file: 'ye baburao ka style hai.mp3'
    }
  ];

  // Effect to handle remote audio state changes
  useEffect(() => {
    if (currentAudio && isPlaying && audioRef.current) {
      // If audio is supposed to be playing but not locally initiated
      if (audioRef.current.src !== `./assets/audio/${currentAudio}` || audioRef.current.paused) {
        audioRef.current.src = `./assets/audio/${currentAudio}`;
        audioRef.current.load();
        audioRef.current.play()
          .catch(err => console.error('Error playing remote audio:', err));
      }
    } else if (!isPlaying && audioRef.current && !audioRef.current.paused) {
      // If audio should be paused
      audioRef.current.pause();
    }
  }, [currentAudio, isPlaying]);

  const handleAudioEnd = () => {
    actions.stopAudio();
  };

  const handleTrackSelect = (trackFile) => {
    setSelectedTrack(trackFile);
    
    if (currentAudio === trackFile && isPlaying) {
      // If the same track is playing, pause it
      actions.pauseAudio();
    } else {
      // Play the selected track
      actions.playAudio(trackFile);
    }
  };

  return (
    <div className="audio-player">
      <button 
        className="audio-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Audio Player"
      >
        🎵
      </button>

      {/* Audio element always present for remote playback */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        preload="none"
      />

      {isOpen && (
        <div className="audio-panel">
          <div className="audio-header">
            <h3>Audio Player</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="track-selection">
            <h4>Select Track:</h4>
            <div className="track-list">
              {audioTracks.map((track, index) => (
                <button
                  key={index}
                  className={`track-btn ${selectedTrack === track.file ? 'selected' : ''} ${currentAudio === track.file && isPlaying ? 'playing' : ''}`}
                  onClick={() => handleTrackSelect(track.file)}
                >
                  {currentAudio === track.file && isPlaying ? '🎵 ' : ''}
                  {track.name}
                  {currentAudio === track.file && isPlaying ? ' (Playing)' : ''}
                </button>
              ))}
            </div>
          </div>

          {currentAudio && (
            <div className="current-track">
              <p>
                🎵 {audioTracks.find(t => t.file === currentAudio)?.name}
                {audioPlayedBy !== null && gameState.networkMode !== 'LOCAL' && (
                  <span className="played-by">
                    {audioPlayedBy === gameState.playerId ? ' (You)' : ` (Player ${audioPlayedBy + 1})`}
                  </span>
                )}
              </p>
              {isPlaying && <div className="playing-indicator">🎶 Now Playing</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
