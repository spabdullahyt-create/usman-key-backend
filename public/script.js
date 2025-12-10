const apps = [
  { id: "app1", title: "WhatsApp Hack", category: "App", version: "1.0", size: "50 MB", is_new: true, is_mod: true, icon: "https://i.ibb.co/b5qjwDDD/86372.jpg", apk_link: "https://www.mediafire.com/file/8eqvtqfki06gdpo/WhatsApp_Hack.apk/file" },
  { id: "app2", title: "TikTok Hack", category: "App", version: "2.5", size: "45 MB", is_new: true, is_mod: true, icon: "https://i.ibb.co/FkNpMdWd/86316.jpg", apk_link: "https://www.example.com/tiktok.apk" }
  // Add more apps as needed
];

let selectedCheckboxes = new Set();
let selectedDownloadId = null;
const backendUrl = 'https://usman-key-backend.vercel.app'; // Your backend

function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function renderGrid(filter=''){
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const grid = document.getElementById('grid'); grid.innerHTML = '';
  const list = apps.filter(a=>{
    if(filter && a.category !== filter) return false;
    if(!q) return true;
    return (a.title + ' ' + (a.description||'')).toLowerCase().includes(q);
  });
  if(list.length === 0){ grid.innerHTML = '<div style="padding:24px;color:var(--muted)">No apps found.</div>'; return; }
  list.forEach(app=>{
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <div class="card-top">
        <input type="checkbox" class="chk" data-id="${escapeHtml(app.id)}" style="margin-right:10px">
        <div class="icon"><img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.title)}"></div>
        <div class="meta">
          <div class="badges">
            ${app.is_new ? '<span class="badge new"><i class="fa fa-star"></i> NEW</span>' : ''}
            ${app.is_mod ? '<span class="badge mod"><i class="fa fa-gem"></i> MOD</span>' : ''}
          </div>
          <div class="title">${escapeHtml(app.title)}</div>
          <div class="subtitle">${escapeHtml(app.category ||'Misc')} • ${escapeHtml(app.version || '')}</div>
        </div>
      </div>
      <div class="card-bottom">
        <div class="meta-left"><span><i class="fa fa-info-circle"></i> ${escapeHtml(app.version)}</span><span>• ${escapeHtml(app.size)}</span></div>
        <div>
          <button class="download-btn" data-id="${escapeHtml(app.id)}"><i class="fa fa-download"></i> Download</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  $all('.download-btn').forEach(btn=>{
    btn.onclick = () => openKeyModal(btn.dataset.id);
  });

  $all('.chk').forEach(chk=>{
    chk.onchange = () => {
      const id = chk.dataset.id;
      if(chk.checked) selectedCheckboxes.add(id); else selectedCheckboxes.delete(id);
    }
  });
}

// Key modal
function openKeyModal(appId){
  selectedDownloadId = appId;
  document.getElementById('userKey').value = '';
  const feedback = document.getElementById('keyFeedback');
  feedback.textContent = '';
  feedback.className = 'key-feedback';
  document.getElementById('overlay').style.display = 'flex';
}
function closeOverlay(){ document.getElementById('overlay').style.display = 'none'; }

async function verifyKeyBackend(key){
  try{
    const res = await fetch(`${backendUrl}/verify?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    return data.valid;
  }catch(e){ return false; }
}

document.getElementById('verifyKey').addEventListener('click', async ()=>{
  const key = document.getElementById('userKey').value.trim();
  const feedback = document.getElementById('keyFeedback');
  feedback.textContent = 'Verifying...';
  feedback.className = 'key-feedback';
  const valid = await verifyKeyBackend(key);
  if(valid){
    const app = apps.find(a => a.id === selectedDownloadId);
    if(app && app.apk_link){
      feedback.textContent = 'Key valid! Starting download...';
      feedback.className = 'key-feedback success';
      window.location.href = app.apk_link;
      closeOverlay();
    }
  }else{
    feedback.textContent = 'Invalid or already used key!';
    feedback.className = 'key-feedback';
  }
});

document.getElementById('downloadSelected').addEventListener('click', async ()=>{
  if(selectedCheckboxes.size===0){ alert('Select at least one app.'); return; }
  const key = prompt('Enter download key for selected apps:');
  if(!key) return;
  const valid = await verifyKeyBackend(key);
  if(!valid){ alert('Invalid or already used key!'); return; }
  selectedCheckboxes.forEach(id => {
    const app = apps.find(a => a.id === id);
    if(app && app.apk_link) window.open(app.apk_link, '_blank');
  });
});

document.getElementById('searchInput').addEventListener('input', () => renderGrid());
renderGrid();