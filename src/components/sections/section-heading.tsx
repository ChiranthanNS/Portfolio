export function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="font-heading text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl text-foreground">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}
