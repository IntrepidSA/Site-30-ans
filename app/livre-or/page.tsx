import AudioRecorder from "@/components/AudioRecorder";

export default function GuestbookPage() {
  return <>
    <header className="page-hero"><p className="kicker">Archives audio</p><h1>Livre d’or</h1><p>Laisse à Simon un souvenir digne des meilleures cassettes VHS.</p></header>
    <section className="audio-section dedicated-audio">
      <div className="instructions"><p className="kicker">Mode d’emploi</p><h2>Ton message en 4 étapes</h2><ol>
        <li><b>1.</b><span>Écris ton prénom<br /><small>ou ton pseudo</small></span></li><li><b>2.</b><span>Enregistre ton message<br /><small>30 secondes maximum</small></span></li><li><b>3.</b><span>Écoute ton message<br /><small>et recommence si besoin</small></span></li><li><b>4.</b><span>Envoie-le à Simon<br /><small>pour les archives</small></span></li>
      </ol></div>
      <AudioRecorder />
      <aside className="thank-you-note"><span aria-hidden="true">☺</span><strong>Merci !</strong><p>Ton message sera ajouté aux archives de Simon.</p><small aria-hidden="true">📼</small></aside>
    </section>
  </>;
}

