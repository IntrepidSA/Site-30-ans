"use client";
import { useEffect, useState } from "react";

type Details={eventDate:string|null;eventTime:string|null;eventPlace:string|null};

export default function EventDetails(){
  const [details,setDetails]=useState<Details>({eventDate:null,eventTime:null,eventPlace:null});
  useEffect(()=>{fetch("/api/event-settings",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{if(data)setDetails(data)}).catch(()=>{})},[]);
  const formattedDate=details.eventDate?new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Paris"}).format(new Date(`${details.eventDate}T12:00:00+02:00`)):null;
  return <div className="event-cards">
    <article><span>Date</span><strong>{formattedDate||"À venir"}</strong><small>{details.eventDate?"Note-la dans ton agenda":"Reste connecté"}</small></article>
    <article><span>Heure</span><strong>{details.eventTime||"À venir"}</strong><small>Ouverture des portes</small></article>
    <article><span>Lieu</span><strong>{details.eventPlace||"À venir"}</strong><small>{details.eventPlace?"Lieu de la mission":"Coordonnées secrètes"}</small></article>
  </div>;
}

