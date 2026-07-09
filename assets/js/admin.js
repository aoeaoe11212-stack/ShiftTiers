// 1. Core Variables & Tier Configurations Array
const availableTiers = ["-", "HT1", "LT1", "HT2", "LT2", "HT3", "LT3", "HT4", "LT4", "HT5", "LT5"];
const gameModes = ["nethpot", "crystal", "uhc", "smp", "sword", "dsmp"];
let localPlayerData = [];
let databaseFileSHA = ""; // Tracked by GitHub API for editing files safely

document.addEventListener("DOMContentLoaded", () => {
    // FIX: Generate form dropdown selector choices *after* DOM content loads fully
    gameModes.forEach(mode => {
        const selectEl = document.getElementById(`tier-${mode}`);
        if (selectEl) {
            selectEl.innerHTML = ''; // Clean old placeholder elements if any
            availableTiers.forEach(tier => {
                const opt = document.createElement('option');
                opt.value = tier;
                opt.textContent = tier;
                selectEl.appendChild(opt);
            });
        }
    });

    // Populate configuration inputs if data is saved in local browser cache tables
    loadCachedConfigurations();

    // Pull current production profiles dataset records
    fetchExistingDatabase();

    // Event Listeners for form actions
    document.getElementById('player-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancel-btn').addEventListener('click', resetAdminForm);
});

/* ==========================================================================
   AUTHENTICATION ENGINE LOOPS & SECURE CONFIGURATIONS STORAGE LAYER
   ========================================================================== */
function saveConfiguration() {
    const username = document.getElementById('cfg-username').value.trim();
    const repo = document.getElementById('cfg-repo').value.trim();
    const token = document.getElementById('cfg-token').value.trim();

    if (!username || !repo || !token) {
        alert("Please fulfill all integration authorization inputs to link your workspace records.");
        return;
    }

    localStorage.setItem('shift_gh_user', username);
    localStorage.setItem('shift_gh_repo', repo);
    localStorage.setItem('shift_gh_token', token);

    alert("Local GitHub connection configuration profile successfully compiled. Fetching active file data signatures...");
    fetchExistingDatabase();
}

function loadCachedConfigurations() {
    if (localStorage.getItem('shift_gh_user')) document.getElementById('cfg-username').value = localStorage.getItem('shift_gh_user');
    if (localStorage.getItem('shift_gh_repo')) document.getElementById('cfg-repo').value = localStorage.getItem('shift_gh_repo');
    if (localStorage.getItem('shift_gh_token')) document.getElementById('cfg-token').value = localStorage.getItem('shift_gh_token');
}

/* ==========================================================================
   CORE READ/WRITE PIPELINE REST CONNECTIONS (AUTO SYNC)
   ========================================================================== */
function fetchExistingDatabase() {
    const user = localStorage.getItem('shift_gh_user');
    const repo = localStorage.getItem('shift_gh_repo');
    const token = localStorage.getItem('shift_gh_token');

    let fetchURL = 'data/players.json';

    // Upgrade target stream route parameters if valid token values match cache tables
    if (user && repo && token) {
        fetchURL = `https://api.github.com/repos/${user}/${repo}/contents/data/players.json`;
    }

    const headers = token ? { "Authorization": `token ${token}`, "Accept": "application/vnd.github.v3+json" } : {};

    fetch(fetchURL, { headers })
        .then(res => {
            if (!res.ok) throw new Error("Base file path validation mismatch state.");
            return res.json();
        })
        .then(data => {
            if (data.content && data.sha) {
                // Read and unpack Base64 encoded payload array blocks delivered by raw GitHub webhooks
                databaseFileSHA = data.sha;
                localPlayerData = JSON.parse(atob(data.content.replace(/\s/g, '')));
            } else {
                localPlayerData = data;
            }
            renderAdminTable();
        })
        .catch(err => {
            console.warn("API direct pipeline routing inactive, fallback to local root asset loading tracking configurations:", err);
            // Standby static fallback trigger execution block loops
            fetch('data/players.json')
                .then(r => r.json())
                .then(d => { localPlayerData = d; renderAdminTable(); })
                .catch(() => { localPlayerData = []; renderAdminTable(); });
        });
}

function pushUpdatesToGitHub() {
    const user = localStorage.getItem('shift_gh_user');
    const repo = localStorage.getItem('shift_gh_repo');
    const token = localStorage.getItem('shift_gh_token');

    if (!user || !repo || !token) {
        alert("Error: Authentication parameters missing. Please link your credentials configuration parameters at step 1 first.");
        return;
    }

    const syncBtn = document.getElementById('sync-btn');
    syncBtn.disabled = true;
    syncBtn.textContent = "Pushing data...";

    const putURL = `https://api.github.com/repos/${user}/${repo}/contents/data/players.json`;
    const updatedJSONContentString = JSON.stringify(localPlayerData, null, 2);
    
    // Safely encode to UTF-8 Base64 payload string configurations
    const base64Payload = btoa(unescape(encodeURIComponent(updatedJSONContentString)));

    const bodyPayload = {
        message: "Automated database sync via ShiftPvP Dashboard Panel Engine",
        content: base64Payload,
        sha: databaseFileSHA // Tells GitHub we are overwriting the correct file version string identifier
    };

    fetch(putURL, {
        method: "PUT",
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyPayload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Synchronization request denied by GitHub endpoint layers.");
        return res.json();
    })
    .then(result => {
        alert("Success! Live database has been updated completely inside your repo.");
        databaseFileSHA = result.content.sha; // Save fresh tracking validation signature
    })
    .catch(err => {
        alert("Global push pipeline synchronization trace failure error: " + err.message);
    })
    .finally(() => {
        syncBtn.disabled = false;
        syncBtn.textContent = "Update Live Site";
    });
}

/* ==========================================================================
   UI DATA FORM CRUD INTERACTION METHODS
   ========================================================================== */
function renderAdminTable() {
    const tbody = document.getElementById('admin-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    localPlayerData.forEach((player, index) => {
        let cellsHTML = '';
        gameModes.forEach(mode => {
            const val = player.tiers[mode] || "-";
            const textClass = val === "-" ? "text-gray-600 font-normal" : "text-amber-400 font-extrabold";
            cellsHTML += `<td class="py-3 px-2 text-center text-xs ${textClass}">${val}</td>`;
        });

        const row = document.createElement('tr');
        row.className = "hover:bg-[#161b26]/30 transition duration-100";
        row.innerHTML = `
            <td class="py-3 px-5 font-bold text-sm text-gray-300">
                <div class="flex items-center gap-2">
                    <img src="https://mc-heads.net/avatar/${player.username}/18" alt="Skin" class="w-4 h-4 rounded-sm bg-gray-800 shrink-0">
                    <span>${player.username}</span>
                </div>
            </td>
            ${cellsHTML}
            <td class="py-3 px-5 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="startEdit(${index})" class="text-xs bg-gray-800 text-amber-400 hover:bg-gray-700 px-2 py-1 rounded font-bold transition cursor-pointer">Edit</button>
                    <button onclick="deletePlayer(${index})" class="text-xs bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/30 px-2 py-1 rounded font-bold transition cursor-pointer">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const editIdx = parseInt(document.getElementById('edit-index').value);
    const usernameInput = document.getElementById('username').value.trim();

    if (!usernameInput) return;

    const newTiers = {};
    gameModes.forEach(mode => {
        newTiers[mode] = document.getElementById(`tier-${mode}`).value;
    });

    const targetPlayerDataObj = { username: usernameInput, tiers: newTiers };

    if (editIdx === -1) {
        const exists = localPlayerData.some(p => p.username.toLowerCase() === usernameInput.toLowerCase());
        if (exists) { alert("A player with that username already exists!"); return; }
        localPlayerData.push(targetPlayerDataObj);
    } else {
        localPlayerData[editIdx] = targetPlayerDataObj;
    }

    resetAdminForm();
    renderAdminTable();
}

function startEdit(index) {
    const player = localPlayerData[index];
    document.getElementById('form-title').textContent = `Editing: ${player.username}`;
    document.getElementById('edit-index').value = index;
    document.getElementById('username').value = player.username;

    gameModes.forEach(mode => {
        document.getElementById(`tier-${mode}`).value = player.tiers[mode] || "-";
    });

    document.getElementById('cancel-btn').classList.remove('hidden');
    document.getElementById('submit-btn').textContent = "Update Local Entry Data";
}

function deletePlayer(index) {
    if (confirm(`Remove '${localPlayerData[index].username}' from workspace configurations data tree?`)) {
        localPlayerData.splice(index, 1);
        renderAdminTable();
        resetAdminForm();
    }
}

function resetAdminForm() {
    document.getElementById('form-title').textContent = "Add New Player";
    document.getElementById('edit-index').value = "-1";
    document.getElementById('player-form').reset();
    document.getElementById('cancel-btn').classList.add('hidden');
    document.getElementById('submit-btn').textContent = "Save Local Changes";
}
