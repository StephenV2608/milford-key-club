export default function SectionHeading({ eyebrow, title, description, centered = true }) {
  return (
    <div className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''} mb-10 md:mb-14`}>
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground leading-tight">
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