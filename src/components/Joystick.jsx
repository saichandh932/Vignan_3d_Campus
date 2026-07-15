import { useState, useEffect, useRef } from 'react';

export function Joystick({ joystickRef }) {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const baseRef = useRef();

  const maxRadius = 50;

  const handlePointerDown = (e) => {
    setActive(true);
    updatePosition(e);
  };

  const handlePointerMove = (e) => {
    if (!active) return;
    updatePosition(e);
  };

  const handlePointerUp = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    if (joystickRef) {
      joystickRef.current = { x: 0, y: 0 };
    }
  };

  const updatePosition = (e) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setPosition({ x: dx, y: dy });

    if (joystickRef) {
      // Normalize to [-1, 1]
      joystickRef.current = {
        x: dx / maxRadius,
        y: dy / maxRadius,
      };
    }
  };

  // Prevent context menu or text selection while using joystick
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    if (active) {
      window.addEventListener('touchmove', preventDefault, { passive: false });
    }
    return () => {
      window.removeEventListener('touchmove', preventDefault);
    };
  }, [active]);

  return (
    <div className="joystick-container">
      <div 
        className="joystick-base" 
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div 
          className="joystick-knob" 
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        />
      </div>
    </div>
  );
}
