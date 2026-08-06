import { useState, useEffect, useRef } from 'react';

function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const goNext = () => setCurrent(prev => (prev + 1) % images.length);
  const goPrev = () => setCurrent(prev => (prev - 1 + images.length) % images.length);

  // Auto-slide every 1 second, unless paused (e.g. user hovering)
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    intervalRef.current = setInterval(goNext, 1000);
    return () => clearInterval(intervalRef.current);
  }, [images.length, isPaused, current]);

  if (!images || images.length === 0) return null;

  return (
    <div
      style={{ position: 'relative', width: '100%', maxHeight: '380px', borderRadius: '14px', overflow: 'hidden', marginBottom: '28px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <img
        src={images[current].image}
        alt={`Slide ${current + 1}`}
        style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block', transition: 'opacity 0.3s' }}
      />

      {images.length > 1 && (
        <>
          <button onClick={goPrev} style={arrowStyle('left')}>‹</button>
          <button onClick={goNext} style={arrowStyle('right')}>›</button>

          {/* Dots indicator */}
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
            {images.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                  background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function arrowStyle(side) {
  return {
    position: 'absolute',
    top: '50%',
    [side]: '12px',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.4)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export default ImageCarousel;