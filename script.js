const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const PALETTE=["#2f80ed","#27ae8f","#f2994a","#eb5757","#9b6dd6","#e0b43a","#56a3c9","#7a8b99"];
const DEFAULT=()=>seed({
  acts:[{n:"Culture",c:PALETTE[1]},{n:"Entretien",c:PALETTE[0]},{n:"Commercialisation",c:PALETTE[2]},{n:"Administratif",c:PALETTE[4]},{n:"Formation",c:PALETTE[5]},{n:"Imprévus",c:PALETTE[3]}],
  v:[[40,20,16,24,12,4],[50,20,16,24,10,4],[84,30,24,20,4,6],[140,50,40,16,0,8],[190,80,60,12,0,10],[220,100,80,12,0,10],[258,100,90,10,0,10],[256,90,90,10,0,10],[210,60,70,12,0,8],[134,40,50,16,4,6],[80,24,36,22,10,4],[48,16,30,26,14,4]]
});
let S=DEFAULT();
try{const s=localStorage.getItem("heures-v1");if(s){const p=JSON.parse(s);if(p&&p.acts&&p.v&&p.v.length===12)S=p}}catch(e){}
const save=()=>{try{localStorage.setItem("heures-v1",JSON.stringify(S))}catch(e){}};
function norm(s){s.nw=s.v.map((_,i)=>{const x=s.nw&&s.nw[i],n=Number(x);return x!==null&&x!==""&&x!==undefined&&isFinite(n)&&n>=0?n:4});s.tpl=s.acts.map((_,k)=>{const t=s.tpl&&s.tpl[k]||{};return {w:Math.max(0,Math.round(Number(t.w)||0)),sub:Array.isArray(t.sub)?t.sub.map(x=>({n:String(x&&x.n||"").slice(0,60),v:Math.max(0,Math.round(Number(x&&x.v)||0))})):[]}});s.sub=s.v.map((r,i)=>s.acts.map((_,j)=>(s.sub&&s.sub[i]&&Array.isArray(s.sub[i][j]))?s.sub[i][j]:[]));return s}
function seed(s){norm(s);
  const CU=[["Semis et plants",[10,20,30,30,20,10,8,10,10,4,2,4]],["Plantation",[0,6,24,50,60,40,20,16,20,10,4,0]],["Récolte",[20,16,20,40,70,110,150,150,120,80,50,30]],["Lavage et conditionnement",[10,8,10,20,40,60,80,80,60,40,24,14]]];
  const CO=[["Marchés",[10,10,14,24,36,48,54,54,42,30,22,20]],["Paniers",[6,6,10,16,24,32,36,36,28,20,14,10]]];
  s.v.forEach((_,i)=>{
    s.sub[i][0]=CU.map(([n,h])=>({n,v:h[i]}));
    s.sub[i][2]=CO.map(([n,h])=>({n,v:h[i]}));
    s.v[i][0]=s.sub[i][0].reduce((a,x)=>a+x.v,0);
    s.v[i][2]=s.sub[i][2].reduce((a,x)=>a+x.v,0);
  });
  s.tpl[0]={w:0,sub:[{n:"Semis et plants",v:2},{n:"Plantation",v:4},{n:"Récolte",v:14},{n:"Lavage et conditionnement",v:8}]};
  s.tpl[2]={w:0,sub:[{n:"Marchés",v:8},{n:"Paniers",v:4}]};
  s.tpl[1].w=12;s.tpl[3].w=2;s.tpl[4].w=0;s.tpl[5].w=1;
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
  S.acts.splice(+d,1); S.v.forEach(r=>r.splice(+d,1)); S.sub.forEach(r=>r.splice(+d,1)); S.tpl.splice(+d,1);
  if(sel){if(sel.j===+d)sel=null;else if(sel.j>+d)sel.j--}
  save(); renderTable(); renderChart(); renderPanel();
});
const openCell=e=>{const t=e.target;if(!t.classList||!t.classList.contains("ro"))return;sel={i:+t.dataset.i,j:+t.dataset.j};renderChart();renderPanel()};
$("tbl").addEventListener("click",openCell);
$("tbl").addEventListener("keydown",e=>{if(e.key==="Enter")openCell(e)});
$("addAct").onclick=()=>{
  S.acts.push({n:"Activité "+(S.acts.length+1),c:PALETTE[S.acts.length%PALETTE.length]});
  S.v.forEach(r=>r.push(0)); S.sub.forEach(r=>r.push([])); S.tpl.push({w:0,sub:[]}); save(); renderTable(); renderChart(); renderPanel();
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
  renderTpl();
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
  return {acts,v,sub,tpl:d.tpl,nw:d.nw};
}
$("exp").onclick=async()=>{
  const json=JSON.stringify({app:"heures-par-mois",version:1,acts:S.acts,v:S.v,sub:S.sub,tpl:S.tpl,nw:S.nw},null,2);
  if(typeof claude!=="undefined"&&claude&&claude.use){
    try{const dl=await claude.use("downloads");if(dl){await dl.save({filename:"heures-par-mois.json",data:json});say("Fichier exporté.");return}}
    catch(e){if(e&&e.code==="declined")return}
  }
  try{
    const url=URL.createObjectURL(new Blob([json],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="heures-par-mois.json";a.style.display="none";
    document.body.appendChild(a);a.click();
    setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},1500);
    say("Fichier exporté.");return;
  }catch(e){}
  try{await navigator.clipboard.writeText(json);say("Téléchargement impossible : le JSON a été copié dans le presse-papiers.")}catch(e){say("Export impossible.")}
};
$("imp").onclick=()=>$("file").click();
$("file").onchange=e=>{
  const f=e.target.files[0];e.target.value="";if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{S=norm(clean(JSON.parse(r.result)));sel=null;first=true;save();renderTable();renderChart();renderPanel();say("Données importées.")}catch(err){say("Import impossible : fichier JSON non reconnu.")}};
  r.readAsText(f);
};
let tplMonth=new Date().getMonth();
const ival=v=>Math.max(0,Math.round(parseFloat(v)||0));
const tplTotal=k=>{const t=S.tpl[k];return t.sub.length?t.sub.reduce((a,s)=>a+s.v,0):t.w};
const tplSum=()=>{$("tplTot").textContent=S.acts.reduce((a,_,k)=>a+tplTotal(k),0)};
function renderTpl(){
  $("tpl").innerHTML=S.acts.map((a,k)=>{
    const t=S.tpl[k],n=t.sub.length,col=shades(a.c,n);
    return `<div class="ta"><div class="sr"><i style="background:${a.c}"></i><span class="wl">${esc(a.n||"Sans nom")}</span><input type="number" min="0" step="1" inputmode="numeric" value="${tplTotal(k)}" data-tw="${k}" aria-label="${esc(a.n)}, heures par semaine"${n?' readonly title="Somme des sous-activités"':""}><span class="pc">h</span><button class="addsub" data-tadd="${k}">+ Sous-activité</button></div>`
    +t.sub.map((s,m)=>`<div class="sr ts"><i style="background:${col[m]}"></i><input type="text" value="${esc(s.n)}" data-tj="${k}" data-tk="${m}" data-f="n" aria-label="Nom"><input type="number" min="0" step="1" inputmode="numeric" value="${s.v}" data-tj="${k}" data-tk="${m}" data-f="v" aria-label="Heures par semaine"><span class="pc">h</span><button class="x" data-tdj="${k}" data-tdk="${m}" aria-label="Supprimer">✕</button></div>`).join("")+`</div>`;
  }).join("");
  tplSum();
  if(document.activeElement!==$("tplN"))$("tplN").value=S.nw[tplMonth];
}
$("tpl").addEventListener("input",e=>{
  const t=e.target,d=t.dataset;
  if(d.tw!==undefined)S.tpl[+d.tw].w=ival(t.value);
  else if(d.tj!==undefined){
    const s=S.tpl[+d.tj].sub[+d.tk];
    if(d.f==="n")s.n=t.value;
    else{s.v=ival(t.value);const q=document.querySelector('[data-tw="'+d.tj+'"]');if(q)q.value=tplTotal(+d.tj)}
  }else return;
  save();tplSum();
});
$("tpl").addEventListener("change",e=>{
  const t=e.target,d=t.dataset;
  if(d.tw!==undefined)t.value=tplTotal(+d.tw);
  else if(d.tj!==undefined&&d.f==="v")t.value=S.tpl[+d.tj].sub[+d.tk].v;
});
$("tpl").addEventListener("click",e=>{
  const d=e.target.dataset;
  if(d.tadd!==undefined){
    const t=S.tpl[+d.tadd];
    t.sub.push({n:"Sous-activité "+(t.sub.length+1),v:t.sub.length?0:t.w});
    save();renderTpl();
    const f=document.querySelector('[data-tj="'+d.tadd+'"][data-tk="'+(t.sub.length-1)+'"][data-f="n"]');
    if(f){f.focus();f.select()}
  }else if(d.tdj!==undefined){
    const t=S.tpl[+d.tdj],[x]=t.sub.splice(+d.tdk,1);
    if(!t.sub.length)t.w=x.v;
    save();renderTpl();
  }
});
function split(subs,month,tot){
  if(!tot)return subs.map(s=>({n:s.n,v:0}));
  const raw=subs.map(s=>s.v*month/tot),fl=raw.map(Math.floor);
  const r=month-fl.reduce((a,b)=>a+b,0);
  raw.map((x,k)=>[x-fl[k],k]).sort((a,b)=>b[0]-a[0]).slice(0,r).forEach(([,k])=>fl[k]++);
  return subs.map((s,k)=>({n:s.n,v:fl[k]}));
}
function applyTpl(i){
  S.acts.forEach((_,k)=>{
    const t=S.tpl[k],tot=tplTotal(k),month=Math.round(tot*S.nw[i]);
    S.sub[i][k]=t.sub.length?split(t.sub,month,tot):[];
    S.v[i][k]=month;
  });
}
let snap=null;
function applyFrom(list,msg){
  snap=JSON.stringify({v:S.v,sub:S.sub});
  list.forEach(applyTpl);
  save();renderTable();renderChart();renderPanel();
  $("undo").hidden=false;say(msg);
  clearTimeout(applyFrom.t);applyFrom.t=setTimeout(()=>{$("undo").hidden=true;snap=null},10000);
}
$("undo").onclick=()=>{
  if(!snap)return;
  const o=JSON.parse(snap);S.v=o.v;S.sub=o.sub;snap=null;$("undo").hidden=true;
  save();renderTable();renderChart();renderPanel();say("Modification annulée.");
};
$("tplM").innerHTML=MONTHS.map((m,i)=>`<option value="${i}"${i===tplMonth?" selected":""}>${m}</option>`).join("");
$("tplM").onchange=()=>{tplMonth=+$("tplM").value;$("tplN").value=S.nw[tplMonth]};
$("tplN").addEventListener("input",e=>{const n=parseFloat(e.target.value);S.nw[tplMonth]=n>=0?n:0;save()});
$("tplApply").onclick=()=>applyFrom([tplMonth],`${MONTHS[tplMonth]} rempli avec la semaine type (${S.nw[tplMonth]} sem.).`);
renderTable();renderChart();renderPanel();
