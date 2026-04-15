export default function PageHeader({ eyebrow, title, description, imageUrl }) {
  if (imageUrl) {
    return (
      <section className="relative py-20 md:py-32 overflow-hidden">
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-3">{eyebrow}</p>
          )}
          <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-white/80 text-lg max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-muted/80 via-accent/30 to-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">{eyebrow}</p>
        )}
        <h1 className="font-heading font-black text-4xl md:text-5xl text-foreground mb-4 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>
        )}
      </div>
    </section>
  );
}