// Initialize Telegram WebApp
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
}

// Helper to get URL query parameters
function getQueryParam(name, defaultValue) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(name);
    return value !== null ? value : defaultValue;
}

// User Stats Data loaded from URL parameters or defaults
const userStats = {
    uid: getQueryParam('uid', '123456789'),
    username: getQueryParam('username', 'MafiaPlayer'),
    first_name: getQueryParam('first_name', 'Mafia Player'),
    dollars: parseInt(getQueryParam('dollars', '200')),
    diamonds: parseInt(getQueryParam('diamonds', '5')),
    games: parseInt(getQueryParam('games', '12')),
    wins: parseInt(getQueryParam('wins', '8')),
    losses: parseInt(getQueryParam('losses', '4')),

    // Inventory quantities
    himoya: parseInt(getQueryParam('himoya', '1')),
    qotil_himoya: parseInt(getQueryParam('qotil_himoya', '0')),
    ovoz_himoya: parseInt(getQueryParam('ovoz_himoya', '2')),
    miltiq: parseInt(getQueryParam('miltiq', '1')),
    maska: parseInt(getQueryParam('maska', '0')),
    soxta_hujjat: parseInt(getQueryParam('soxta_hujjat', '3')),
    dori_himoya: parseInt(getQueryParam('dori_himoya', '0')),
    slip_himoya: parseInt(getQueryParam('slip_himoya', '0')),
    geroy_himoya: parseInt(getQueryParam('geroy_himoya', '0')),

    // Active toggles
    himoya_active: getQueryParam('himoya_active', 'true') === 'true',
    qotil_himoya_active: getQueryParam('qotil_himoya_active', 'true') === 'true',
    ovoz_himoya_active: getQueryParam('ovoz_himoya_active', 'true') === 'true',
    miltiq_active: getQueryParam('miltiq_active', 'true') === 'true',
    maska_active: getQueryParam('maska_active', 'true') === 'true',
    soxta_hujjat_active: getQueryParam('soxta_hujjat_active', 'true') === 'true',
    dori_himoya_active: getQueryParam('dori_himoya_active', 'true') === 'true',
    slip_himoya_active: getQueryParam('slip_himoya_active', 'true') === 'true',
    geroy_himoya_active: getQueryParam('geroy_himoya_active', 'true') === 'true',
    has_geroy: getQueryParam('has_geroy', 'false') === 'true',
    sub_type: getQueryParam('sub_type', 'free')
};

// Global Stats parsed from URL query parameters
const globalStats = {
    active_games: parseInt(getQueryParam('active_games', '0')),
    total_users: parseInt(getQueryParam('total_users', '0'))
};

// Item configurations (Prices aligned with empire2 bot configs and user screenshot)
const itemsConfig = {
    himoya: { name: "🛡 Himoya", emoji: "🛡", description: "Bir marta hayotingizni saqlab qoladi.", price: 100, currency: "dollar" },
    soxta_hujjat: { name: "📁 Soxta hujjat", emoji: "📁", description: "Rol tekshiruvida soxta rol ko'rsatadi.", price: 190, currency: "dollar" },
    ovoz_himoya: { name: "⚖️ Ovozdan himoya", emoji: "⚖️", description: "Sizni osishdan bir marta qutqaradi.", price: 1, currency: "diamond" },
    miltiq: { name: "🔫 Miltiq", emoji: "🔫", description: "Hujumni himoyasini yorib o'tishga yordam beradi.", price: 1, currency: "diamond" },
    dori_himoya: { name: "💊 Doridan himoya", emoji: "💊", description: "Kezuvchining dorisidan himoya qiladi!", price: 100, currency: "dollar" },
    maska: { name: "🎭 Maska", emoji: "🎭", description: "Buni olsangiz daydi sizni taniy olmaydi!", price: 100, currency: "dollar" },
    qotil_himoya: { name: "⛑️ Qotildan himoya", emoji: "⛑️", description: "Qotil va yollanma qotildan cheksiz himoya.", price: 2, currency: "diamond" },
    slip_himoya: { name: "🪤 Sirpanishdan himoya", emoji: "🪤", description: "Sirpanib o'lishdan saqlab qoladi.", price: 300, currency: "dollar" },
    geroy_himoya: { name: "🔰 Geroydan himoya", emoji: "🔰", description: "Geroydan har qanday hujumdan saqlaydi.", price: 7, currency: "diamond" },
    replace_profile: { name: "🔄 Profil almashish", emoji: "🔄", description: "Profilni boshqa foydalanuvchi bilan almashtirish.", price: 5, currency: "diamond" },
    geroy: { name: "🥷 Geroy roli", emoji: "🥷", description: "Sizga tong vaqtida ham otish imkonini beradi.", price: 90, currency: "diamond" },
    custom_emoji: { name: "✨ VIP emoji o'zgartirish", emoji: "✨", description: "Ismingiz yoniga istalgan premium emoji qo'yish.", price: 1, currency: "diamond" }
};

// Calculate Rank and Level Progress
function calculateRankAndLevel() {
    const wins = userStats.wins;
    const games = userStats.games;
    let rank = "Novice";
    let levelTitle = "Daraja: Oddiy o'yinchi";

    if (wins >= 100) {
        rank = "DON 👑";
        levelTitle = "Daraja: Boss (Don)";
    } else if (wins >= 75) {
        rank = "MANIAK 🔪";
        levelTitle = "Daraja: Professional qotil";
    } else if (wins >= 50) {
        rank = "KOMISSAR 👮";
        levelTitle = "Daraja: Tajribali izquvar";
    } else if (wins >= 20) {
        rank = "SHERIK 🤝";
        levelTitle = "Daraja: Shaharlik";
    }

    const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

    return { rank, levelTitle, winRate };
}

// Populate HTML elements
document.addEventListener('DOMContentLoaded', () => {
    // Set Profile Header Info
    const userNameEl = document.getElementById('user-name');
    const userUsernameEl = document.getElementById('user-username');
    const avatarImgEl = document.getElementById('user-avatar');

    const isVip = userStats.sub_type === 'vip';
    let displayName = "";
    let photoUrl = null;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const tgUser = tg.initDataUnsafe.user;
        displayName = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
        userUsernameEl.textContent = tgUser.username ? '@' + tgUser.username : '';
        photoUrl = tgUser.photo_url;
    } else {
        displayName = userStats.first_name;
        userUsernameEl.textContent = '@' + userStats.username;
    }

    if (isVip) {
        userNameEl.innerHTML = `${displayName} <span class="vip-star-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L15 7.5L23 8L17 13.5L19 21.5L12 17.5L5 21.5L7 13.5L1 8L9 7.5L12 0Z" fill="url(#premiumGrad)"/><defs><linearGradient id="premiumGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#aa00ff"/><stop offset="0.5" stop-color="#ff007f"/><stop offset="1" stop-color="#00c8ff"/></linearGradient></defs></svg></span> <span class="vip-text-badge">👑 VIP</span>`;
    } else {
        userNameEl.textContent = displayName;
    }

    // Render avatar
    if (photoUrl) {
        avatarImgEl.src = photoUrl;
        avatarImgEl.style.display = 'block';
        const oldTextAv = document.getElementById('text-avatar');
        if (oldTextAv) oldTextAv.remove();
    } else {
        avatarImgEl.style.display = 'none';
        let textAv = document.getElementById('text-avatar');
        if (!textAv) {
            textAv = document.createElement('div');
            textAv.id = 'text-avatar';
            textAv.className = 'text-avatar-circle';
            avatarImgEl.parentNode.insertBefore(textAv, avatarImgEl);
        }
        const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'M';
        textAv.textContent = firstLetter;

        const colors = [
            'linear-gradient(135deg, #f43f5e, #be123c)',
            'linear-gradient(135deg, #10b981, #047857)',
            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            'linear-gradient(135deg, #eab308, #a16207)',
            'linear-gradient(135deg, #8b5cf6, #5b21b6)',
            'linear-gradient(135deg, #ec4899, #be185d)'
        ];
        const colorIdx = firstLetter.charCodeAt(0) % colors.length;
        textAv.style.background = colors[colorIdx];
    }

    // Set Rank & XP
    const rankInfo = calculateRankAndLevel();
    document.getElementById('rank-badge').textContent = rankInfo.rank;
    document.getElementById('xp-level-title').textContent = rankInfo.levelTitle;
    document.getElementById('xp-pct-val').textContent = rankInfo.winRate + '% WR';
    document.getElementById('xp-bar-fill').style.width = rankInfo.winRate + '%';

    // Set Global Stats
    document.getElementById('global-active-games').textContent = globalStats.active_games;
    document.getElementById('global-total-users').textContent = globalStats.total_users;

    // Apply profile frame based on subscription
    const headerEl = document.querySelector('.profile-header');
    if (userStats.sub_type === 'vip') {
        headerEl.classList.add('vip-active');
    }

    // Set Balances
    document.getElementById('bal-dollars').textContent = userStats.dollars + ' $';
    document.getElementById('bal-diamonds').textContent = userStats.diamonds + ' 💎';

    // Set Stats
    document.getElementById('stat-games').textContent = userStats.games;
    document.getElementById('stat-wins').textContent = userStats.wins;
    document.getElementById('stat-losses').textContent = userStats.losses;

    // Render Subscriptions Upgrade
    renderSubUpgrades();

    // Render Inventory
    renderInventory();

    // Render Shop
    renderShop();
});

// Render Inventory function
function renderInventory() {
    const container = document.getElementById('inventory-container');
    container.innerHTML = '';

    Object.keys(itemsConfig).forEach(key => {
        if (key === 'custom_emoji' || key === 'replace_profile' || key === 'geroy') return;
        const item = itemsConfig[key];
        const qty = userStats[key];
        const isActive = userStats[key + '_active'];

        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerHTML = `
            <div class="item-left">
                <span class="item-icon">${item.emoji}</span>
                <div class="item-name-qty">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">Soni: ${qty} ta</span>
                </div>
            </div>
            <label class="switch">
                <input type="checkbox" id="toggle-${key}" ${isActive ? 'checked' : ''} ${qty === 0 ? 'disabled' : ''}>
                <span class="slider"></span>
            </label>
        `;
        container.appendChild(itemDiv);

        // Toggle Event Listener
        const toggleInput = itemDiv.querySelector('input');
        toggleInput.addEventListener('change', () => {
            handleToggle(key);
        });
    });
}

// Render Subscriptions Upgrade cards
function renderSubUpgrades() {
    const container = document.getElementById('subs-container');
    const section = document.getElementById('subscription-upgrade-section');
    container.innerHTML = '';

    const sub = userStats.sub_type;

    if (sub === 'vip') {
        container.innerHTML = `
            <div class="sub-tier-card vip-card active-vip-card">
                <div class="sub-card-details">
                    <span class="sub-card-title">👑 VIP Status Faollashtirilgan</span>
                    <span class="sub-card-desc" style="color: #ffd700; margin-bottom: 8px;">Premium imtiyozlaringiz faol:</span>
                    <ul class="vip-perks-list" style="list-style: none; padding: 0; margin: 0 0 10px 0;">
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Rol tanlashda maksimal ustuvorlik</li>
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Do'kondagi barcha buyumlarga 25% chegirma</li>
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Guruhda ovoz berishda 2 ta ovoz</li>
                        <li style="margin-bottom: 4px; font-size: 0.85rem;"><i class="fa-solid fa-check-circle text-gold"></i> Profil uchun oltin neon ramkasi</li>
                    </ul>
                </div>
                <button class="buy-btn" style="background: linear-gradient(135deg, #ffd700, #ffa500); color: #000; font-weight: 700; cursor: default;">FAOLLASHTIRILGAN</button>
            </div>
        `;
        section.style.display = 'block';
        return;
    }

    section.style.display = 'block';

    const tiers = [];
    if (sub === 'free') {
        tiers.push({
            id: 'vip',
            name: '👑 VIP Status',
            desc: 'Rol tanlashda maksimal ustuvorlik • 25% chegirma • Ovoz berishda 2 ta ovoz • Neon profil ramkasi',
            price: '30 💎', // VIP cost in empire2 database is 30 diamonds
            btnText: 'Faollashtirish'
        });
    }

    tiers.forEach(tier => {
        const card = document.createElement('div');
        card.className = `sub-tier-card ${tier.id}-card`;
        card.innerHTML = `
            <div class="sub-card-details">
                <span class="sub-card-title">${tier.name}</span>
                <span class="sub-card-desc">${tier.desc}</span>
                <span class="sub-card-price">Narxi: ${tier.price}</span>
            </div>
            <button class="buy-btn" id="upgrade-${tier.id}">${tier.btnText}</button>
        `;
        container.appendChild(card);

        const btn = card.querySelector('button');
        btn.addEventListener('click', () => {
            handleUpgrade(tier.id);
        });
    });
}

// Render Shop function
function renderShop() {
    const container = document.getElementById('shop-container');
    container.innerHTML = '';

    Object.keys(itemsConfig).forEach(key => {
        if (key === 'custom_emoji' && userStats.sub_type !== 'vip') return;
        const item = itemsConfig[key];

        const priceStr = item.currency === 'dollar' ? `${item.price} $` : `${item.price} 💎`;
        const priceClass = item.currency === 'diamond' ? 'diamond-price' : '';

        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
            <div class="shop-card-left">
                <span class="item-icon">${item.emoji}</span>
                <div class="shop-card-info">
                    <span class="shop-card-title">${item.name}</span>
                    <span class="shop-card-desc" style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 2px;">${item.description}</span>
                    <span class="shop-card-price ${priceClass}">Narxi: ${priceStr}</span>
                </div>
            </div>
            <button class="buy-btn" id="buy-${key}">Sotib olish</button>
        `;
        container.appendChild(card);

        const buyBtn = card.querySelector('button');
        if (key === 'geroy' && userStats.has_geroy) {
            buyBtn.textContent = "SOTIB OLINGAN";
            buyBtn.disabled = true;
            buyBtn.style.background = "#5b21b6";
            buyBtn.style.cursor = "default";
            buyBtn.style.boxShadow = "none";
        } else {
            buyBtn.addEventListener('click', () => {
                handleBuy(key);
            });
        }
    });
}

// Helper to send action to bot
function sendAction(data) {
    if (!tg) {
        alert(`Faqat Telegram ichida ishlaydi:\n${JSON.stringify(data)}`);
        return;
    }
    
    // Check if opened via Inline button (query_id exists)
    if (tg.initDataUnsafe && tg.initDataUnsafe.query_id) {
        const botUsername = getQueryParam('bot', 'NeoMafia_bot');
        const payload = btoa(JSON.stringify(data))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_'); // URL-safe base64
        tg.openTelegramLink(`https://t.me/${botUsername}?start=wa_${payload}`);
        tg.close();
    } else {
        try {
            tg.sendData(JSON.stringify(data));
            tg.close();
        } catch (e) {
            // Fallback to deep link if sendData is blocked
            const botUsername = getQueryParam('bot', 'NeoMafia_bot');
            const payload = btoa(JSON.stringify(data))
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
            tg.openTelegramLink(`https://t.me/${botUsername}?start=wa_${payload}`);
            tg.close();
        }
    }
}

// Action Handlers
function handleToggle(itemKey) {
    const nextState = !userStats[itemKey + '_active'];
    userStats[itemKey + '_active'] = nextState;

    const data = {
        action: "toggle",
        item: itemKey
    };
    sendAction(data);
}

// buy item action
function handleBuy(itemKey) {
    const item = itemsConfig[itemKey];
    const data = {
        action: "buy",
        item: itemKey,
        price: item.price,
        currency: item.currency
    };
    sendAction(data);
}

// upgrade to VIP tier
function handleUpgrade(tier) {
    const data = {
        action: "upgrade",
        tier: tier
    };
    sendAction(data);
}

