export default function MissingBucket({ title, color, children }) {
  return (
    <div className="missing-bucket" style={{ '--bucket-color': color }}>
      <div className="bucket-header">{title}</div>
      <ul className="bucket-list">{children}</ul>
    </div>
  );
}
