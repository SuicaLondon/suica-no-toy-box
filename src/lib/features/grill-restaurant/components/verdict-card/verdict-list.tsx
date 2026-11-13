type VerdictListProps = {
  title: string;
  items: string[];
};

/** Go if, Skip if or Heads up: a label over short lines. Empty lists hide. */
export function VerdictList({ title, items }: VerdictListProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-label text-toy-muted m-0 font-mono uppercase">
        {title}
      </h3>
      <ul className="text-body mt-2 mb-0 grid list-none gap-1.5 p-0 leading-normal text-pretty">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
