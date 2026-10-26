import LiveLeaderboard from "@/components/LiveLeaderboard";
import MemoryMatchGame from "@/components/MemoryMatchGame";
const games = [
  { number:"01", icon:"▦", title:"Memory Match", description:"Trouve avec qui Simon a vécu chaque anecdote.", status:"Jouer maintenant", color:"pink", href:"#memory-match" },
  { number:"02", icon:"▶", title:"T’as la réf ?", description:"Associe chaque image au film ou à la série qui correspond.", status:"Contenu en préparation", color:"cyan" },
  { number:"03", icon:"?", title:"Jeu mystère", description:"Une nouvelle épreuve rejoindra bientôt la sélection.", status:"Prochainement", color:"gold" },
  { number:"04", icon:"?", title:"Jeu mystère", description:"La quatrième borne est encore classée secret défense.", status:"Prochainement", color:"purple" }
];

export default function GamesPage() {
  return <>
    <header className="page-hero"><p className="kicker">Insert coin</p><h1>Jeux</h1><p>Quatre épreuves pour tester ta mémoire, tes références et ta connaissance de Simon.</p></header>
    <section className="game-menu section-pad">
      <div className="game-menu-heading"><p className="kicker">Choisis ta partie</p><h2>La salle d’arcade</h2></div>
      <div className="game-select-grid">
        {games.map(game=><article className={`game-select-card ${game.color}`} key={game.number}>
          <div className="game-number">Player {game.number}</div><div className="game-icon" aria-hidden="true">{game.icon}</div><h3>{game.title}</h3><p>{game.description}</p>{game.href?<a className="game-launch" href={game.href}>{game.status}</a>:<span>{game.status}</span>}
        </article>)}
      </div>
      <MemoryMatchGame />
      <LiveLeaderboard />
      <p className="games-note">Le jeu « T’as la réf ? » et les deux épreuves mystères seront ajoutés prochainement.</p>
    </section>
  </>;
}

