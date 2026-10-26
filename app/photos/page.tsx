import PhotoUpload from "@/components/PhotoUpload";

export default function PhotosPage() {
  return <>
    <header className="page-hero"><p className="kicker">Souvenirs en développement</p><h1>Photos</h1><p>Ajoute ton meilleur souvenir à l’album de Simon, accompagné d’un petit mot.</p></header>
    <section className="photo-page section-pad">
      <div className="album-intro">
        <div className="film-frame"><span>+</span></div>
        <div><p className="kicker">Album participatif</p><h2>À toi de jouer</h2><p>Choisis une photo depuis ta galerie ou prends-la directement avec ton téléphone. Elle sera vérifiée avant de rejoindre l’album.</p></div>
      </div>
      <PhotoUpload />
    </section>
  </>;
}

