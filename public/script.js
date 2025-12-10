const apps = [
  { id:"app1", title:"WhatsApp Hack", category:"App", version:"1.0", size:"50 MB", icon:"https://i.ibb.co/b5qjwDDD/86372.jpg", apk_link:"https://www.mediafire.com/file/8eqvtqfki06gdpo/WhatsApp_Hack.apk/file" },
  { id:"app2", title:"TikTok Hack", category:"App", version:"2.5", size:"45 MB", icon:"https://i.ibb.co/FkNpMdWd/86316.jpg", apk_link:"https://www.example.com/tiktok.apk" }
];

let selectedDownloadId = null;

function renderGrid(filter='') {
  const grid = document.getElementById('grid'); 
  grid.innerHTML='';
  apps.forEach(app => {
    if(filter && !app.title.toLowerCase().includes(filter)) return;
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <div class="card-top">
        <div class="title">${app.title}</div>
        <div class="subtitle">${app.category} • ${app.version}</div>
      </div>
      <div class="card-bottom">
        <button class="download-btn" data-id="${app.id}">Download</button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.onclick = () => {
      selectedDownloadId = btn.dataset.id;
      document.getElementById('overlay').style.display='block';
    };
  });
}

document.getElementById('verifyKey').addEventListener('click', async () => {
  const key = document.getElementById('userKey').value.trim();
  if(!key) return alert('Enter a key');

  const res = await fetch(`/verify?key=${key}`);
  const data = await res.json();

  if(data.valid){
    const app = apps.find(a=>a.id===selectedDownloadId);
    if(app) window.location.href = app.apk_link;
    document.getElementById('overlay').style.display='none';
  } else {
    alert('Invalid or already used key!');
  }
});

document.getElementById('searchInput').addEventListener('input', e=>{
  renderGrid(e.target.value.toLowerCase());
});

renderGrid();
