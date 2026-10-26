import RsvpForm from "@/components/RsvpForm";
import EventDetails from "@/components/EventDetails";

export default function InfosPage() {
  return <>
    <header className="page-hero"><p className="kicker">Prochainement dans votre salle</p><h1>Les infos de la soirée</h1><p>Les infos du scénario sont les suivantes, n’hésitez pas à nous informer de votre présence.</p></header>
    <section className="event-section section-pad">
      <EventDetails />
    </section>
    <section className="rsvp-section section-pad">
      <div className="rsvp-copy"><p className="kicker">Réponse attendue</p><h2>Seras-tu de l’aventure ?</h2><p>Donne une première indication à Simon. Tu pourras mettre ta réponse à jour lorsque la date et le lieu seront annoncés.</p></div>
      <RsvpForm />
    </section>
  </>;
}

