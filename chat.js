const API_KEY = 'Kp5c1A.nrnbpg:JYLdRzLwYvu4w5kXCGg3gozQTW5D0ViLa6aG0KP0nKc';
const ably = new Ably.Realtime(API_KEY);

const messagesDiv = document.getElementById('messages');
const contactsDiv = document.getElementById('contacts');
const groupsDiv = document.getElementById('groups');

// Datos locales
let contacts = JSON.parse(localStorage.getItem('icchat_contacts')||'{}');
let groups = JSON.parse(localStorage.getItem('icchat_groups')||'{}');
let groupKeys = JSON.parse(localStorage.getItem('icchat_groupKeys')||'{}');
let currentChannel = ably.channels.get('chat-publico');
let currentGroup = null;

// Presencia online
currentChannel.presence.enter({username:'Tú'});
currentChannel.presence.subscribe('enter',()=>updateContacts());
currentChannel.presence.subscribe('leave',()=>updateContacts());
updateContacts();
updateGroups();

// ------------------ Mensajes ------------------

function displayMessage(msg){
    const div = document.createElement('div');
    if(msg.includes('giphy.com')){
        div.innerHTML = `<img class="gif-message" src="${msg}">`;
    } else {
        div.textContent = msg;
    }
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage(){
    const input = document.getElementById('message');
    if(!input.value.trim()) return;
    let msg = input.value.trim();
    if(currentGroup && groupKeys[currentGroup]){
        msg = encryptAES(msg, groupKeys[currentGroup]);
    }
    currentChannel.publish('mensaje', msg);
    saveMessageToSharedStorage(msg);
    input.value = '';
}

// ------------------ Shared Storage ------------------

function saveMessageToSharedStorage(msg){
    currentChannel.storage.get('historial', (err,res)=>{
        let hist = res || '';
        hist += msg + '\n';
        currentChannel.storage.set('historial', hist);
    });
}

function loadGroupHistory(){
    currentChannel.storage.get('historial',(err,res)=>{
        if(res){
            const lines = res.split('\n');
            lines.forEach(msg=>{
                if(msg.trim()!==''){
                    let content = currentGroup && groupKeys[currentGroup]? decryptAES(msg, groupKeys[currentGroup]):msg;
                    displayMessage(content);
                }
            });
        }
    });
}

// ------------------ Contactos ------------------

function updateContacts(){
    currentChannel.presence.get((err,members)=>{
        let html='';
        for(let id in contacts){
            let online = members.some(m=>m.data.username === contacts[id].name)? 'online':'';
            html += `<div class="contact ${online}">${contacts[id].name} (${id}) ${online}</div>`;
        }
        contactsDiv.innerHTML = html;
    });
}

function addContactPrompt(){
    let num = prompt('Introduce número de 5 dígitos del contacto:');
    if(num && !contacts[num]){
        let name = prompt('Ponle un nombre (opcional):')||num;
        contacts[num] = {name};
        localStorage.setItem('icchat_contacts', JSON.stringify(contacts));
        updateContacts();
    } else alert('Número inválido o ya existe');
}

// ------------------ Grupos ------------------

function updateGroups(){
    let html='';
    for(let g in groups){
        html += `<div class="group" onclick="joinGroup('${g}')">${g}</div>`;
    }
    groupsDiv.innerHTML = html;
}

function createGroupPrompt(){
    let groupName = prompt('Nombre del grupo:');
    if(groupName){
        let code = Math.random().toString(36).substring(2,10);
        groups[groupName] = [];
        groupKeys[groupName] = code;
        localStorage.setItem('icchat_groups', JSON.stringify(groups));
        localStorage.setItem('icchat_groupKeys', JSON.stringify(groupKeys));
        updateGroups();
    }
}

function joinGroup(g){
    currentGroup = g;
    currentChannel = ably.channels.get(g);
    messagesDiv.innerHTML='';
    loadGroupHistory();

    currentChannel.subscribe(msg=>{
        let content = msg.data;
        if(currentGroup && groupKeys[currentGroup]) content = decryptAES(content, groupKeys[currentGroup]);
        displayMessage(content);
    });

    alert(`Entraste al grupo ${g}`);
}

// ------------------ AES Encrypt/Decrypt ------------------

function encryptAES(text,key){
    return CryptoJS.AES.encrypt(text,key).toString();
}

function decryptAES(ciphertext,key){
    return CryptoJS.AES.decrypt(ciphertext,key).toString(CryptoJS.enc.Utf8);
}

// ------------------ Recibir mensajes en canal principal ------------------

currentChannel.subscribe(msg=>{
    let content = msg.data;
    if(currentGroup && groupKeys[currentGroup]) content = decryptAES(content, groupKeys[currentGroup]);
    displayMessage(content);
});
