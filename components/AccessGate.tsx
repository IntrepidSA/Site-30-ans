"use client";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AccessGate({children}:{children:React.ReactNode}) {
  const pathname=usePathname();
  const [ready,setReady]=useState(false); const [allowed,setAllowed]=useState(false); const [code,setCode]=useState(""); const [error,setError]=useState(""); const [sending,setSending]=useState(false);
  useEffect(()=>{if(pathname.startsWith("/admin")){setReady(true);return}fetch("/api/access/status",{cache:"no-store"}).then(r=>r.ok?r.json():{allowed:false}).then(result=>{const valid=Boolean(result.allowed);setAllowed(valid);if(!valid)localStorage.removeItem("simon_access_granted")}).catch(()=>setAllowed(false)).finally(()=>setReady(true));},[pathname]);
  async function submit(event:FormEvent){event.preventDefault();setSending(true);setError("");const form=new FormData();form.set("code",code);
    try { const response=await fetch("/__access",{method:"POST",body:form,headers:{Accept:"application/json"}}); if(!response.ok){setError("Code incorrect. Vérifie-le et réessaie.");return;} localStorage.setItem("simon_access_granted","yes");setAllowed(true); }
    catch { setError("Impossible de vérifier le code. Réessaie dans un instant."); } finally { setSending(false); }
  }
  if(pathname.startsWith("/admin"))return <>{children}</>;
  if(!ready)return <div className="access-loading" />;
  if(allowed)return <>{children}</>;
  return <main className="access-screen"><form className="access-card" onSubmit={submit}><div className="access-vhs">VHS</div><p className="access-kicker">Accès réservé</p><h1>Simon — 30 ans d’aventure</h1><p>Entre le code communiqué avec ton invitation pour accéder au site.</p>{error&&<p className="access-error" role="alert">{error}</p>}<label htmlFor="access-code">Code d’accès</label><input id="access-code" type="password" value={code} onChange={e=>setCode(e.target.value)} autoComplete="current-password" required autoFocus/><button disabled={sending}>{sending?"Vérification…":"Entrer dans l’aventure"}</button></form></main>;
}

