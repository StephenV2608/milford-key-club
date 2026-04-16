export default function SectionHeading({ eyebrow, title, description, centered = true }) {
  return (
    <div className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''} mb-10 md:mb-14`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 border border-primary/15 px-3 py-1 rounded-full mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground leading-tight tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}