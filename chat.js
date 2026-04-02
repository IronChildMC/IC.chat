// ---------------- CONFIG ----------------
const myNum = '12345';
const PREMIUM_LIST_URL = 'premium.txt';
let premiumList = [];
let contacts = {}; 

// ---------------- PREMIUM ----------------
async function loadPremiumList() {
    try {
        const res = await fetch(PREMIUM_LIST_URL);
        const text = await res.text();
        premiumList = text.split('\n').map(x=>x.trim()).filter(x=>x);
        updatePremiumUI();
    } catch(e){ console.warn('No se pudo cargar premium.txt'); }
}
function isPremium(num){ return premiumList.includes(num); }
function activatePremiumUI(){
    const accept = confirm(`Subir a premium cuesta 3€ (y parte de los almuerzos gratis).\nVentajas:\n- GIFs de Giphy\n- Nombre animado arcoíris\n- Mensajes emergentes\n- Acceso a juego Sky Platform\n¿Deseas activar premium?`);
    if(accept){
        alert('¡Ahora eres usuario Premium!');
        if(!premiumList.includes(myNum)) premiumList.push(myNum);
        updatePremiumUI();
    }
}
function updatePremiumUI(){
    document.querySelectorAll('.contact').forEach(div=>{
        const num = div.dataset.num;
        if(isPremium(num)){
            div.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
            div.style.webkitBackgroundClip = 'text';
            div.style.color = 'transparent';
            div.style.fontWeight = 'bold';
            div.style.animation = 'rainbow 3s infinite linear';
        }
    });
}
// ---------------- ARCOIRIS ----------------
const style = document.createElement('style');
style.textContent = `
@keyframes rainbow {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.contact{background-size: 400% 400%;}
`;
document.head.appendChild(style);

// ---------------- BOTONES PREMIUM Y JUEGO ----------------
const contactsDiv = document.getElementById('contacts');

const premiumBtn = document.createElement('button');
premiumBtn.textContent = '✨ Subir a Premium ✨';
premiumBtn.onclick = activatePremiumUI;
contactsDiv.appendChild(premiumBtn);

const gameBtn = document.createElement('button');
gameBtn.textContent = '🎮 Jugar Sky Platform';
gameBtn.onclick = ()=>{
    if(!isPremium(myNum)){ alert('Solo usuarios Premium'); return; }
    window.open('sky-platform.html','SkyPlatform','width=800,height=600');
};
contactsDiv.appendChild(gameBtn);

// ---------------- CHAT ----------------
const messagesDiv = document.getElementById('messages');
document.getElementById('sendBtn').onclick = sendMessage;
function sendMessage(){
    const input = document.getElementById('message');
    if(!input.value.trim()) return;
    let msg = input.value.trim();
    if(msg.includes('mensaje_qaz') && isPremium(myNum)){
        if(Notification.permission==='granted'){ new Notification(`Mensaje de ${myNum}`, {body: msg.replace('mensaje_qaz','')}); }
        else { Notification.requestPermission(); }
    }
    messagesDiv.innerHTML += `<div class="msg"><b>Tú:</b> ${msg}</div>`;
    input.value='';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ---------------- INICIAL ----------------
loadPremiumList();
updatePremiumUI();
