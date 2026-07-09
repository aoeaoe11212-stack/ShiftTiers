const tierWeights = { "HT1": 20, "LT1": 18, "HT2": 16, "LT2": 14, "HT3": 12, "LT3": 10, "HT4": 8, "LT4": 6, "HT5": 4, "LT5": 2, "-": 0 };
const gameModesList = ["nethpot", "crystal", "uhc", "smp", "sword", "dsmp", "mace"];
let playersDataset = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch('data/players.json')
        .then(response => response.json())
        .then(data => {
            playersDataset = data;
            renderLeaderboardMatrix(playersDataset);
        })
        .catch(err => console.error("Data pipeline routing acquisition interrupted:", err));

    document.getElementById('search-player').addEventListener('input', handleLiveSearchFilter);
});

function calculateGlobalScorePoints(playerObj) {
    let baseScore = 0;
    gameModesList.forEach(mode => {
        const tier = playerObj.tiers[mode] || "-";
        baseScore += (tierWeights[tier] || 0);
    });
    return baseScore;
}

function renderLeaderboardMatrix(datasetArray) {
    const tbody = document.getElementById('rankings-tbody');
    if (!tbody) return;

    // Deep sort operations vectors mapped by cumulative criteria weightings
    const processedLeaderboard = datasetArray.map(player => ({
        ...player,
        globalPoints: calculateGlobalScorePoints(player)
    })).sort((alpha, beta) => beta.globalPoints - alpha.globalPoints);

    tbody.innerHTML = '';
    processedLeaderboard.forEach((player, loopIdx) => {
        const numericRankValue = loopIdx + 1;
        let rankStylingRowIndicator = "";
        
        // Dynamic styling layout hooks for podium entries
        if (numericRankValue === 1) rankStylingRowIndicator = "top-1";
        else if (numericRankValue === 2) rankStylingRowIndicator = "top-2";
        else if (numericRankValue === 3) rankStylingRowIndicator = "top-3";

        let columnsHTMLDataString = "";
        gameModesList.forEach(mode => {
            const tierValue = player.tiers[mode] || "-";
            if (tierValue === "-") {
                columnsHTMLDataString += `<td class="py-4 px-2 text-center text-xs tier-empty">-</td>`;
            } else {
                columnsHTMLDataString += `
                    <td class="py-4 px-2 text-center">
                        <span class="tier-badge badge-${tierValue.toLowerCase()}">${tierValue}</span>
                    </td>`;
            }
        });

        const tableRowElement = document.createElement('tr');
        tableRowElement.className = `${rankStylingRowIndicator}`;
        tableRowElement.innerHTML = `
            <td class="py-4 px-5 text-center font-bold text-xs font-mono text-gray-400">#${numericRankValue}</td>
            <td class="py-4 px-5 font-semibold text-sm text-gray-100">
                <div class="flex items-center gap-3">
                    <img src="https://mc-heads.net/avatar/${player.username}/24" alt="MCHash" class="w-6 h-6 rounded border border-white/10 shrink-0 bg-gray-900">
                    <span>${player.username}</span>
                </div>
            </td>
            ${columnsHTMLDataString}
            <td class="py-4 px-6 text-right font-bold text-sm text-[#00ff66] font-mono">${player.globalPoints} XP</td>
        `;
        tbody.appendChild(tableRowElement);
    });
}

function handleLiveSearchFilter(event) {
    const activeSearchQueryString = event.target.value.toLowerCase().trim();
    const filteredProfilesOutputs = playersDataset.filter(playerProfile => 
        playerProfile.username.toLowerCase().includes(activeSearchQueryString)
    );
    renderLeaderboardMatrix(filteredProfilesOutputs);
}
