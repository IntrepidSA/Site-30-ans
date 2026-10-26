"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
type Player={id:number;name:string};

export default function PhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [players,setPlayers]=useState<Player[]>([]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(()=>{fetch("/api/players").then(response=>response.ok?response.json():[]).then(setPlayers).catch(()=>setPlayers([]))},[]);

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setStatus("");
    if (!selected) return;
    if (!selected.type.startsWith("image/")) { setStatus("Choisis un fichier image."); return; }
    if (selected.size > MAX_FILE_SIZE) { setStatus("La photo doit peser moins de 10 Mo."); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function clearPhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submitPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setStatus("Ajoute d’abord une photo."); return; }
    if (!signature.trim()) { setStatus("Ajoute ta signature."); return; }
    if (!accessCode.trim()) { setStatus("Ajoute le code d’accès associé à ton nom."); return; }
    setSending(true); setStatus("");
    try {
      const data=new FormData(); data.set("file",file); data.set("message",message.trim()); data.set("guestName",signature.trim()); data.set("accessCode",accessCode.trim());
      const response=await fetch("/api/media/photo",{method:"POST",body:data});
      if (!response.ok) { const result=await response.json().catch(()=>({error:"upload"})); if(result.error==="site_access_expired"){localStorage.removeItem("simon_access_granted");location.reload();return} if(result.error==="guest_not_found"){setStatus("Ce nom ne figure pas dans la liste des invités. Utilise exactement le nom enregistré.");return} if(result.error==="code_not_assigned"){setStatus("Aucun code n’a encore été attribué à ce nom. Demande-le à Simon.");return} if(result.error==="invalid_guest_code"){setStatus("Le code personnel ne correspond pas au nom sélectionné.");return} if(result.error==="file_too_large"){setStatus("Cette photo dépasse la limite de 10 Mo.");return} if(result.error==="invalid_type"){setStatus("Format non accepté. Choisis une image JPG, PNG, WebP ou HEIC.");return} setStatus("L’envoi de la photo a échoué. Réessaie dans un instant."); return; }
      clearPhoto(); setMessage(""); setSignature(""); setAccessCode(""); setStatus("Photo envoyée dans les archives privées de Simon !");
    } catch {
      setStatus("Connexion interrompue. La photo n’a pas été envoyée : tu peux réessayer.");
    } finally { setSending(false); }
  }

  return <form className="photo-upload" onSubmit={submitPhoto}>
    <input ref={inputRef} className="visually-hidden" id="guest-photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={selectPhoto} />
    {!preview ? <button className="photo-picker" type="button" onClick={() => inputRef.current?.click()}><span aria-hidden="true">＋</span>Ajouter une photo<small>Galerie ou appareil photo</small></button> :
      <div className="photo-preview"><img src={preview} alt="Aperçu de la photo sélectionnée" /><button type="button" onClick={clearPhoto}>Changer la photo</button></div>}

    <label htmlFor="photo-message">Ton petit message <small>(facultatif)</small></label>
    <textarea id="photo-message" value={message} onChange={e => setMessage(e.target.value)} maxLength={240} rows={4} placeholder="Un souvenir, une anecdote…" />
    <div className="field-counter">{message.length}/240</div>

    <label htmlFor="photo-signature">Choisis ton nom</label>
    <div className={`photo-guest-picker ${signature?"has-selection":""}`}><span className="guest-picker-badge" aria-hidden="true">P1</span><select id="photo-signature" value={signature} onChange={e => setSignature(e.target.value)} required><option value="">Sélectionne ton nom</option>{players.map(player=><option key={player.id} value={player.name}>{player.name}</option>)}</select><span className="guest-picker-arrow" aria-hidden="true">⌄</span></div>
    <label htmlFor="photo-access-code">Ton code d’accès personnel</label>
    <input id="photo-access-code" type="password" value={accessCode} onChange={e => setAccessCode(e.target.value)} maxLength={40} placeholder="Code donné par Simon" autoComplete="one-time-code" required />
    <p className="field-help">Utilise le code personnel associé au nom sélectionné.</p>
    <button className="photo-submit" type="submit" disabled={sending}>{sending ? "Envoi en cours…" : "Envoyer à l’album"}</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}

