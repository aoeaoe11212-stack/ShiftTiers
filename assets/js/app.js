// 1. Tier Weights Configuration (HT1 = Highest, LT5 = Lowest)
const tierConfig = {
    "HT1": { points: 10, class: "badge-ht1" },
    "LT1": { points: 9,  class: "badge-lt1" },
    "HT2": { points: 8,  class: "badge-ht2" },
    "LT2": { points: 7,  class: "badge-lt2" },
    "HT3": { points: 6,  class: "badge-ht3" },
    "LT3": { points: 5,  class: "badge-lt3" },
    "HT4": { points: 4,  class: "badge-ht4" },
    "LT4": { points: 3,  class: "badge-lt4" },
    "HT5": { points: 2,  class: "badge-ht5" },
    "LT5": { points: 1,  class: "badge-lt5" }
};

const gameModes = ["nethpot", "crystal", "uhc", "smp", "sword", "dsmp"];
let playerData = [];
let searchQuery = '';

// Load Database JSON file automatically
document.addEventListener("DOMContentLoaded", () => {
    fetch('data/players.json')
        .then(response => response.json())
        .then(data => {
            playerData = data;
            renderRankingsMatrix();
            
            // Setup Live Search filtering
            const searchInput = document.getElementById('search-player');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    searchQuery = e.target.value.toLowerCase().trim();
                    renderRankingsMatrix();
                });
            }
        })
        .catch(err => console.error("Could not parse JSON schema database:", err));
});

function renderRankingsMatrix() {
    const tbody = document.getElementById('rankings-tbody');
    if (!tbody) return;

    // 1. Map and compute cumulative global scores dynamically
    let calculatedPlayers = playerData.map(player => {
        let globalPoints = 0;
        
        gameModes.forEach(mode => {
            const currentTier = player.tiers[mode];
            if (currentTier && currentTier !== "-") {
                globalPoints += tierConfig[currentTier] ? tierConfig[currentTier].points : 0;
            }
        });

        return {
            ...player,
            globalPoints: globalPoints
        };
    });

    // 2. Sort players from highest Global Pts down to lowest
    calculatedPlayers.sort((a, b) => b.globalPoints - a.globalPoints);

    // 3. Apply active text search inputs filtering parameters
    if (searchQuery !== '') {
        calculatedPlayers = calculatedPlayers.filter(player => 
            player.username.toLowerCase().includes(searchQuery)
        );
    }

    // 4. Render Table DOM structure output rows
    tbody.innerHTML = '';
    calculatedPlayers.forEach((player, index) => {
        const rank = index + 1;
        
        // Podium Row Highlighting
        let rowClass = "";
        let rankBadge = `<span class="text-gray-500 font-bold text-xs">${rank}</span>`;
        if (rank === 1 && searchQuery === '') { rowClass = "top-1"; rankBadge = "👑"; }
        else if (rank === 2 && searchQuery === '') { rowClass = "top-2"; rankBadge = "🥈"; }
        else if (rank === 3 && searchQuery === '') { rowClass = "top-3"; rankBadge = "🥉"; }

        // Build HTML cell strings for each format tier value
        let modesHTML = "";
        gameModes.forEach(mode => {
            const playerTier = player.tiers[mode];
            if (playerTier && playerTier !== "-") {
                const badgeClass = tierConfig[playerTier] ? tierConfig[playerTier].class : "";
                modesHTML += `<td class="py-3 px-4 text-center"><span class="tier-badge ${badgeClass}">${playerTier}</span></td>`;
            } else {
                modesHTML += `<td class="py-3 px-4 text-center"><span class="tier-empty">-</span></td>`;
            }
        });

        const row = document.createElement('tr');
        row.className = `${rowClass} hover:bg-[#161b26]/30 transition duration-75`;
        row.innerHTML = `
            <td class="py-3.5 px-4 text-center select-none font-bold">${rankBadge}</td>
            <td class="py-3.5 px-6 font-bold">
                <div class="flex items-center gap-3">
                    <img src="https://mc-heads.net/avatar/${player.username}/24" alt="${player.username}" class="w-5 h-5 rounded-sm bg-[#161b26] shrink-0">
                    <span class="text-gray-200 text-sm tracking-wide">${player.username}</span>
                </div>
            </td>
            ${modesHTML}
            <td class="py-3.5 px-6 text-right font-black text-amber-400 text-sm select-none">${player.globalPoints}<span class="text-[10px] text-gray-600 font-normal ml-0.5">pts</span></td>
        `;
        tbody.appendChild(row);
    });
}
