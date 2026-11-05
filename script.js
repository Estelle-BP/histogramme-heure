const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const PALETTE=["#2f80ed","#27ae8f","#f2994a","#eb5757","#9b6dd6","#e0b43a","#56a3c9","#7a8b99"];
const DEFAULT=()=>seed({
  acts:[{n:"Développement",c:PALETTE[0]},{n:"Réunions",c:PALETTE[1]},{n:"Formation",c:PALETTE[2]},{n:"Support",c:PALETTE[3]}],
  v:[[60,20,10,8],[64,24,8,10],[70,22,14,6],[58,18,12,12],[66,26,6,9],[72,20,16,8],[40,12,4,6],[28,8,2,4],[68,24,12,10],[74,28,10,12],[70,22,18,8],[50,16,6,10]]
});
let S=DEFAULT();
try{const s=localStorage.getItem("heures-v1");if(s){const p=JSON.parse(s);if(p&&p.acts&&p.v&&p.v.length===12)S=p}}catch(e){}
const save=()=>{try{localStorage.setItem("heures-v1",JSON.stringify(S))}catch(e){}};
function norm(s){s.sub=s.v.map((r,i)=>s.acts.map((_,j)=>(s.sub&&s.sub[i]&&Array.isArray(s.sub[i][j]))?s.sub[i][j]:[]));return s}
function seed(s){norm(s);
  s.sub[0][0]=[{n:"Back-end",v:28},{n:"Front-end",v:20},{n:"Tests",v:12}];
  s.sub[2][0]=[{n:"Back-end",v:30},{n:"Front-end",v:22},{n:"Tests",v:12},{n:"Revue de code",v:6}];
  return s}
norm(S);
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=n=>n.toLocaleString("fr-FR");
let first=true;

function niceStep(max){
  for(const s of [1,2,5,10,20,25,50,100,200,250,500,1000,2000,5000]) if(max/s<=8) return s;
  return 10000;
}
function renderChart(){
  const tot=S.v.map(r=>r.reduce((a,b)=>a+b,0));
  const max=Math.max(1,...tot);
  const step=niceStep(max);
  const axMax=Math.max(step,Math.ceil(max*1.12/step)*step);
  $("grand").textContent=fmt(tot.reduce((a,b)=>a+b,0));
  $("legend").innerHTML=S.acts.map(a=>`<span><i style="background:${a.c}"></i>${esc(a.n||"Sans nom")}</span>`).join("");
  const AB=["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."];
  let h=`<div class="chart${first?" anim":""}"><div class="ytitle">Heures</div><div class="yaxis">`;
  for(let t=0;t<=axMax;t+=step) h+=`<span style="bottom:${t/axMax*100}%">${t}</span>`;
  h+=`</div><div class="plot"><div class="grid">`;
  for(let t=step;t<=axMax;t+=step) h+=`<i style="bottom:${t/axMax*100}%"></i>`;
  h+=`</div>`;
  MONTHS.forEach((m,i)=>{
    const p=tot[i]/axMax*100;
    h+=`<div class="col"><div class="bar" style="height:${p}%;animation-delay:${i*40}ms">`;
    S.acts.forEach((a,j)=>{
      const v=S.v[i][j]; if(!v) return;
      h+=`<div class="seg${sel&&sel.i===i&&sel.j===j?" sel":""}" style="flex:${v} 1 0;background:${a.c}" data-i="${i}" data-j="${j}" data-t="${esc(a.n||"Sans nom")} · ${m} : ${v} h · cliquer pour détailler">${v/axMax>0.05?v:""}</div>`;
    });
    h+=`</div>${tot[i]?`<span class="t" style="bottom:calc(${p}% + 5px)">${fmt(tot[i])}</span>`:""}</div>`;
  });
  h+=`</div><div class="xlab">`+MONTHS.map((m,i)=>`<span title="${m}"><b class="f" style="font-weight:400">${m}</b><b class="s" style="font-weight:400">${AB[i]}</b></span>`).join("")+`</div></div>`;
  $("chartWrap").innerHTML=h; first=false;
}
function renderTable(){
  let h=`<thead><tr><th></th>`;
  S.acts.forEach((a,j)=>{
    h+=`<th><div class="th"><div class="row"><input type="color" value="${a.c}" data-c="${j}" aria-label="Couleur"><button class="x" data-d="${j}" title="Supprimer cette activité" aria-label="Supprimer">✕</button></div><input type="text" value="${esc(a.n)}" data-n="${j}" aria-label="Nom de l’activité"></div></th>`;
  });
  h+=`</tr></thead><tbody>`;
  MONTHS.forEach((m,i)=>{
    h+=`<tr><td class="r">${m}</td>`;
    S.acts.forEach((a,j)=>h+=`<td><input type="number" min="0" step="1" inputmode="numeric" value="${S.v[i][j]}" data-i="${i}" data-j="${j}" aria-label="${m}, ${esc(a.n)}"${S.sub[i][j].length?' readonly class="ro" title="Somme des sous-activités : cliquer pour ouvrir le détail"':''}></td>`);
    h+=`</tr>`;
  });
  $("tbl").innerHTML=h+`</tbody>`;
}
$("tbl").addEventListener("input",e=>{
  const t=e.target;
  if(t.dataset.i!==undefined){
    const v=Math.max(0,Math.round(parseFloat(t.value)||0));
    S.v[+t.dataset.i][+t.dataset.j]=v;
  } else if(t.dataset.n!==undefined) S.acts[+t.dataset.n].n=t.value;
  else if(t.dataset.c!==undefined) S.acts[+t.dataset.c].c=t.value;
  else return;
  save(); renderChart(); renderPanel();
});
$("tbl").addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.i!==undefined) t.value=S.v[+t.dataset.i][+t.dataset.j];
});
$("tbl").addEventListener("click",e=>{
  const d=e.target.dataset.d; if(d===undefined) return;
  if(S.acts.length<=1) return;
  S.acts.splice(+d,1); S.v.forEach(r=>r.splice(+d,1)); S.sub.forEach(r=>r.splice(+d,1));
  if(sel){if(sel.j===+d)sel=null;else if(sel.j>+d)sel.j--}
  save(); renderTable(); renderChart(); renderPanel();
});
const openCell=e=>{const t=e.target;if(!t.classList||!t.classList.contains("ro"))return;sel={i:+t.dataset.i,j:+t.dataset.j};renderChart();renderPanel()};
$("tbl").addEventListener("click",openCell);
$("tbl").addEventListener("keydown",e=>{if(e.key==="Enter")openCell(e)});
$("addAct").onclick=()=>{
  S.acts.push({n:"Activité "+(S.acts.length+1),c:PALETTE[S.acts.length%PALETTE.length]});
  S.v.forEach(r=>r.push(0)); S.sub.forEach(r=>r.push([])); save(); renderTable(); renderChart(); renderPanel();
};
$("reset").onclick=()=>{S=DEFAULT();first=true;sel=null;save();renderTable();renderChart();renderPanel()};
const tip=$("tip");
$("chartWrap").addEventListener("mousemove",e=>{
  const s=e.target.closest(".seg");
  if(!s){tip.style.opacity=0;return}
  tip.textContent=s.dataset.t;tip.style.opacity=1;
  tip.style.left=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-8)+"px";tip.style.top=(e.clientY+16)+"px";
});
$("chartWrap").addEventListener("mouseleave",()=>tip.style.opacity=0);
let sel=null;
const mix=(hex,t)=>{const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,k=t<0?0:255,p=Math.abs(t);const f=x=>Math.round(x+(k-x)*p);return "#"+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,"0")).join("")};
const tone=(k,n)=>n<2?0:-0.2+0.75*k/(n-1);
const shades=(c,n)=>Array.from({length:n},(_,k)=>mix(c,tone(k,n)));
function pcts(vs){const T=vs.reduce((a,b)=>a+b,0);if(!T)return vs.map(()=>0);const raw=vs.map(v=>v/T*100),fl=raw.map(Math.floor);const r=100-fl.reduce((a,b)=>a+b,0);raw.map((x,i)=>[x-fl[i],i]).sort((a,b)=>b[0]-a[0]).slice(0,r).forEach(([,i])=>fl[i]++);return fl}
function renderPie(){
  if(!sel)return;
  const {i,j}=sel,L=S.sub[i][j],vs=L.map(s=>s.v),T=vs.reduce((a,b)=>a+b,0),P=pcts(vs),col=shades(S.acts[j].c,L.length);
  let h="";
  if(!T){h=`<p class="empty">${L.length?"Saisissez des heures pour voir la répartition.":"Aucune sous-activité : ajoutez-en pour détailler ce segment."}</p>`}
  else{
    const xy=(an,r)=>[100+r*Math.cos(an),100+r*Math.sin(an)];
    const pt=(an,r)=>xy(an,r).map(z=>z.toFixed(2)).join(" ");
    let ang=-Math.PI/2,s="";
    L.forEach((x,k)=>{
      if(!x.v)return;
      const da=x.v/T*2*Math.PI,a1=ang,a2=ang+da,mid=(a1+a2)/2,tt=`<title>${esc(x.n||"Sans nom")} : ${x.v} h (${P[k]} %)</title>`;
      s+=x.v===T?`<circle cx="100" cy="100" r="92" fill="${col[k]}">${tt}</circle>`
        :`<path d="M100 100 L${pt(a1,92)} A92 92 0 ${da>Math.PI?1:0} 1 ${pt(a2,92)}Z" fill="${col[k]}" stroke="var(--card)" stroke-width="2">${tt}</path>`;
      if(P[k]>=6){const [tx,ty]=xy(mid,x.v===T?0:62),fc=tone(k,L.length)>0.3?"#14212b":"#fff",mc=Math.min(14,Math.floor(P[k]*0.72)),raw=(x.n||"").trim(),nm=raw.length>mc?raw.slice(0,Math.max(1,mc-1))+"…":raw,two=mc>=4&&raw;s+=`<text x="${tx.toFixed(1)}" y="${(ty-(two?6:0)).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="600" fill="${fc}" pointer-events="none">${P[k]} %</text>`+(two?`<text x="${tx.toFixed(1)}" y="${(ty+8).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="9.5" fill="${fc}" pointer-events="none">${esc(nm)}</text>`:"")}
      ang=a2;
    });
    h=`<svg viewBox="0 0 200 200" class="pie" role="img" aria-label="Répartition des sous-activités">${s}</svg>`;
  }
  $("pie").innerHTML=h;
  L.forEach((_,k)=>{const e=document.querySelector('[data-p="'+k+'"]');if(e)e.textContent=P[k]+" %"});
  $("pTitle").textContent=`${S.acts[j].n||"Sans nom"} · ${MONTHS[i]} · ${S.v[i][j]} h`;
  $("pNote").textContent=L.length?"Le segment compte la somme des sous-activités.":"Sans sous-activité, la valeur se règle dans le tableau.";
}
function renderSubs(){
  if(!sel)return;
  const L=S.sub[sel.i][sel.j],col=shades(S.acts[sel.j].c,L.length);
  $("subs").innerHTML=L.map((s,k)=>`<div class="sr"><i style="background:${col[k]}"></i><input type="text" value="${esc(s.n)}" data-sn="${k}" aria-label="Nom"><input type="number" min="0" step="1" inputmode="numeric" value="${s.v}" data-sv="${k}" aria-label="Heures"><span class="pc" data-p="${k}"></span><button class="x" data-sd="${k}" aria-label="Supprimer">✕</button></div>`).join("");
}
function renderPanel(){
  $("split").classList.toggle("open",!!sel);$("panel").hidden=!sel;
  if(!sel)return;
  $("selM").innerHTML=MONTHS.map((m,i)=>`<option value="${i}"${i===sel.i?" selected":""}>${m}</option>`).join("");
  $("selA").innerHTML=S.acts.map((a,j)=>`<option value="${j}"${j===sel.j?" selected":""}>${esc(a.n||"Sans nom")}</option>`).join("");
  renderSubs();renderPie();
}
function sync(){
  const {i,j}=sel;S.v[i][j]=S.sub[i][j].reduce((a,s)=>a+s.v,0);
  save();renderChart();renderPie();renderTable();
}
$("chartWrap").addEventListener("click",e=>{
  const s=e.target.closest(".seg");if(!s)return;
  sel={i:+s.dataset.i,j:+s.dataset.j};renderChart();renderPanel();
});
$("selM").onchange=$("selA").onchange=()=>{sel={i:+$("selM").value,j:+$("selA").value};renderChart();renderPanel()};
$("pClose").onclick=()=>{sel=null;renderChart();renderPanel()};
$("subs").addEventListener("input",e=>{
  const t=e.target,L=S.sub[sel.i][sel.j];
  if(t.dataset.sn!==undefined)L[+t.dataset.sn].n=t.value;
  else if(t.dataset.sv!==undefined)L[+t.dataset.sv].v=Math.max(0,Math.round(parseFloat(t.value)||0));
  else return;
  sync();
});
$("subs").addEventListener("change",e=>{const t=e.target;if(t.dataset.sv!==undefined)t.value=S.sub[sel.i][sel.j][+t.dataset.sv].v});
$("subs").addEventListener("click",e=>{
  const d=e.target.dataset.sd;if(d===undefined)return;
  S.sub[sel.i][sel.j].splice(+d,1);sync();renderSubs();renderPie();
});
$("addSub").onclick=()=>{
  const L=S.sub[sel.i][sel.j];
  L.push({n:"Sous-activité "+(L.length+1),v:L.length?0:S.v[sel.i][sel.j]});
  sync();renderSubs();renderPie();
  const f=document.querySelector('[data-sn="'+(L.length-1)+'"]');if(f){f.focus();f.select()}
};
$("split").addEventListener("click",e=>{if(e.target===$("split")&&sel){sel=null;renderChart();renderPanel()}});
addEventListener("keydown",e=>{if(e.key==="Escape"&&sel){sel=null;renderChart();renderPanel()}});
const say=t=>{const m=$("msg");m.textContent=t;clearTimeout(say.t);say.t=setTimeout(()=>m.textContent="",6000)};
function clean(d){
  if(!d||!Array.isArray(d.acts)||!Array.isArray(d.v)||d.v.length!==12||!d.acts.length)throw 0;
  const hex=/^#[0-9a-f]{6}$/i,iv=x=>Math.max(0,Math.round(Number(x)||0));
  const acts=d.acts.map((a,j)=>({n:String(a&&a.n||"").slice(0,60),c:hex.test(a&&a.c)?a.c:PALETTE[j%PALETTE.length]}));
  const sub=d.v.map((r,i)=>acts.map((_,j)=>{const L=d.sub&&d.sub[i]&&d.sub[i][j];return Array.isArray(L)?L.map(s=>({n:String(s&&s.n||"").slice(0,60),v:iv(s&&s.v)})):[]}));
  const v=d.v.map((r,i)=>{if(!Array.isArray(r))throw 0;return acts.map((_,j)=>sub[i][j].length?sub[i][j].reduce((a,s)=>a+s.v,0):iv(r[j]))});
  return {acts,v,sub};
}
$("exp").onclick=async()=>{
  const json=JSON.stringify({app:"heures-par-mois",version:1,acts:S.acts,v:S.v,sub:S.sub},null,2);
  try{const dl=await claude.use("downloads");if(dl){await dl.save({filename:"heures-par-mois.json",data:json});say("Fichier exporté.");return}}catch(e){if(e&&e.code==="declined")return}
  try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([json],{type:"application/json"}));a.download="heures-par-mois.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);say("Fichier exporté.");return}catch(e){}
  try{await navigator.clipboard.writeText(json);say("Téléchargement indisponible ici : le JSON a été copié dans le presse-papiers.")}catch(e){say("Export impossible dans cet affichage.")}
};
$("imp").onclick=()=>$("file").click();
$("file").onchange=e=>{
  const f=e.target.files[0];e.target.value="";if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{S=norm(clean(JSON.parse(r.result)));sel=null;first=true;save();renderTable();renderChart();renderPanel();say("Données importées.")}catch(err){say("Import impossible : fichier JSON non reconnu.")}};
  r.readAsText(f);
};
renderTable();renderChart();renderPanel();
