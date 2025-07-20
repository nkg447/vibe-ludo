import React from 'react';
import logger from '../../logger';
import './Dice.css';

const Dice = ({ value, onRoll, disabled }) => {
  const getDotPattern = (value) => {
    // Use absolute value for dice pattern since negative values still show the dice face
    const absValue = Math.abs(value);
    const patterns = {
      1: [4], // center
      2: [0, 8], // top-left, bottom-right
      3: [0, 4, 8], // top-left, center, bottom-right
      4: [0, 2, 6, 8], // corners
      5: [0, 2, 4, 6, 8], // corners + center
      6: [0, 2, 3, 5, 6, 8] // two columns
    };
    return patterns[absValue] || [];
  };

  const handleRoll = () => {
    if (!disabled) {
      logger.log('Rolling dice');
      onRoll();
    }
  };

  const renderDots = () => {
    // Don't render dots if value is 0 (initial state)
    if (value === 0) return null;
    
    const dots = getDotPattern(value);
    return Array.from({ length: 9 }, (_, index) => (
      <div
        key={index}
        className={`dice-dot ${dots.includes(index) ? 'active' : ''}`}
      />
    ));
  };

  // Check if dice value was not used (negative value)
  const wasNotUsed = value < 0;

  return (
    <div className="dice-container">
      <div 
        className={`dice ${disabled ? 'disabled' : ''} ${wasNotUsed ? 'not-used' : ''}`} 
        onClick={handleRoll}
      >
        <div className="dice-face">
          {renderDots()}
        </div>
        {wasNotUsed && (
          <div className="not-used-indicator">
            <span>✗</span>
          </div>
        )}
      </div>
      <button 
        className={`roll-button ${disabled ? 'disabled' : ''}`} 
        onClick={handleRoll}
        disabled={disabled}
      >
        {disabled ? 'Move a piece!' : 'Roll Dice'}
      </button>
    </div>
  );
};

export default Dice;
