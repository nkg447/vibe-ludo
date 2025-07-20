import React, { useState, useRef, useEffect } from 'react';
import './AudioPlayer.css';

const AudioPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState('');
  const audioRef = useRef(null);

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

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleTrackSelect = (trackFile) => {
    setSelectedTrack(trackFile);
    
    if (currentAudio === trackFile && isPlaying) {
      // If the same track is playing, pause it
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play the selected track
      setCurrentAudio(trackFile);
      if (audioRef.current) {
        audioRef.current.src = `./assets/audio/${trackFile}`;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error('Error playing audio:', err));
      }
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
          <audio
            ref={audioRef}
            onEnded={handleAudioEnd}
            preload="none"
          />
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
