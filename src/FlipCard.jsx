import { useState } from 'react';
import './FlipCard.css';

/**
 * FlipCard
 *
 * Props:
 *   front       – ReactNode  content for the front face
 *   back        – ReactNode  content for the back face
 *   width       – string     card width  (default '320px')
 *   height      – string     card height (default '180px')
 *   className   – string     extra class on the root element
 *   onFlip      – fn(isFlipped: boolean)  called after each flip
 */
export default function FlipCard({
  front,
  back,
  width = '320px',
  height = '180px',
  className = '',
  onFlip,
}) {
  const [flipped, setFlipped] = useState(false);

  function handleClick() {
    const next = !flipped;
    setFlipped(next);
    onFlip?.(next);
  }

  return (
    <div className={`fc-wrapper ${className}`} style={{ width, height }}>
      {/* Shadow sits outside the 3D perspective context so it's always flat and always visible */}
      <div className="fc-shadow" />
      <div className="fc-container">
        <div className="fc-hover" onClick={handleClick}>
          <div className={`fc-inner ${flipped ? 'fc-inner--flipped' : ''}`}>
            <div className="fc-face fc-face--front">{front}</div>
            <div className="fc-face fc-face--back">{back}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
