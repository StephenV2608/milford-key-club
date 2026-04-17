import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MobileBackButton({ label = 'Back' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="lg:hidden flex items-center gap-1 text-primary text-sm font-semibold px-4 py-2 select-none active:opacity-60 transition-opacity"
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  );
}