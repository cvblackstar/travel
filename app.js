const STORAGE_KEY = 'wanderlog-memories-v1';

const seed = [
  {id:'kyoto',title:'Rainy afternoon in Kyoto',date:'2025-04-18',location:'Kyoto, Japan',lat:35.0116,lng:135.7681,story:'We spent the afternoon wandering without a plan. The rain made the old streets quieter, and somehow that became the best part of the day.',comments:[{name:'Me',text:'Remember the tiny tea shop near the alley.'}]},
  {id:'langkawi',title:'Slow morning in Langkawi',date:'2025-01-09',location:'Langkawi, Malaysia',lat:6.35,lng:99.8,story:'Coffee, sea breeze and nowhere we needed to be. A reminder that some trips are memorable precisely because nothing much happened.',comments:[]},
  {id:'seoul',title:'Late nights in Seoul',date:'2024-11-02',location:'Seoul, South Korea',lat:37.5665,lng:126.978,story:'Neon streets, late dinners and far too much walking. The city felt completely different after midnight.',comments:[]}
];

let memories = loadMemories();
let map;
let markers = {};
let pendingPhotos = [];

const $ = id => document.getElementById(id);

function loadMemories(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : seed;
  } catch { return seed; }
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(memories)); }
function formatDate(value){ return new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`)); }
function escapeHtml(value=''){ return value.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function updateStats(){
  $('memoryCount').textContent = memories.length;
  $('placeCount').textContent = new Set(memories.map(m=>m.location)).size;
  $('commentCount').textContent = memories.reduce((n,m)=>n+(m.comments?.length||0),0);
}
function renderMemories(filter=''){
  const q = filter.trim().toLowerCase();
  const list = memories.filter(m => [m.title,m.location,m.story].some(v => String(v||'').toLowerCase().includes(q)));
  $('emptyState').classList.toggle('hidden', memories.length !== 0 || q !== '');
  $('memoryGrid').classList.toggle('hidden', list.length === 0);
  $('memoryGrid').innerHTML = list.map(m => {
    const photo = m.photos?.[0] ? `<img src="${m.photos[0]}" alt="${escapeHtml(m.title)}"/>` : '<span>✦</span>';
    return `<article class="memory-card" data-id="${m.id}"><div class="memory-photo">${photo}</div><div class="memory-body"><div class="memory-date">${formatDate(m.date)}</div><h3>${escapeHtml(m.title)}</h3><div class="memory-location">⌖ ${escapeHtml(m.location)}</div><p class="memory-excerpt">${escapeHtml(m.story)}</p><div class="memory-footer"><span>Open memory →</span><span>${m.comments?.length||0} comment${(m.comments?.length||0)===1?'':'s'}</span></div></div></article>`;
  }).join('');
  document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click',()=>openDetail(card.dataset.id)));
}
function initMap(){
  map = L.map('map').setView([15,108],3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  renderMarkers();
}
function renderMarkers(){
  Object.values(markers).forEach(m=>m.remove()); markers={};
  memories.filter(m=>Number.isFinite(m.lat)&&Number.isFinite(m.lng)).forEach(m=>{
    const marker=L.marker([m.lat,m.lng]).addTo(map).bindPopup(`<div class="popup-title">${escapeHtml(m.title)}</div><div>${escapeHtml(m.location)}</div><br><a href="#" data-memory="${m.id}">Read memory →</a>`);
    marker.on('popupopen',e=>e.popup.getElement().querySelector('[data-memory]')?.addEventListener('click',ev=>{ev.preventDefault();openDetail(m.id)}));
    markers[m.id]=marker;
  });
}
function openDetail(id){
  const m=memories.find(x=>x.id===id); if(!m)return;
  const photos=(m.photos||[]).map(p=>`<img class="detail-photo" src="${p}" alt="${escapeHtml(m.title)}">`).join('');
  $('detailContent').innerHTML=`<p class="eyebrow">TRAVEL MEMORY</p><h2>${escapeHtml(m.title)}</h2><div class="detail-meta">${formatDate(m.date)} · ⌖ ${escapeHtml(m.location)}</div>${photos}<div class="detail-story">${escapeHtml(m.story)}</div><section class="comments"><h3>Comments <small>(${m.comments?.length||0})</small></h3><div>${(m.comments||[]).map(c=>`<div class="comment"><strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.text)}</p></div>`).join('') || '<p class="detail-meta">No comments yet.</p>'}</div><form class="comment-form" id="commentForm"><input name="name" required maxlength="50" placeholder="Your name"><textarea name="text" required maxlength="500" rows="3" placeholder="Leave a note about this memory..."></textarea><button class="primary" type="submit">Add comment</button></form></section>`;
  $('detailDialog').showModal();
  $('commentForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);m.comments=m.comments||[];m.comments.push({name:fd.get('name'),text:fd.get('text')});persist();updateStats();openDetail(id);renderMemories($('searchInput').value)});
}
function openEditor(){
  $('memoryForm').reset(); pendingPhotos=[]; $('photoPreview').innerHTML=''; $('latInput').value=''; $('lngInput').value=''; $('editorDialog').showModal();
  $('memoryForm').querySelector('[name=date]').value=new Date().toISOString().slice(0,10);
}
$('openEditor').addEventListener('click',openEditor); $('heroNew').addEventListener('click',openEditor); $('emptyNew').addEventListener('click',openEditor);
$('closeEditor').addEventListener('click',()=> $('editorDialog').close()); $('cancelEditor').addEventListener('click',()=> $('editorDialog').close());
$('closeDetail').addEventListener('click',()=> $('detailDialog').close());
$('searchInput').addEventListener('input',e=>renderMemories(e.target.value));
$('photoInput').addEventListener('change',e=>{
  pendingPhotos=[]; $('photoPreview').innerHTML='';
  [...e.target.files].slice(0,8).forEach(file=>{const reader=new FileReader();reader.onload=()=>{pendingPhotos.push(reader.result);const img=document.createElement('img');img.src=reader.result;img.alt=file.name;$('photoPreview').appendChild(img)};reader.readAsDataURL(file)});
});
$('memoryForm').addEventListener('submit',e=>{
  e.preventDefault();
  const fd=new FormData(e.currentTarget);
  const m={id:crypto.randomUUID(),title:fd.get('title'),date:fd.get('date'),location:fd.get('location'),story:fd.get('story'),lat:parseFloat(fd.get('lat')),lng:parseFloat(fd.get('lng')),photos:pendingPhotos,comments:[]};
  // If no coordinates were chosen, use a gentle default around the centre of Malaysia until geocoding is added.
  if(!Number.isFinite(m.lat)||!Number.isFinite(m.lng)){m.lat=3.139;m.lng=101.6869;}
  memories.unshift(m); persist(); updateStats(); renderMemories(); renderMarkers(); $('editorDialog').close(); openDetail(m.id);
});

// Clicking the map while the editor is open lets the user place/refine a memory pin.
function mapClick(e){ if(!$('editorDialog').open)return; $('latInput').value=e.latlng.lat.toFixed(6); $('lngInput').value=e.latlng.lng.toFixed(6); }

updateStats(); renderMemories(); initMap(); map.on('click',mapClick);
