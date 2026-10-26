"use client";
import { FormEvent, useState } from "react";
type Attendance = "yes" | "no" | "maybe";

export default function RsvpForm() {
  const [name,setName]=useState(""); const [attendance,setAttendance]=useState<Attendance>("yes");
  const [companions,setCompanions]=useState<string[]>([]); const [confirming,setConfirming]=useState(false);
  const [status,setStatus]=useState(""); const [sending,setSending]=useState(false);
  const cleanName=name.trim(); const companionNames=companions.map(value=>value.trim()).filter(Boolean);
  const guestNames=attendance==="no"?[cleanName]:[cleanName,...companionNames]; const peopleCount=attendance==="no"?0:guestNames.length;

  function reviewRsvp(event:FormEvent<HTMLFormElement>){event.preventDefault();setStatus("");if(!cleanName){setStatus("Indique ton nom pour valider ta réponse.");return}if(companions.some(value=>!value.trim())){setStatus("Complète ou supprime les lignes de personnes restées vides.");return}const normalized=guestNames.map(value=>value.toLocaleLowerCase("fr"));if(new Set(normalized).size!==normalized.length){setStatus("Chaque personne doit avoir un nom différent.");return}setConfirming(true)}
  async function submitRsvp(){if(sending)return;setSending(true);setStatus("");try{const response=await fetch("/api/rsvp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:cleanName,attendance,guestNames})});if(!response.ok){const result=await response.json().catch(()=>({error:"unknown"}));if(result.error==="site_access_expired"){localStorage.removeItem("simon_access_granted");location.reload();return}throw new Error(result.error)}setConfirming(false);setStatus(attendance==="no"?"Ton absence a bien été enregistrée.":`${peopleCount} personne${peopleCount>1?"s":""} inscrite${peopleCount>1?"s":""} — merci !`);setName("");setAttendance("yes");setCompanions([])}catch{setConfirming(false);setStatus("Connexion interrompue. Ta réponse n’a pas été enregistrée : réessaie dans un instant.")}finally{setSending(false)}}
  return <>
    <form className="rsvp-form" onSubmit={reviewRsvp}>
      <label htmlFor="rsvp-name">Ton nom</label><input id="rsvp-name" value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder="Ex. Marty McFly" autoComplete="name" required/>
      <fieldset><legend>Ta présence</legend><div className="attendance-options"><label><input type="radio" name="attendance" checked={attendance==="yes"} onChange={()=>setAttendance("yes")}/> Présent·e</label><label><input type="radio" name="attendance" checked={attendance==="maybe"} onChange={()=>setAttendance("maybe")}/> Peut-être</label><label><input type="radio" name="attendance" checked={attendance==="no"} onChange={()=>setAttendance("no")}/> Absent·e</label></div></fieldset>
      {attendance!=="no"&&<div className="companion-area">{companions.map((value,index)=><div className="companion-row" key={index}><label htmlFor={`companion-${index}`}>Personne {index+2}</label><div><input id={`companion-${index}`} value={value} onChange={e=>setCompanions(current=>current.map((item,i)=>i===index?e.target.value:item))} maxLength={80} placeholder="Nom de la personne" autoComplete="off"/><button type="button" className="remove-person" onClick={()=>setCompanions(current=>current.filter((_,i)=>i!==index))} aria-label={`Supprimer la personne ${index+2}`}>×</button></div></div>)}{companions.length<5&&<button type="button" className="add-person" onClick={()=>setCompanions(current=>[...current,""])}>＋ Ajouter une personne</button>}<p className="rsvp-help">Chaque nom ajouté créera automatiquement un profil individuel pour les jeux et le classement.</p></div>}
      <button type="submit">Vérifier ma réponse</button>{status&&<p className="form-status" role="status">{status}</p>}
    </form>
    {confirming&&<div className="rsvp-modal" role="dialog" aria-modal="true" aria-labelledby="rsvp-summary-title"><div className="rsvp-modal-card"><p className="kicker">Dernière vérification</p><h3 id="rsvp-summary-title">Récapitulatif de ta réponse</h3>{attendance==="no"?<p><strong>{cleanName}</strong> sera enregistré·e comme absent·e.</p>:<><p><strong>{peopleCount} personne{peopleCount>1?"s":""}</strong> sera{peopleCount>1?"ont":""} inscrite{peopleCount>1?"s":""} :</p><ul>{guestNames.map(person=><li key={person}>{person}</li>)}</ul><p className="modal-note">Un profil sera créé pour chaque nom.</p></>}<div className="modal-actions"><button type="button" className="modal-back" onClick={()=>setConfirming(false)} disabled={sending}>Modifier</button><button type="button" onClick={submitRsvp} disabled={sending}>{sending?"Enregistrement…":"Confirmer"}</button></div></div></div>}
  </>;
}

