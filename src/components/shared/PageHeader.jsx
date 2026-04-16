export default function PageHeader({ eyebrow, title, description, imageUrl }) {
  if (imageUrl) {
    return (
      <section className="relative py-24 md:py-36 overflow-hidden">
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {eyebrow && (
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-4 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {eyebrow}
            </span>
          )}
          <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-[1.05] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">{description}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-accent/40 to-blue-50/60" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 border border-primary/15 px-3 py-1 rounded-full mb-4">
            {eyebrow}
          </span>
        )}
        <h1 className="font-heading font-black text-4xl md:text-5xl text-foreground mb-4 leading-[1.05] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">{description}</p>
        )}
      </div>
    </section>
  );
}