// 1. Konfigurasi Urutan Tier (Dari Terendah LT5 ke Tertinggi HT1) beserta Poin & Warnanya
const tierConfig = [
    { id: "HT1", label: "HT1", points: 10, color: "bg-red-600 text-black font-black" },
    { id: "LT1", label: "LT1", points: 9,  color: "bg-red-400 text-black font-bold" },
    { id: "HT2", label: "HT2", points: 8,  color: "bg-orange-500 text-black font-black" },
    { id: "LT2", label: "LT2", points: 7,  color: "bg-orange-300 text-black font-bold" },
    { id: "HT3", label: "HT3", points: 6,  color: "bg-yellow-500 text-black font-black" },
    { id: "LT3", label: "LT3", points: 5,  color: "bg-yellow-200 text-black font-bold" },
    { id: "HT4", label: "HT4", points: 4,  color: "bg-green-500 text-black font-black" },
    { id: "LT4", label: "LT4", points: 3,  color: "bg-green-300 text-black font-bold" },
    { id: "HT5", label: "HT5", points: 2,  color: "bg-blue-500 text-white font-black" },
    { id: "LT5", label: "LT5", points: 1,  color: "bg-blue-300 text-black font-bold" }
];

let currentGameMode = 'nethpot'; 
let playerData = [];
let searchQuery = '';

// Ambil data JSON saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    fetch('data/players.json')
        .then(response => response.json())
        .then(data => {
            playerData = data;
            
            // Cek halaman mana yang sedang aktif
            if (document.getElementById('tier-list-container')) {
                initTierList();
            } else if (document.getElementById('leaderboard-tbody')) {
                renderLeaderboard();
            }
        })
        .catch(err => console.error("Gagal memuat database player:", err));
});

/* ==========================================================================
   LOGIKA HALAMAN TIER LIST (index.html)
   ========================================================================== */

function initTierList() {
    renderTierList();

    // Setup Event Listener untuk Search System (Pencarian Real-time)
    const searchInput = document.getElementById('search-player');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderTierList(); // Render ulang tiap kali mengetik
        });
    }
}

function renderTierList() {
    const container = document.getElementById('tier-list-container');
    if (!container) return;
    
    container.innerHTML = ''; 

    // Loop konfigurasi secara terbalik (dari indeks terakhir/LT5 naik ke indeks pertama/HT1)
    for (let i = tierConfig.length - 1; i >= 0; i--) {
        const tier = tierConfig[i];

        // Saring player berdasarkan game mode aktif, kecocokan tier, dan query pencarian
        const filteredPlayers = playerData.filter(player => {
            const playerTier = player.tiers[currentGameMode];
            
            // JIKA TIER ADALAH STRIP ("-"), MAKA ABAIKAN / JANGAN MASUKKAN
            if (playerTier === "-") return false;

            const matchTier = playerTier === tier.id;
            const matchSearch = player.username.toLowerCase().includes(searchQuery);
            return matchTier && matchSearch;
        });

        // Generate HTML untuk kartu player di dalam tier ini
        let playerCardsHTML = '';
        filteredPlayers.forEach(player => {
            playerCardsHTML += `
                <div class="player-card bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg flex items-center gap-2.5 hover:border-amber-500/50">
                    <img src="https://mc-heads.net/avatar/${player.username}/24" alt="${player.username}" class="w-5 h-5 rounded-sm bg-gray-800">
                    <span class="text-sm font-semibold text-gray-200">${player.username}</span>
                </div>
            `;
        });

        // Kerangka Baris Tier
        const tierRow = document.createElement('div');
        tierRow.className = "flex items-stretch bg-gray-900/40 rounded-xl overflow-hidden border border-gray-900 min-h-[64px]";
        tierRow.innerHTML = `
            <div class="w-20 md:w-24 ${tier.color} flex items-center justify-center text-sm shadow-md tracking-wider shrink-0 select-none">${tier.label}</div>
            <div class="flex-1 p-3 tier-row-content">
                ${playerCardsHTML || '<span class="text-xs text-gray-700 italic select-none pl-2">Tidak ada player</span>'}
            </div>
        `;
        container.appendChild(tierRow);
    }
}

// Fungsi untuk mengganti Tab Game Mode
function switchGameMode(mode) {
    currentGameMode = mode;
    
    // Atur ulang visual tombol aktif/nonaktif
    document.querySelectorAll('.gm-btn').forEach(btn => {
        btn.className = "gm-btn px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 font-bold rounded shadow transition cursor-pointer text-gray-300";
    });

    const activeBtn = document.getElementById(`btn-${mode}`);
    if (activeBtn) {
        activeBtn.className = "gm-btn px-4 py-2 bg-amber-500 text-black font-bold rounded shadow transition cursor-pointer";
    }

    renderTierList();
}

/* ==========================================================================
   LOGIKA HALAMAN LEADERBOARD (leaderboard.html)
   ========================================================================== */

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    // 1. Kalkulasi total poin setiap player berdasarkan tier di 6 game mode
    const leaderboardData = playerData.map(player => {
        let totalPoints = 0;
        
        // Loop seluruh game mode yang ada di data player tersebut
        Object.keys(player.tiers).forEach(mode => {
            const playerTierId = player.tiers[mode];
            
            // JIKA TIER ADALAH STRIP ("-"), LEWATI (0 POIN UNTUK MODE INI)
            if (playerTierId === "-") return;

            // Cari kecocokan id tier untuk mengambil poinnya
            const tierMatch = tierConfig.find(t => t.id === playerTierId);
            if (tierMatch) {
                totalPoints += tierMatch.points;
            }
        });

        return {
            username: player.username,
            totalPoints: totalPoints
        };
    });

    // 2. Urutkan player dari poin tertinggi ke terendah
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    // 3. Render ke dalam tabel HTML
    tbody.innerHTML = '';
    leaderboardData.forEach((player, index) => {
        const rank = index + 1;
        
        // Berikan style khusus (background gradasi dari CSS) untuk peringkat 1, 2, dan 3
        let rankClass = '';
        let rankDisplay = rank;
        
        if (rank === 1) { rankClass = 'rank-1'; rankDisplay = '👑 1'; }
        else if (rank === 2) { rankClass = 'rank-2'; rankDisplay = '🥈 2'; }
        else if (rank === 3) { rankClass = 'rank-3'; rankDisplay = '🥉 3'; }

        const row = document.createElement('tr');
        row.className = `${rankClass} hover:bg-gray-900/50 transition duration-150`;
        row.innerHTML = `
            <td class="py-4 px-6 text-center font-bold text-sm text-gray-400">${rankDisplay}</td>
            <td class="py-4 px-6 font-medium">
                <div class="flex items-center gap-3">
                    <img src="https://mc-heads.net/avatar/${player.username}/28" alt="${player.username}" class="w-7 h-7 rounded bg-gray-800">
                    <span class="text-gray-100 font-semibold">${player.username}</span>
                </div>
            </td>
            <td class="py-4 px-6 text-center font-black text-amber-400 text-base">${player.totalPoints} <span class="text-xs text-gray-500 font-normal">pts</span></td>
        `;
        tbody.appendChild(row);
    });
}
