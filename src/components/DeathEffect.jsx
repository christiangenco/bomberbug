import React, { useEffect } from 'react';

/**
 * Overlay explosion effect when a bug dies.
 * Positioned over the grid cell, auto-removes after animation completes.
 */
function DeathEffect({ row, col, gridRows, gridCols, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Position as percentage within grid
  const leftPct = ((col + 0.5) / gridCols) * 100;
  const topPct = ((row + 0.5) / gridRows) * 100;

  return (
    <div
      className="death-effect"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
      }}
    >
      💥
    </div>
  );
}

export default React.memo(DeathEffect);
