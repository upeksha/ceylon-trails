import { useEffect, useRef, useState } from 'react';

const StableWrapper = ({ children, show, unmountDelay = 100 }) => {
  const [shouldRender, setShouldRender] = useState(show);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Delay unmounting to prevent abrupt DOM changes
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, unmountDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [show, unmountDelay]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div style={{ 
      opacity: show ? 1 : 0, 
      transition: 'opacity 0.2s ease',
      pointerEvents: show ? 'auto' : 'none'
    }}>
      {children}
    </div>
  );
};

export default StableWrapper; 