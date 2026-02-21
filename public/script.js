/**
 * Shared Diary - Email Notification Version
 * Pure Frontend - LocalStorage Based
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let state = {
    memories: [],
    filter: ''
};

function initApp() {
    loadMemories();
    setupEventListeners();
    checkReminders();
    renderMemories();
    checkOnThisDay();
}

function loadMemories() {
    const data = localStorage.getItem('diary_memories');
    state.memories = data ? JSON.parse(data) : [];
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('diary_memories', JSON.stringify(state.memories));
    } catch (e) {
        alert("LocalStorage is full! Try deleting some old memories with large pictures.");
    }
}

// --- Logic Update: Including Email ---
async function addMemory(recipient, email, title, desc, reminderDate, imageFile) {
    let imageData = null;
    
    if (imageFile) {
        imageData = await convertToBase64(imageFile);
    }

    const newMemory = {
        id: Date.now().toString(),
        recipient,
        email,
        title,
        desc,
        reminderDate,
        image: imageData,
        createdAt: new Date().toISOString().split('T')[0]
    };

    state.memories.unshift(newMemory);
    saveToLocalStorage();
    showToast(`Reminder set for ${recipient}! 🔔`);
    renderMemories();
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function deleteMemory(id) {
    if (confirm('Remove this reminder?')) {
        state.memories = state.memories.filter(m => m.id !== id);
        saveToLocalStorage();
        renderMemories();
    }
}

// --- Email Logic ---
function sendEmail(id) {
    const mem = state.memories.find(m => m.id === id);
    if (!mem) return;

    const subject = encodeURIComponent(`💌 A Memory for You: ${mem.title}`);
    const body = encodeURIComponent(
        `Hi ${mem.recipient},\n\n` +
        `Thinking of you! Here's a memory I wanted to share:\n\n` +
        `Title: ${mem.title}\n` +
        `Message: ${mem.desc}\n\n` +
        `Captured on: ${mem.createdAt}\n\n` +
        `Shared via Shared Diary 🌸`
    );

    window.location.href = `mailto:${mem.email || ''}?subject=${subject}&body=${body}`;
}

// --- UI Rendering ---
function renderMemories() {
    const listElement = document.getElementById('memoryList');
    const filteredMemories = state.memories.filter(m => 
        m.recipient.toLowerCase().includes(state.filter.toLowerCase()) ||
        m.title.toLowerCase().includes(state.filter.toLowerCase()) ||
        m.desc.toLowerCase().includes(state.filter.toLowerCase())
    );

    if (filteredMemories.length === 0) {
        listElement.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #888;">No reminders found.</div>`;
        return;
    }

    listElement.innerHTML = filteredMemories.map(mem => `
        <div class="memory-card">
            <button class="delete-btn" onclick="deleteMemory('${mem.id}')">&times;</button>
            ${mem.image ? `<img src="${mem.image}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
            <small style="color: var(--primary); font-weight: bold;">For: ${escapeHTML(mem.recipient)} ${mem.email ? `(${escapeHTML(mem.email)})` : ''}</small>
            <h4 style="margin-top: 5px;">${escapeHTML(mem.title)}</h4>
            <p>${escapeHTML(mem.desc)}</p>
            <div class="date-info" style="margin-bottom: 10px;">
                <span>📅 Created: ${mem.createdAt}</span>
                <span>🔔 Notify: ${mem.reminderDate}</span>
            </div>
            <button class="btn-primary" style="padding: 0.5rem; font-size: 0.8rem;" onclick="sendEmail('${mem.id}')">📧 Email Now</button>
        </div>
    `).join('');
}

// --- Notification Logic ---
function checkReminders() {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueMemories = state.memories.filter(m => m.reminderDate === todayStr);

    if (dueMemories.length > 0) {
        let currentIdx = 0;
        const showNext = () => {
            if (currentIdx < dueMemories.length) {
                showReminderModal(dueMemories[currentIdx]);
                currentIdx++;
            }
        };
        
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            setTimeout(showNext, 500);
        }, { once: false });

        showNext();
    }
}

function showReminderModal(memory) {
    const modal = document.getElementById('reminderModal');
    const greeting = document.getElementById('modalGreeting');
    const content = document.getElementById('reminderContent');
    const imgContainer = document.getElementById('imagePreviewContainer');
    const modalImg = document.getElementById('modalImage');
    
    greeting.textContent = `Hey ${memory.recipient}, Remember This?`;
    
    if (memory.image) {
        modalImg.src = memory.image;
        imgContainer.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
    }

    content.innerHTML = `
        <h2 style="color: var(--primary); margin-bottom: 10px;">${escapeHTML(memory.title)}</h2>
        <p style="font-size: 1.1rem; line-height: 1.5;">${escapeHTML(memory.desc)}</p>
        ${memory.email ? `<p style="margin-top: 10px; color: #555;">Email: <strong>${escapeHTML(memory.email)}</strong></p>` : ''}
        <button class="btn-primary" style="margin-top: 15px; width: auto;" onclick="sendEmail('${memory.id}')">📧 Forward this via Email</button>
        <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid #eee;">
        <small style="color: #999;">This was saved for you on ${memory.createdAt}</small>
    `;
    
    modal.style.display = 'block';
    
    if (Notification.permission === "granted") {
        new Notification(`Reminder for ${memory.recipient}!`, {
            body: memory.title,
            icon: memory.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });
    }
}

function checkOnThisDay() {
    const today = new Date();
    const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;
    const matches = state.memories.filter(m => {
        const memDate = new Date(m.createdAt);
        return `${memDate.getMonth() + 1}-${memDate.getDate()}` === todayMonthDay && 
               memDate.getFullYear() < today.getFullYear();
    });

    const section = document.getElementById('onThisDay');
    if (matches.length > 0) {
        section.style.display = 'block';
        document.getElementById('onThisDayList').innerHTML = matches.map(m => `
            <div class="on-this-day-item">
                ${m.image ? `<img src="${m.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; float: left; margin-right: 10px;">` : ''}
                <strong>For ${m.recipient}: ${m.title} (${new Date(m.createdAt).getFullYear()})</strong>
                <p>${m.desc}</p>
                <div style="clear: both;"></div>
            </div>
        `).join('');
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    document.getElementById('memoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const recipient = document.getElementById('recipient').value;
        const email = document.getElementById('email').value;
        const title = document.getElementById('title').value;
        const desc = document.getElementById('desc').value;
        const reminder = document.getElementById('reminder').value;
        const imageFile = document.getElementById('imageInput').files[0];
        
        await addMemory(recipient, email, title, desc, reminder, imageFile);
        e.target.reset();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.filter = e.target.value;
        renderMemories();
    });

    const modal = document.getElementById('reminderModal');
    const hideModal = () => modal.style.display = 'none';
    
    document.querySelector('.close-modal').onclick = hideModal;
    document.getElementById('closeModalBtn').onclick = hideModal;
    window.onclick = (e) => { if (e.target === modal) hideModal(); };
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

window.deleteMemory = deleteMemory;
window.sendEmail = sendEmail;
