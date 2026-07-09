const availableTiers = ["-", "HT1", "LT1", "HT2", "LT2", "HT3", "LT3", "HT4", "LT4", "HT5", "LT5"];
const gameModes = ["nethpot", "crystal", "uhc", "smp", "sword", "dsmp", "mace"]; // Included Mace gamemode parameter references
let localPlayerData = [];
let databaseFileSHA = "";

document.addEventListener("DOMContentLoaded", () => {
    // Dropdowns generate *after* DOM loads completely, fixing the selection breaking bug
    gameModes.forEach(mode => {
        const selectEl = document.getElementById(`tier-${mode}`);
        if (selectEl) {
            selectEl.innerHTML = ''; 
            availableTiers.forEach(tier => {
                const opt = document.createElement('option');
                opt.value = tier;
                opt.textContent = tier;
                selectEl.appendChild(opt);
            });
        }
    });

    loadCachedConfigurations();
    fetchExistingDatabase();

    document.getElementById('player-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancel-btn').addEventListener('click', resetAdminForm);
});

function saveConfiguration() {
    const username = document.getElementById('cfg-username').value.trim();
    const repo = document.getElementById('cfg-repo').value.trim();
    const token = document.getElementById('cfg-token').value.trim();

    if (!username || !repo || !token) {
        alert("Please complete all integration fields to authenticate connection routes.");
        return;
    }

    localStorage.setItem('shift_gh_user', username);
    localStorage.setItem('shift_gh_repo', repo);
    localStorage.setItem('shift_gh_token', token);

    alert("Connection criteria configuration saved. Restructuring live tree data indices...");
    fetchExistingDatabase();
}

function loadCachedConfigurations() {
    if (localStorage.getItem('shift_gh_user')) document.getElementById('cfg-username').value = localStorage.getItem('shift_gh_user');
    if (localStorage.getItem('shift_gh_repo')) document.getElementById('cfg-repo').value = localStorage.getItem('shift_gh_repo');
    if (localStorage.getItem('shift_gh_token')) document.getElementById('cfg-token').value = localStorage.getItem('shift_gh_token');
}

function fetchExistingDatabase() {
    const user = localStorage.getItem('shift_gh_user');
    const repo = localStorage.getItem('shift_gh_repo');
    const token = localStorage.getItem('shift_gh_token');

    let fetchURL = 'data/players.json';
    if (user && repo && token) {
        fetchURL = `https://api.github.com/repos/${user}/${repo}/contents/data/players.json`;
    }

    const headers = token ? { "Authorization": `token ${token}`, "Accept": "application/vnd.github.v3+json" } : {};

    fetch(fetchURL, { headers })
        .then(res => { if (!res.ok) throw new Error("Database validation mapping fault."); return res.json(); })
        .then(data => {
            if (data.content && data.sha) {
                databaseFileSHA = data.sha;
                localPlayerData = JSON.parse(atob(data.content.replace(/\s/g, '')));
            } else {
                localPlayerData = data;
            }
            renderAdminTable();
        })
        .catch(() => {
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
        alert("Authentication context not set. Complete step 1 fields prior to deploying parameters data.");
        return;
    }

    const syncBtn = document.getElementById('sync-btn');
    syncBtn.disabled = true;
    syncBtn.textContent = "SYNCING INTERFACES...";

    const putURL = `https://api.github.com/repos/${user}/${repo}/contents/data/players.json`;
    const updatedJSON = JSON.stringify(localPlayerData, null, 2);
    const base64Payload = btoa(unescape(encodeURIComponent(updatedJSON)));

    const bodyPayload = {
        message: "Automated database update via ShiftPvP Matrix Terminal Engine Control Panel",
        content: base64Payload,
        sha: databaseFileSHA
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
    .then(res => { if (!res.ok) throw new Error("Transmission error targeting GitHub nodes endpoint."); return res.json(); })
    .then(result => {
        alert("Sync Complete! Data securely integrated into repo storage layers.");
        databaseFileSHA = result.content.sha;
        renderAdminTable(); // Fix: Retain local storage variables profiles loop display lists
    })
    .catch(err => { alert("Synchronization trace fault interruption sequence error: " + err.message); renderAdminTable(); })
    .finally(() => { syncBtn.disabled = false; syncBtn.textContent = "Update Live Site"; });
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    localPlayerData.forEach((player, index) => {
        let cellsHTML = '';
        gameModes.forEach(mode => {
            const val = player.tiers[mode] || "-";
            if (val === "-") {
                cellsHTML += `<td class="py-3 px-1 text-center text-xs tier-empty">-</td>`;
            } else {
                cellsHTML += `<td class="py-3 px-1 text-center"><span class="tier-badge badge-${val.toLowerCase()}">${val}</span></td>`;
            }
        });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-3 px-5 font-semibold text-sm text-gray-200">
                <div class="flex items-center gap-2.5">
                    <img src="https://mc-heads.net/avatar/${player.username}/22" alt="Skin" class="w-5.5 h-5.5 rounded border border-white/10 shrink-0 bg-gray-900">
                    <span>${player.username}</span>
                </div>
            </td>
            ${cellsHTML}
            <td class="py-3 px-5 text-right">
                <div class="flex justify-end gap-1.5">
                    <button onclick="startEdit(${index})" class="text-xs bg-white/5 text-gray-300 border border-white/10 hover:border-[#00ff66] hover:text-[#00ff66] px-2.5 py-1 rounded-md font-medium transition cursor-pointer">Edit</button>
                    <button onclick="deletePlayer(${index})" class="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1 rounded-md font-medium transition cursor-pointer">Delete</button>
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
    gameModes.forEach(mode => { newTiers[mode] = document.getElementById(`tier-${mode}`).value; });
    const targetPlayerDataObj = { username: usernameInput, tiers: newTiers };

    if (editIdx === -1) {
        const exists = localPlayerData.some(p => p.username.toLowerCase() === usernameInput.toLowerCase());
        if (exists) { alert("A player profile mapping matching that target identifier already exists!"); return; }
        localPlayerData.push(targetPlayerDataObj);
    } else {
        localPlayerData[editIdx] = targetPlayerDataObj;
    }

    resetAdminForm();
    renderAdminTable();
}

function startEdit(index) {
    const player = localPlayerData[index];
    document.getElementById('form-title').textContent = `// Altering: ${player.username}`;
    document.getElementById('edit-index').value = index;
    document.getElementById('username').value = player.username;
    gameModes.forEach(mode => { document.getElementById(`tier-${mode}`).value = player.tiers[mode] || "-"; });
    document.getElementById('cancel-btn').classList.remove('hidden');
    document.getElementById('submit-btn').textContent = "Apply Staged Matrix Overrides";
}

function deletePlayer(index) {
    if (confirm(`Purge profile entity records targeting identifier details for '${localPlayerData[index].username}'?`)) {
        localPlayerData.splice(index, 1);
        renderAdminTable();
        resetAdminForm();
    }
}

function resetAdminForm() {
    document.getElementById('form-title').textContent = "// Deploy New Entry";
    document.getElementById('edit-index').value = "-1";
    document.getElementById('player-form').reset();
    document.getElementById('cancel-btn').classList.add('hidden');
    document.getElementById('submit-btn').textContent = "Commit Profile Data";
}
