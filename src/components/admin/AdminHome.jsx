import { ChevronRight } from 'lucide-react';

export default function AdminHome({ cards, onNavigate }) {
  // Group cards by section
  const sections = cards.reduce((acc, card) => {
    const key = card.section || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(card);
    return acc;
  }, {});

  const sectionOrder = ['Everyday', 'Members', 'Content', 'Site'];
  const orderedKeys = [
    ...sectionOrder.filter(k => sections[k]),
    ...Object.keys(sections).filter(k => !sectionOrder.includes(k)),
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="font-heading font-bold text-2xl mb-1">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Quick access to what you use most.</p>
      </div>

      {orderedKeys.map(sectionName => (
        <div key={sectionName}>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">
            {sectionName}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {sections[sectionName].map(card => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => onNavigate(card.id)}
                  className="group text-left bg-card hover:bg-accent/40 border border-border hover:border-primary/30 rounded-xl p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="font-semibold text-sm leading-tight">{card.label}</p>
                  {card.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}