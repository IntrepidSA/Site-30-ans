import { HomeCountdown } from "@/components/UnlockGate";

export default function Home() {
  return <div className="home-page">
    <div className="home-poster-wrap">
      <img className="home-poster" src="/affiche-simon-aventure.png" alt="Affiche Simon, 30 ans d’aventure" />
      <HomeCountdown />
    </div>
  </div>;
}

