import React from 'react';
import './Dice.css';

const Dice = ({ value, onRoll }) => {
  const getDotPattern = (value) => {
    const patterns = {
      1: [4], // center
      2: [0, 8], // top-left, bottom-right
      3: [0, 4, 8], // top-left, center, bottom-right
      4: [0, 2, 6, 8], // corners
      5: [0, 2, 4, 6, 8], // corners + center
      6: [0, 2, 3, 5, 6, 8] // two columns
    };
    return patterns[value] || [];
  };

  const renderDots = () => {
    const dots = getDotPattern(value);
    return Array.from({ length: 9 }, (_, index) => (
      <div
        key={index}
        className={`dice-dot ${dots.includes(index) ? 'active' : ''}`}
      />
    ));
  };

  return (
    <div className="dice-container">
      <div className="dice" onClick={onRoll}>
        <div className="dice-face">
          {renderDots()}
        </div>
      </div>
      <button className="roll-button" onClick={onRoll}>
        Roll Dice
      </button>
    </div>
  );
};

export default Dice;
