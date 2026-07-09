<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShiftPvP Admin Live Panel</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-[#0b0e14] text-gray-200 font-sans antialiased min-h-screen">

    <nav class="bg-[#111520] border-b border-gray-800/60 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="text-2xl font-black tracking-wider text-amber-400">SHIFT<span class="text-white">PVP</span></span>
                <span class="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-bold">LIVE DATABASE LINK</span>
            </div>
            <a href="index.html" class="bg-gray-800 hover:bg-gray-700 text-xs font-bold px-4 py-2 rounded transition">View Public Leaderboard</a>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 py-8 space-y-6">

        <div class="bg-[#111520] border border-gray-800 p-5 rounded-xl shadow-xl">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">1. GitHub Integration Setup (Required Once)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">GitHub Username</label>
                    <input type="text" id="cfg-username" placeholder="e.g., yourname" class="w-full bg-[#161b26] border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Repository Name</label>
                    <input type="text" id="cfg-repo" placeholder="e.g., minecraft-pvp-tiers" class="w-full bg-[#161b26] border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Personal Access Token (Classic)</label>
                    <input type="password" id="cfg-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxx" class="w-full bg-[#161b26] border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white">
                </div>
            </div>
            <div class="mt-3 flex justify-end">
                <button onclick="saveConfiguration()" class="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-4 py-2 rounded transition shadow cursor-pointer">Connect GitHub Repository</button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div class="lg:col-span-1 bg-[#111520] border border-gray-800 p-6 rounded-xl shadow-xl">
                <h2 id="form-title" class="text-base font-black text-amber-400 uppercase tracking-wider mb-4">Add New Player</h2>
                
                <form id="player-form" class="space-y-4">
                    <input type="hidden" id="edit-index" value="-1">
                    
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Minecraft Username</label>
                        <input type="text" id="username" required placeholder="e.g., Dream" class="w-full bg-[#161b26] border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 text-white placeholder-gray-600">
                    </div>

                    <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800/60">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nethpot</label>
                            <select id="tier-nethpot" class="w-full bg-[#161b26] border border-gray-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"></select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Crystal</label>
                            <select id="tier-crystal" class="w-full bg-[#161b26] border border-gray-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"></select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">UHC</label>
                            <select id="tier-uhc" class="w-full bg-[#161b26] border border-gray-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"></select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SMP</label>
                            <select id="tier-smp" class="w-full bg-[#161b26] border border-gray-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"></select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sword</label>
                            <select id="tier-sword" class="w-full bg-[#161b26] border border-gray-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"></select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">DSMP</label>
                            <select id="tier-dsmp" class="w-full bg-[#161b26] border border-gray-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"></select>
                        </div>
                    </div>

                    <div class="flex gap-2 pt-2">
                        <button type="submit" id="submit-btn" class="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2.5 rounded-lg transition shadow-md cursor-pointer">Save Local Changes</button>
                        <button type="button" id="cancel-btn" class="hidden bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs py-2.5 rounded-lg transition px-3 cursor-pointer">Cancel</button>
                    </div>
                </form>
            </div>

            <div class="lg:col-span-2 space-y-4">
                
                <div class="bg-[#141d2e] border border-blue-500/30 p-4 rounded-xl flex items-center justify-between shadow-lg">
                    <div>
                        <h3 class="text-sm font-bold text-blue-400">Deploy Global Database</h3>
                        <p class="text-xs text-gray-400 mt-0.5">Clicking this completely synchronizes your local revisions back into GitHub storage dynamically.</p>
                    </div>
                    <button onclick="pushUpdatesToGitHub()" id="sync-btn" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black px-6 py-3 rounded-lg transition shadow-xl tracking-wider uppercase cursor-pointer">
                        Update Live Site
                    </button>
                </div>

                <div class="bg-[#111520] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-[#0e111a] text-gray-500 text-[10px] font-bold uppercase tracking-wider border-b border-gray-800/50">
                                <th class="py-3 px-5">Player</th>
                                <th class="py-3 px-2 text-center">Neth</th>
                                <th class="py-3 px-2 text-center">Crys</th>
                                <th class="py-3 px-2 text-center">UHC</th>
                                <th class="py-3 px-2 text-center">SMP</th>
                                <th class="py-3 px-2 text-center">Swrd</th>
                                <th class="py-3 px-2 text-center">DSMP</th>
                                <th class="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-table-tbody" class="divide-y divide-gray-850/40">
                            </tbody>
                    </table>
                </div>
            </div>

        </div>
    </main>

    <script src="assets/js/admin.js"></script>
</body>
</html>
