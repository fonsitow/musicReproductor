/* ========= PLAYLIST (edita a tu gusto) ========= */
const PLAYLIST = [
  { title: "Alan Walker - Faded", id: "60ItHLz5WEA" },
  { title: "Imagine Dragons - Believer", id: "7wtfhZwyrcc" },
  { title: "The Weeknd - Blinding Lights", id: "fHI8X4OXluQ" },
  { title: "Ed Sheeran - Shape of You", id: "JGwWNGJdvx8" },
  { title: "Post Malone - Circles", id: "wXhTHyIgQ_U" },
  { title: "ROA - Reina", id: "vch3Pr4IMyo"},
  
];

/* ========= STATE ========= */
let player;                 // YT player instance
let index = parseInt(localStorage.getItem("yt_index") || "0", 10);
let isPlaying = false;
let duration = 0;
let shuffle = localStorage.getItem("yt_shuffle") === "1";
let repeatMode = parseInt(localStorage.getItem("yt_repeat") || "0", 10); // 0:off, 1:all, 2:one
let prevVolume = parseInt(localStorage.getItem("yt_volume") || "80", 10);

/* ========= SHORTCUTS ========= */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const timeFmt = (t)=>`${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,"0")}`;
const thumb = (id, size="hqdefault")=>`https://i.ytimg.com/vi/${id}/${size}.jpg`;

/* ========= BUILD UI ========= */
function buildList(){
  const list = $("#list");
  list.innerHTML = "";
  PLAYLIST.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.index = String(i);
    li.innerHTML = `
      <img class="thumb" src="${thumb(song.id)}" alt="miniatura">
      <div>
        <div class="title">${song.title}</div>
        <div class="meta">YouTube</div>
      </div>
      <div class="meta">#${i+1}</div>
    `;
    li.addEventListener("click", () => load(i, true));
    list.appendChild(li);
  });
}

function markActive(){
  $$(".item").forEach(el => el.classList.toggle("active", Number(el.dataset.index) === index));
  const active = $(`.item[data-index="${index}"]`);
  if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function applySongMeta(){
  const s = PLAYLIST[index];
  $("#title").textContent = s.title;
  $("#cover").src = thumb(s.id);
  markActive();
}

/* ========= YOUTUBE API ========= */
window.onYouTubeIframeAPIReady = function(){
  player = new YT.Player("player", {
    videoId: PLAYLIST[index].id,
    playerVars: { autoplay: 0, controls: 0, rel: 0, iv_load_policy: 3 },
    events: {
      onReady: onReady,
      onStateChange: onStateChange
    }
  });
};

function onReady(){
  // volumen inicial
  player.setVolume(prevVolume);
  $("#volume").value = prevVolume;
  updateVolumeIcon();

  // UI inicial
  applySongMeta();
  fetchDuration();

  // listeners
  $("#playPause").addEventListener("click", togglePlay);
  $("#prev").addEventListener("click", prev);
  $("#next").addEventListener("click", next);
  $("#seek").addEventListener("input", onSeek);
  $("#volume").addEventListener("input", onVolume);
  $("#mute").addEventListener("click", toggleMute);
  $("#shuffle").addEventListener("click", toggleShuffle);
  $("#repeat").addEventListener("click", toggleRepeat);
  $("#search").addEventListener("input", onSearch);

  // progreso periódico
  setInterval(updateProgress, 400);

  // atajos de teclado
  window.addEventListener("keydown", onKeys);

  // botones iniciales
  renderRepeatBtn();
  renderShuffleBtn();
}

function onStateChange(e){
  // 1: playing, 2: paused, 0: ended
  if (e.data === YT.PlayerState.PLAYING){
    isPlaying = true;
    $("#visualizer").classList.add("playing");
  } else if (e.data === YT.PlayerState.PAUSED){
    isPlaying = false;
    $("#visualizer").classList.remove("playing");
  } else if (e.data === YT.PlayerState.ENDED){
    isPlaying = false;
    $("#visualizer").classList.remove("playing");
    handleEnded();
  }
  renderPlayBtn();
}

/* ========= CONTROLES ========= */
function togglePlay(){
  if (!player) return;
  if (isPlaying) player.pauseVideo(); else player.playVideo();
}
function prev(){
  if (repeatMode === 2) return play(); // repeat-one ignora prev/next
  if (shuffle){
    index = randomIndex();
  } else {
    index = (index - 1 + PLAYLIST.length) % PLAYLIST.length;
  }
  load(index, true);
}
function next(){
  if (repeatMode === 2) return play(); // repeat-one
  if (shuffle){
    index = randomIndex();
  } else {
    index = (index + 1) % PLAYLIST.length;
    if (index === 0 && repeatMode === 0) return stop(); // lista acabó sin repeat
  }
  load(index, true);
}
function play(){ player && player.playVideo(); }
function pause(){ player && player.pauseVideo(); }
function stop(){ pause(); } // simple

function load(i, autoplay=false){
  index = i;
  localStorage.setItem("yt_index", String(index));
  applySongMeta();
  player.loadVideoById(PLAYLIST[index].id);
  if (autoplay) play();
  fetchDuration(true);
}
function onSeek(e){
  const pct = Number(e.target.value);
  if (!duration) return;
  const to = (pct/100) * duration;
  player.seekTo(to, true);
}
function onVolume(e){
  const vol = Number(e.target.value);
  player.setVolume(vol);
  localStorage.setItem("yt_volume", String(vol));
  prevVolume = vol;
  updateVolumeIcon();
}
function toggleMute(){
  if (player.isMuted()){
    player.unMute();
    $("#volume").value = prevVolume;
  } else {
    player.mute();
  }
  updateVolumeIcon();
}
function updateVolumeIcon(){
  const vol = player.isMuted() ? 0 : player.getVolume?.() ?? prevVolume;
  $("#mute").textContent = vol === 0 ? "🔇" : (vol < 50 ? "🔉" : "🔊");
}
function toggleShuffle(){
  shuffle = !shuffle;
  localStorage.setItem("yt_shuffle", shuffle ? "1" : "0");
  renderShuffleBtn();
}
function toggleRepeat(){
  repeatMode = (repeatMode + 1) % 3; // 0 off, 1 all, 2 one
  localStorage.setItem("yt_repeat", String(repeatMode));
  renderRepeatBtn();
}
function renderPlayBtn(){
  $("#playPause").textContent = isPlaying ? "⏸" : "▶";
}
function renderShuffleBtn(){
  $("#shuffle").style.opacity = shuffle ? "1" : ".6";
}
function renderRepeatBtn(){
  const btn = $("#repeat");
  btn.style.opacity = "1";
  btn.textContent = repeatMode === 2 ? "🔂" : "🔁";
  if (repeatMode === 0) btn.style.opacity = ".6";
}

/* ========= PROGRESO Y DURACIÓN ========= */
async function fetchDuration(reset=false){
  try{
    // YT puede tardar un poco en devolver duración; reintento simple
    const wait = ms => new Promise(r=>setTimeout(r,ms));
    for (let i=0;i<8;i++){
      duration = await player.getDuration();
      if (duration && !isNaN(duration)) break;
      await wait(150);
    }
  }catch{}
  if (reset){ $("#seek").value = "0"; $("#currentTime").textContent = "0:00"; }
  $("#totalTime").textContent = timeFmt(duration || 0);
}
function updateProgress(){
  if (!player || !duration) return;
  player.getCurrentTime().then(t=>{
    if (duration){
      $("#currentTime").textContent = timeFmt(t);
      $("#seek").value = String((t/duration)*100);
    }
  });
}
function handleEnded(){
  if (repeatMode === 2) return load(index, true); // repeat-one
  if (shuffle){ index = randomIndex(); return load(index, true); }
  if (index < PLAYLIST.length - 1) return load(index+1, true);
  if (repeatMode === 1) return load(0, true); // repeat-all
  // else: no repeat → se detiene
}

/* ========= BUSCADOR ========= */
function onSearch(e){
  const q = e.target.value.toLowerCase().trim();
  $$("#list .item").forEach(li=>{
    const title = li.querySelector(".title").textContent.toLowerCase();
    li.style.display = title.includes(q) ? "" : "none";
  });
}

/* ========= TECLADO ========= */
function onKeys(e){
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input") return; // no robar foco de inputs
  if (e.code === "Space"){ e.preventDefault(); togglePlay(); }
  else if (e.code === "ArrowRight"){ player.getCurrentTime().then(t=>player.seekTo(t+5,true)); }
  else if (e.code === "ArrowLeft"){ player.getCurrentTime().then(t=>player.seekTo(Math.max(0,t-5),true)); }
  else if (e.code === "ArrowUp"){ const v=Math.min(100,(player.getVolume?.() ?? prevVolume)+5); player.setVolume(v); $("#volume").value=v; localStorage.setItem("yt_volume", String(v)); updateVolumeIcon(); }
  else if (e.code === "ArrowDown"){ const v=Math.max(0,(player.getVolume?.() ?? prevVolume)-5); player.setVolume(v); $("#volume").value=v; localStorage.setItem("yt_volume", String(v)); updateVolumeIcon(); }
  else if (e.key.toLowerCase() === "n"){ next(); }
  else if (e.key.toLowerCase() === "p"){ prev(); }
  else if (e.key.toLowerCase() === "s"){ toggleShuffle(); }
  else if (e.key.toLowerCase() === "r"){ toggleRepeat(); }
}

/* ========= INIT DOM ========= */
document.addEventListener("DOMContentLoaded", ()=>{
  // construir lista
  buildList();
  // aplicar meta inicial
  applySongMeta();
});

/* ========= UTIL ========= */
function randomIndex(){
  if (PLAYLIST.length <= 1) return 0;
  let r;
  do { r = Math.floor(Math.random()*PLAYLIST.length); }
  while (r === index);
  return r;
}
