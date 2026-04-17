import { RefreshCw } from 'lucide-react';

export default function PullToRefreshIndicator({ pullY, refreshing, ready }) {
  const visible = pullY > 0 || refreshing;
  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + ${Math.min(pullY, 70)}px - 40px)` }}
    >
      <div className={`w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <RefreshCw
          className={`w-4 h-4 text-primary transition-transform ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: refreshing ? undefined : `rotate(${(pullY / 70) * 360}deg)` }}
        />
      </div>
    </div>
  );
}