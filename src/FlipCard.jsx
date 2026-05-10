import { useRef, useState } from 'react';
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
  const [flipping, setFlipping] = useState(false);
  const flipTimer = useRef(null);

  function handleClick() {
    const next = !flipped;
    setFlipped(next);
    setFlipping(true);
    clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => setFlipping(false), 280);
    onFlip?.(next);
  }

  return (
    <div
      className={`fc-container ${className}`}
      style={{ width, height }}
    >
      {/* Hover layer — owns lift only, never touches rotation */}
      <div className={`fc-hover ${flipping ? 'fc-hover--flipping' : ''}`} onClick={handleClick}>
        {/* Flip layer — owns rotation only, never touches position */}
        <div className={`fc-inner ${flipped ? 'fc-inner--flipped' : ''}`}>
          <div className="fc-face fc-face--front">{front}</div>
          <div className="fc-face fc-face--back">{back}</div>
        </div>
      </div>
    </div>
  );
}
