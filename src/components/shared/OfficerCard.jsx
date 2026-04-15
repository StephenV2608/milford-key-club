import { User } from 'lucide-react';

export default function OfficerCard({ name, role, funFact, photoUrl, faded }) {
  return (
    <div className={`bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${faded ? 'opacity-70' : ''}`}>
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
        {photoUrl
          ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          : <User className="w-8 h-8 text-primary" />
        }
      </div>
      <h3 className="font-heading font-semibold text-base mb-0.5">{name}</h3>
      <p className="text-sm text-primary font-medium mb-3">{role}</p>
      {funFact && (
        <p className="text-xs text-muted-foreground italic">"{funFact}"</p>
      )}
    </div>
  );
}