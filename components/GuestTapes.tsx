const guests = [
  ["Chloé", "rose"], ["Pierre", "blue"], ["Emma", "purple"],
  ["Quentin", "yellow"], ["Sara", "cyan"], ["Florent", "red"]
];

export default function GuestTapes() {
  return (
    <section className="guest-section">
      <div className="guest-title">
        <h2>Les messages des invités</h2>
        <span>Archives audio de la soirée</span>
      </div>
      <div className="tape-grid">
        {guests.map(([name, color], index) => (
          <article className={`guest-tape ${color}`} key={name}>
            <div className="tape-label">{name}</div>
            <div className="mini-window"><i /><i /></div>
            <div className="tape-footer">
              <small>Message #{String(index + 1).padStart(2, "0")}</small>
              <button aria-label={`Écouter le message de ${name}`}>▶</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

