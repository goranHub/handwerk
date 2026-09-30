import React, { useState } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Vorher',
  afterLabel = 'Nachher',
}) => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-xl border border-slate-200 select-none bg-slate-950">
      {/* After Image (Background) */}
      <img
        src={afterImage || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80'}
        alt={afterLabel}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute top-3 right-3 rounded bg-emerald-600/90 px-2 py-1 text-xs font-semibold text-white shadow-sm">
        {afterLabel}
      </div>

      {/* Before Image (Clipped Overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImage || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80'}
          alt={beforeLabel}
          className="absolute inset-0 h-full w-full object-cover max-w-none"
          style={{ width: '100%' }}
        />
        <div className="absolute top-3 left-3 rounded bg-slate-900/90 px-2 py-1 text-xs font-semibold text-white shadow-sm">
          {beforeLabel}
        </div>
      </div>

      {/* Divider line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-md border border-slate-200 text-xs font-bold">
          ⇄
        </div>
      </div>

      {/* Range control slider overlay */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        aria-label="Vorher Nachher Schieberegler"
      />
    </div>
  );
};
