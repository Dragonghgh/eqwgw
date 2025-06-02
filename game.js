// Enhanced Game State
const gameState = {
    player: {
        name: "Hero",
        class: null,
        health: 100,
        maxHealth: 100,
        level: 1,
        xp: 0,
        nextLevel: 100,
        gold: 10,
        attackPower: 10,
        specialAttackPower: 20,
        defense: 5,
        critChance: 0.1,
        evasion: 0.05,
        inventory: [],
        equipped: {
            weapon: { name: "Basic Sword", attackBonus: 2 },
            armor: { name: "Cloth Tunic", defenseBonus: 1 }
        },
        position: { x: 350, y: 250 },
        specialAttackCharges: 3,
        maxSpecialAttackCharges: 3
    },
    enemies: [],
    items: [],
    npcs: [],
    quests: {
        active: [],
        completed: []
    },
    inCombat: false,
    gameMap: {
        width: 700,
        height: 500,
        obstacles: []
    },
    soundEnabled: true,
    musicEnabled: true
};

// Item Database
const itemsDB = {
    weapons: [
        { id: 1, name: "Basic Sword", type: "weapon", attackBonus: 2, value: 15 },
        { id: 2, name: "Iron Sword", type: "weapon", attackBonus: 5, value: 40 },
        { id: 3, name: "Steel Sword", type: "weapon", attackBonus: 8, value: 80 },
        { id: 4, name: "Magic Staff", type: "weapon", attackBonus: 4, specialAttackBonus: 10, value: 100 }
    ],
    armor: [
        { id: 101, name: "Cloth Tunic", type: "armor", defenseBonus: 1, value: 10 },
        { id: 102, name: "Leather Armor", type: "armor", defenseBonus: 3, value: 30 },
        { id: 103, name: "Chainmail", type: "armor", defenseBonus: 5, value: 70 },
        { id: 104, name: "Plate Armor", type: "armor", defenseBonus: 8, value: 120 }
    ],
    consumables: [
        { id: 201, name: "Health Potion", type: "consumable", effect: "heal", value: 20, amount: 30, value: 15 },
        { id: 202, name: "Mana Potion", type: "consumable", effect: "restoreSpecial", value: 1, amount: 1, value: 20 }
    ],
    questItems: [
        { id: 301, name: "Bandit's Amulet", type: "quest", description: "Proof of defeating the bandit leader", value: 0 }
    ]
};

// Enemy Database
const enemiesDB = [
    { name: "Goblin", health: 30, attackPower: 5, xp: 20, gold: [3, 8], drops: [{item: itemsDB.consumables[0], chance: 0.3}] },
    { name: "Orc", health: 50, attackPower: 8, xp: 35, gold: [5, 12], drops: [{item: itemsDB.consumables[0], chance: 0.5}] },
    { name: "Skeleton", health: 25, attackPower: 7, xp: 25, gold: [2, 6], drops: [{item: itemsDB.weapons[1], chance: 0.1}] },
    { name: "Bandit", health: 40, attackPower: 6, xp: 30, gold: [8, 15], drops: [{item: itemsDB.questItems[0], chance: 0.1}] }
];

// Quest Database
const questsDB = [
    {
        id: 1,
        title: "Defeat 5 Enemies",
        description: "Prove your strength by defeating 5 enemies.",
        objective: { type: "defeat", target: "any", amount: 5 },
        reward: { xp: 100, gold: 50, items: [itemsDB.weapons[1]] },
        completed: false,
        progress: 0
    },
    {
        id: 2,
        title: "Find the Bandit's Amulet",
        description: "Defeat bandits until you find their leader's amulet.",
        objective: { type: "collect", target: "Bandit's Amulet", amount: 1 },
        reward: { xp: 150, gold: 100, items: [itemsDB.armor[2]] },
        completed: false,
        progress: 0
    },
    {
        id: 3,
        title: "Reach Level 3",
        description: "Gain enough experience to reach level 3.",
        objective: { type: "level", target: 3, amount: 1 },
        reward: { xp: 50, gold: 75, items: [itemsDB.consumables[1]] },
        completed: false,
        progress: 0
    }
];

// DOM Elements
const healthEl = document.getElementById('health');
const maxHealthEl = document.getElementById('max-health');
const levelEl = document.getElementById('level');
const xpEl = document.getElementById('xp');
const nextLevelEl = document.getElementById('next-level');
const goldEl = document.getElementById('gold');
const classEl = document.getElementById('class');
const equippedWeaponEl = document.getElementById('equipped-weapon');
const equippedArmorEl = document.getElementById('equipped-armor');
const messageLog = document.getElementById('message-log');
const enemiesContainer = document.getElementById('enemies');
const itemsContainer = document.getElementById('items');
const npcsContainer = document.getElementById('npcs');
const inventoryItemsEl = document.getElementById('inventory-items');
const activeQuestsEl = document.getElementById('active-quests');
const inventoryModalItemsEl = document.getElementById('inventory-modal-items');
const questModalContentEl = document.getElementById('quest-modal-content');

// Buttons
document.getElementById('attack-btn').addEventListener('click', attack);
document.getElementById('special-btn').addEventListener('click', specialAttack);
document.getElementById('heal-btn').addEventListener('click', heal);
document.getElementById('explore-btn').addEventListener('click', explore);
document.getElementById('inventory-btn').addEventListener('click', openInventory);
document.getElementById('quests-btn').addEventListener('click', openQuests);

// Modal buttons
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});

// Class selection buttons
document.getElementById('warrior-btn').addEventListener('click', () => selectClass('warrior'));
document.getElementById('mage-btn').addEventListener('click', () => selectClass('mage'));
document.getElementById('rogue-btn').addEventListener('click', () => selectClass('rogue'));

// Audio elements
const backgroundMusic = document.getElementById('background-music');
const attackSound = document.getElementById('attack-sound');
const healSound = document.getElementById('heal-sound');

// Initialize game
function initGame() {
    // Show class selection modal
    document.getElementById('class-select-modal').style.display = 'block';
    
    // Initialize inventory with some basic items
    addToInventory(itemsDB.consumables[0]);
    addToInventory(itemsDB.consumables[0]);
    
    // Add some initial quests
    acceptQuest(1);
    acceptQuest(2);
    
    // Set up player movement
    setupPlayerMovement();
    
    // Update UI
    updateStats();
    updateInventory();
    updateQuests();
    addMessage("Welcome to the Enhanced RPG Game! Choose your class to begin.");
}

// Class selection
function selectClass(className) {
    gameState.player.class = className;
    classEl.textContent = className.charAt(0).toUpperCase() + className.slice(1);
    
    switch (className) {
        case 'warrior':
            gameState.player.maxHealth = 120;
            gameState.player.health = 120;
            gameState.player.attackPower = 12;
            gameState.player.specialAttackPower = 25;
            gameState.player.defense = 8;
            gameState.player.equipped.weapon = itemsDB.weapons[0];
            gameState.player.equipped.armor = itemsDB.armor[1];
            break;
        case 'mage':
            gameState.player.maxHealth = 80;
            gameState.player.health = 80;
            gameState.player.attackPower = 8;
            gameState.player.specialAttackPower = 35;
            gameState.player.defense = 3;
            gameState.player.maxSpecialAttackCharges = 5;
            gameState.player.specialAttackCharges = 5;
            gameState.player.equipped.weapon = itemsDB.weapons[3];
            gameState.player.equipped.armor = itemsDB.armor[0];
            break;
        case 'rogue':
            gameState.player.maxHealth = 100;
            gameState.player.health = 100;
            gameState.player.attackPower = 10;
            gameState.player.specialAttackPower = 20;
            gameState.player.defense = 5;
            gameState.player.critChance = 0.2;
            gameState.player.evasion = 0.15;
            gameState.player.equipped.weapon = itemsDB.weapons[1];
            gameState.player.equipped.armor = itemsDB.armor[1];
            break;
    }
    
    document.getElementById('class-select-modal').style.display = 'none';
    updateStats();
    addMessage(`You have chosen the ${className} class!`);
    
    // Start background music if enabled
    if (gameState.musicEnabled) {
        backgroundMusic.volume = 0.3;
        backgroundMusic.play().catch(e => console.log("Audio play failed:", e));
    }
}

// Player movement
function setupPlayerMovement() {
    const player = document.getElementById('player');
    const moveSpeed = 5;
    const keys = {};
    
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    function gameLoop() {
        if (keys['ArrowUp'] || keys['w']) {
            movePlayer(0, -moveSpeed);
        }
        if (keys['ArrowDown'] || keys['s']) {
            movePlayer(0, moveSpeed);
        }
        if (keys['ArrowLeft'] || keys['a']) {
            movePlayer(-moveSpeed, 0);
            player.style.transform = 'scaleX(-1)';
        }
        if (keys['ArrowRight'] || keys['d']) {
            movePlayer(moveSpeed, 0);
            player.style.transform = 'scaleX(1)';
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

function movePlayer(dx, dy) {
    if (gameState.inCombat) return;
    
    const newX = gameState.player.position.x + dx;
    const newY = gameState.player.position.y + dy;
    
    // Boundary checking
    if (newX >= 0 && newX <= gameState.gameMap.width - 32 && 
        newY >= 0 && newY <= gameState.gameMap.height - 32) {
        gameState.player.position.x = newX;
        gameState.player.position.y = newY;
        
        const player = document.getElementById('player');
        player.style.left = `${newX}px`;
        player.style.top = `${newY}px`;
        
        // Random encounter chance while moving
        if (Math.random() < 0.005 && !gameState.inCombat) {
            spawnEnemy();
        }
    }
}

// Game functions
function updateStats() {
    healthEl.textContent = gameState.player.health;
    maxHealthEl.textContent = gameState.player.maxHealth;
    levelEl.textContent = gameState.player.level;
    xpEl.textContent = gameState.player.xp;
    nextLevelEl.textContent = gameState.player.nextLevel;
    goldEl.textContent = gameState.player.gold;
    equippedWeaponEl.textContent = gameState.player.equipped.weapon.name;
    equippedArmorEl.textContent = gameState.player.equipped.armor.name;
}

function addMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageLog.appendChild(messageElement);
    messageLog.scrollTop = messageLog.scrollHeight;
}

function spawnEnemy() {
    if (gameState.enemies.length >= 3) return;
    
    const enemyType = enemiesDB[Math.floor(Math.random() * enemiesDB.length)];
    const enemy = {
        id: Date.now(),
        name: enemyType.name,
        health: enemyType.health,
        maxHealth: enemyType.health,
        attackPower: enemyType.attackPower,
        xp: enemyType.xp,
        goldRange: enemyType.gold,
        drops: enemyType.drops,
        x: Math.floor(Math.random() * (gameState.gameMap.width - 50)),
        y: Math.floor(Math.random() * (gameState.gameMap.height - 50))
    };
    
    gameState.enemies.push(enemy);
    
    const enemyElement = document.createElement('div');
    enemyElement.className = 'enemy';
    enemyElement.id = `enemy-${enemy.id}`;
    enemyElement.style.left = `${enemy.x}px`;
    enemyElement.style.top = `${enemy.y}px`;
    
    // Add health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'enemy-health';
    healthBar.innerHTML = `
        <div class="health-bar">
            <div class="health-fill" style="width: 100%"></div>
        </div>
        <div class="health-text">${enemy.health}/${enemy.maxHealth}</div>
    `;
    enemyElement.appendChild(healthBar);
    
    enemiesContainer.appendChild(enemyElement);
    
    addMessage(`A wild ${enemy.name} appeared!`);
    gameState.inCombat = true;
    
    // Move player to center if they're too far
    gameState.player.position.x = gameState.gameMap.width / 2 - 16;
    gameState.player.position.y = gameState.gameMap.height / 2 - 16;
    document.getElementById('player').style.left = `${gameState.player.position.x}px`;
    document.getElementById('player').style.top = `${gameState.player.position.y}px`;
}

function spawnItem(itemType = null) {
    if (!itemType) {
        const itemRoll = Math.random();
        if (itemRoll < 0.5) {
            itemType = itemsDB.consumables[0]; // Health potion
        } else if (itemRoll < 0.8) {
            itemType = itemsDB.weapons[Math.floor(Math.random() * 2)]; // Basic weapons
        } else {
            itemType = itemsDB.armor[Math.floor(Math.random() * 2)]; // Basic armor
        }
    }
    
    const item = {
        id: Date.now(),
        type: itemType.type,
        name: itemType.name,
        data: itemType,
        x: Math.floor(Math.random() * (gameState.gameMap.width - 30)),
        y: Math.floor(Math.random() * (gameState.gameMap.height - 30))
    };
    
    gameState.items.push(item);
    
    const itemElement = document.createElement('div');
    itemElement.className = 'item';
    itemElement.id = `item-${item.id}`;
    itemElement.style.left = `${item.x}px`;
    itemElement.style.top = `${item.y}px`;
    
    // Add tooltip
    itemElement.title = item.name;
    
    itemsContainer.appendChild(itemElement);
    
    return item;
}

function spawnNPC() {
    const npc = {
        id: Date.now(),
        name: "Villager",
        x: Math.floor(Math.random() * (gameState.gameMap.width - 32)),
        y: Math.floor(Math.random() * (gameState.gameMap.height - 32))
    };
    
    gameState.npcs.push(npc);
    
    const npcElement = document.createElement('div');
    npcElement.className = 'npc';
    npcElement.id = `npc-${npc.id}`;
    npcElement.style.left = `${npc.x}px`;
    npcElement.style.top = `${npc.y}px`;
    npcElement.title = npc.name;
    
    npcsContainer.appendChild(npcElement);
    
    return npc;
}

function attack() {
    if (gameState.enemies.length === 0) {
        addMessage("No enemies to attack!");
        return;
    }
    
    // Play attack sound if enabled
    if (gameState.soundEnabled) {
        attackSound.currentTime = 0;
        attackSound.play().catch(e => console.log("Sound play failed:", e));
    }
    
    // Simple attack - hits first enemy
    const enemy = gameState.enemies[0];
    
    // Check for critical hit
    const isCritical = Math.random() < gameState.player.critChance;
    let damage = gameState.player.attackPower + gameState.player.equipped.weapon.attackBonus;
    
    if (isCritical) {
        damage *= 2;
        addMessage("Critical hit!");
    }
    
    enemy.health -= damage;
    
    // Update enemy health bar
    const enemyElement = document.getElementById(`enemy-${enemy.id}`);
    if (enemyElement) {
        const healthFill = enemyElement.querySelector('.health-fill');
        const healthText = enemyElement.querySelector('.health-text');
        const healthPercent = (enemy.health / enemy.maxHealth) * 100;
        healthFill.style.width = `${healthPercent}%`;
        healthText.textContent = `${enemy.health}/${enemy.maxHealth}`;
        
        // Add shake effect
        enemyElement.classList.add('shake');
        setTimeout(() => enemyElement.classList.remove('shake'), 500);
    }
    
    addMessage(`You hit the ${enemy.name} for ${damage} damage!${isCritical ? " (Critical!)" : ""}`);
    
    if (enemy.health <= 0) {
        // Enemy defeated
        const enemyIndex = gameState.enemies.findIndex(e => e.id === enemy.id);
        gameState.enemies.splice(enemyIndex, 1);
        document.getElementById(`enemy-${enemy.id}`)?.remove();
        
        const xpGain = enemy.xp;
        const goldGain = Math.floor(Math.random() * (enemy.goldRange[1] - enemy.goldRange[0] + 1)) + enemy.goldRange[0];
        
        gameState.player.xp += xpGain;
        gameState.player.gold += goldGain;
        
        addMessage(`${enemy.name} defeated! Gained ${xpGain} XP and ${goldGain} gold.`);
        
        // Check for drops
        enemy.drops.forEach(drop => {
            if (Math.random() < drop.chance) {
                addMessage(`${enemy.name} dropped a ${drop.item.name}!`);
                addToInventory(drop.item);
            }
        });
        
        // Update quest progress
        updateQuestProgress('defeat', enemy.name);
        
        // Check for level up
        checkLevelUp();
        
        // End combat if no more enemies
        if (gameState.enemies.length === 0) {
            gameState.inCombat = false;
            addMessage("Combat ended. You are victorious!");
        }
    } else {
        // Enemy counter attack
        enemyAttack(enemy);
    }
    
    updateStats();
}

function specialAttack() {
    if (gameState.enemies.length === 0) {
        addMessage("No enemies to attack!");
        return;
    }
    
    if (gameState.player.specialAttackCharges <= 0) {
        addMessage("No special attack charges left!");
        return;
    }
    
    // Play attack sound if enabled
    if (gameState.soundEnabled) {
        attackSound.currentTime = 0;
        attackSound.play().catch(e => console.log("Sound play failed:", e));
    }
    
    gameState.player.specialAttackCharges--;
    
    // Special attack hits all enemies
    gameState.enemies.forEach(enemy => {
        let damage = gameState.player.specialAttackPower;
        if (gameState.player.equipped.weapon.specialAttackBonus) {
            damage += gameState.player.equipped.weapon.specialAttackBonus;
        }
        
        enemy.health -= damage;
        
        // Update enemy health bar
        const enemyElement = document.getElementById(`enemy-${enemy.id}`);
        if (enemyElement) {
            const healthFill = enemyElement.querySelector('.health-fill');
            const healthText = enemyElement.querySelector('.health-text');
            const healthPercent = (enemy.health / enemy.maxHealth) * 100;
            healthFill.style.width = `${healthPercent}%`;
            healthText.textContent = `${enemy.health}/${enemy.maxHealth}`;
            
            // Add flash effect
            enemyElement.classList.add('flash');
            setTimeout(() => enemyElement.classList.remove('flash'), 300);
        }
        
        addMessage(`Your special attack hits ${enemy.name} for ${damage} damage!`);
        
        if (enemy.health <= 0) {
            // Enemy defeated
            const enemyIndex = gameState.enemies.findIndex(e => e.id === enemy.id);
            gameState.enemies.splice(enemyIndex, 1);
            document.getElementById(`enemy-${enemy.id}`)?.remove();
            
            const xpGain = enemy.xp;
            const goldGain = Math.floor(Math.random() * (enemy.goldRange[1] - enemy.goldRange[0] + 1)) + enemy.goldRange[0];
            
            gameState.player.xp += xpGain;
            gameState.player.gold += goldGain;
            
            addMessage(`${enemy.name} defeated! Gained ${xpGain} XP and ${goldGain} gold.`);
            
            // Check for drops
            enemy.drops.forEach(drop => {
                if (Math.random() < drop.chance) {
                    addMessage(`${enemy.name} dropped a ${drop.item.name}!`);
                    addToInventory(drop.item);
                }
            });
            
            // Update quest progress
            updateQuestProgress('defeat', enemy.name);
        }
    });
    
    // Remove defeated enemies
    gameState.enemies = gameState.enemies.filter(enemy => enemy.health > 0);
    
    // End combat if no more enemies
    if (gameState.enemies.length === 0) {
        gameState.inCombat = false;
        addMessage("Combat ended. You are victorious!");
    } else {
        // All surviving enemies attack
        gameState.enemies.forEach(enemy => {
            enemyAttack(enemy);
        });
    }
    
    // Check for level up
    checkLevelUp();
    updateStats();
}

function enemyAttack(enemy) {
    // Check for player evasion
    if (Math.random() < gameState.player.evasion) {
        addMessage(`You dodged the ${enemy.name}'s attack!`);
        return;
    }
    
    const damage = Math.max(1, enemy.attackPower - gameState.player.defense - gameState.player.equipped.armor.defenseBonus);
    gameState.player.health -= damage;
    
    // Add player flash effect
    const playerElement = document.getElementById('player');
    playerElement.classList.add('flash');
    setTimeout(() => playerElement.classList.remove('flash'), 300);
    
    addMessage(`${enemy.name} hits you for ${damage} damage!`);
    
    if (gameState.player.health <= 0) {
        gameState.player.health = 0;
        addMessage("You have been defeated! Game over.");
        gameState.inCombat = false;
    }
    
    updateStats();
}

function heal() {
    if (gameState.player.gold < 10) {
        addMessage("Not enough gold to heal!");
        return;
    }
    
    if (gameState.player.health >= gameState.player.maxHealth) {
        addMessage("You're already at full health!");
        return;
    }
    
    // Play heal sound if enabled
    if (gameState.soundEnabled) {
        healSound.currentTime = 0;
        healSound.play().catch(e => console.log("Sound play failed:", e));
    }
    
    gameState.player.gold -= 10;
    gameState.player.health = Math.min(gameState.player.health + 30, gameState.player.maxHealth);
    addMessage("You healed for 30 health points!");
    updateStats();
}

function explore() {
    if (gameState.inCombat) {
        addMessage("You can't explore while in combat!");
        return;
    }
    
    addMessage("You explore the area...");
    
    // Random chance for events
    const eventRoll = Math.random();
    
    if (eventRoll < 0.3) {
        spawnEnemy();
    } else if (eventRoll < 0.5) {
        const item = spawnItem();
        addMessage(`You found a ${item.name}!`);
    } else if (eventRoll < 0.6 && gameState.npcs.length < 2) {
        const npc = spawnNPC();
        addMessage(`You encountered a ${npc.name}.`);
    } else {
        const goldFound = Math.floor(Math.random() * 10) + 1;
        gameState.player.gold += goldFound;
        addMessage(`You found ${goldFound} gold!`);
        updateStats();
    }
}

function checkLevelUp() {
    if (gameState.player.xp >= gameState.player.nextLevel) {
        gameState.player.level++;
        gameState.player.xp -= gameState.player.nextLevel;
        gameState.player.nextLevel = Math.floor(gameState.player.nextLevel * 1.5);
        gameState.player.maxHealth += 10;
        gameState.player.health = gameState.player.maxHealth;
        gameState.player.attackPower += 2;
        gameState.player.specialAttackPower += 3;
        gameState.player.specialAttackCharges = gameState.player.maxSpecialAttackCharges;
        
        addMessage(`Level up! You are now level ${gameState.player.level}!`);
        updateStats();
        
        // Check for level-based quest completion
        updateQuestProgress('level', gameState.player.level);
    }
}

// Inventory system
function addToInventory(item) {
    gameState.player.inventory.push(item);
    updateInventory();
}

function updateInventory() {
    inventoryItemsEl.innerHTML = '';
    gameState.player.inventory.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.textContent = item.name.substring(0, 2);
        itemElement.title = item.name;
        itemElement.addEventListener('click', () => useItem(index));
        inventoryItemsEl.appendChild(itemElement);
    });
}

function useItem(index) {
    const item = gameState.player.inventory[index];
    
    switch (item.type) {
        case 'consumable':
            if (item.effect === 'heal') {
                gameState.player.health = Math.min(gameState.player.health + item.amount, gameState.player.maxHealth);
                addMessage(`You used a ${item.name} and healed ${item.amount} health.`);
            } else if (item.effect === 'restoreSpecial') {
                gameState.player.specialAttackCharges = Math.min(
                    gameState.player.specialAttackCharges + item.amount, 
                    gameState.player.maxSpecialAttackCharges
                );
                addMessage(`You used a ${item.name} and restored ${item.amount} special attack charge(s).`);
            }
            break;
            
        case 'weapon':
            // Equip weapon
            const oldWeapon = gameState.player.equipped.weapon;
            gameState.player.equipped.weapon = item;
            gameState.player.inventory[index] = oldWeapon;
            addMessage(`You equipped the ${item.name}.`);
            break;
            
        case 'armor':
            // Equip armor
            const oldArmor = gameState.player.equipped.armor;
            gameState.player.equipped.armor = item;
            gameState.player.inventory[index] = oldArmor;
            addMessage(`You equipped the ${item.name}.`);
            break;
            
        default:
            addMessage(`You can't use the ${item.name}.`);
            return;
    }
    
    // Remove the item if it's consumable
    if (item.type === 'consumable') {
        gameState.player.inventory.splice(index, 1);
    }
    
    updateInventory();
    updateStats();
}

function openInventory() {
    inventoryModalItemsEl.innerHTML = '';
    
    if (gameState.player.inventory.length === 0) {
        inventoryModalItemsEl.innerHTML = '<p>Your inventory is empty.</p>';
    } else {
        gameState.player.inventory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-modal-item';
            itemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>Type: ${item.type}</p>
                ${item.type === 'weapon' ? `<p>Attack: +${item.attackBonus}</p>` : ''}
                ${item.type === 'armor' ? `<p>Defense: +${item.defenseBonus}</p>` : ''}
                ${item.type === 'consumable' ? `<p>Effect: ${item.effect} (${item.amount})</p>` : ''}
                <button onclick="useItem(${index})">Use</button>
            `;
            inventoryModalItemsEl.appendChild(itemElement);
        });
    }
    
    document.getElementById('inventory-modal').style.display = 'block';
}

// Quest system
function acceptQuest(questId) {
    const quest = questsDB.find(q => q.id === questId);
    if (!quest) return;
    
    if (gameState.quests.active.some(q => q.id === questId) {
        addMessage(`You already have this quest.`);
        return;
    }
    
    if (gameState.quests.completed.some(q => q.id === questId)) {
        addMessage(`You already completed this quest.`);
        return;
    }
    
    const newQuest = {...quest};
    gameState.quests.active.push(newQuest);
    addMessage(`New quest accepted: ${newQuest.title}`);
    
    updateQuests();
}

function completeQuest(questIndex) {
    const quest = gameState.quests.active[questIndex];
    if (!quest) return;
    
    // Give rewards
    const reward = quest.reward;
    gameState.player.xp += reward.xp;
    gameState.player.gold += reward.gold;
    
    if (reward.items && reward.items.length > 0) {
        reward.items.forEach(item => {
            addToInventory(item);
            addMessage(`Received ${item.name} as quest reward!`);
        });
    }
    
    addMessage(`Quest completed: ${quest.title}! Received ${reward.xp} XP and ${reward.gold} gold.`);
    
    // Mark as completed
    quest.completed = true;
    gameState.quests.active.splice(questIndex, 1);
    gameState.quests.completed.push(quest);
    
    // Check for level up
    checkLevelUp();
    updateStats();
    updateQuests();
}

function updateQuestProgress(type, target) {
    gameState.quests.active.forEach((quest, index) => {
        if (quest.completed) return;
        
        if (quest.objective.type === type) {
            if (quest.objective.type === 'defeat' && 
                (quest.objective.target === 'any' || quest.objective.target === target)) {
                quest.progress++;
            } else if (quest.objective.type === 'level' && 
                       quest.objective.target <= target) {
                quest.progress = 1;
            } else if (quest.objective.type === 'collect') {
                // For collect quests, check inventory
                const itemCount = gameState.player.inventory.filter(
                    item => item.name === quest.objective.target
                ).length;
                quest.progress = itemCount;
            }
            
            if (quest.progress >= quest.objective.amount) {
                completeQuest(index);
            }
        }
    });
}

function updateQuests() {
    activeQuestsEl.innerHTML = '';
    
    if (gameState.quests.active.length === 0) {
        activeQuestsEl.innerHTML = '<p>No active quests.</p>';
    } else {
        gameState.quests.active.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = 'quest-item';
            
            let progressText = '';
            if (quest.objective.type === 'defeat') {
                const target = quest.objective.target === 'any' ? 'enemies' : `${quest.objective.target}s`;
                progressText = `Defeat ${quest.progress}/${quest.objective.amount} ${target}`;
            } else if (quest.objective.type === 'collect') {
                progressText = `Find ${quest.progress}/${quest.objective.amount} ${quest.objective.target}`;
            } else if (quest.objective.type === 'level') {
                progressText = `Reach level ${quest.objective.target}`;
            }
            
            questElement.innerHTML = `
                <h3>${quest.title}</h3>
                <p>${quest.description}</p>
                <p>Progress: ${progressText}</p>
            `;
            activeQuestsEl.appendChild(questElement);
        });
    }
}

function openQuests() {
    questModalContentEl.innerHTML = '';
    
    // Active quests
    const activeHeader = document.createElement('h3');
    activeHeader.textContent = 'Active Quests';
    questModalContentEl.appendChild(activeHeader);
    
    if (gameState.quests.active.length === 0) {
        const noActive = document.createElement('p');
        noActive.textContent = 'No active quests.';
        questModalContentEl.appendChild(noActive);
    } else {
        gameState.quests.active.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = 'quest-modal-item';
            
            let progressText = '';
            if (quest.objective.type === 'defeat') {
                const target = quest.objective.target === 'any' ? 'enemies' : `${quest.objective.target}s`;
                progressText = `Defeat ${quest.progress}/${quest.objective.amount} ${target}`;
            } else if (quest.objective.type === 'collect') {
                progressText = `Find ${quest.progress}/${quest.objective.amount} ${quest.objective.target}`;
            } else if (quest.objective.type === 'level') {
                progressText = `Reach level ${quest.objective.target}`;
            }
            
            questElement.innerHTML = `
                <h4>${quest.title}</h4>
                <p>${quest.description}</p>
                <p><strong>Progress:</strong> ${progressText}</p>
                <p><strong>Reward:</strong> ${quest.reward.xp} XP, ${quest.reward.gold} gold</p>
            `;
            questModalContentEl.appendChild(questElement);
        });
    }
    
    // Completed quests
    const completedHeader = document.createElement('h3');
    completedHeader.textContent = 'Completed Quests';
    completedHeader.style.marginTop = '20px';
    questModalContentEl.appendChild(completedHeader);
    
    if (gameState.quests.completed.length === 0) {
        const noCompleted = document.createElement('p');
        noCompleted.textContent = 'No completed quests yet.';
        questModalContentEl.appendChild(noCompleted);
    } else {
        gameState.quests.completed.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = 'quest-modal-item completed';
            questElement.innerHTML = `
                <h4>${quest.title} (Completed)</h4>
                <p>${quest.description}</p>
            `;
            questModalContentEl.appendChild(questElement);
        });
    }
    
    // Available quests
    const availableHeader = document.createElement('h3');
    availableHeader.textContent = 'Available Quests';
    availableHeader.style.marginTop = '20px';
    questModalContentEl.appendChild(availableHeader);
    
    const availableQuests = questsDB.filter(quest => 
        !gameState.quests.active.some(q => q.id === quest.id) &&
        !gameState.quests.completed.some(q => q.id === quest.id)
    );
    
    if (availableQuests.length === 0) {
        const noAvailable = document.createElement('p');
        noAvailable.textContent = 'No available quests at the moment.';
        questModalContentEl.appendChild(noAvailable);
    } else {
        availableQuests.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = 'quest-modal-item available';
            questElement.innerHTML = `
                <h4>${quest.title}</h4>
                <p>${quest.description}</p>
                <p><strong>Objective:</strong> ${getQuestObjectiveText(quest)}</p>
                <p><strong>Reward:</strong> ${quest.reward.xp} XP, ${quest.reward.gold} gold</p>
                <button onclick="acceptQuest(${quest.id})">Accept Quest</button>
            `;
            questModalContentEl.appendChild(questElement);
        });
    }
    
    document.getElementById('quest-modal').style.display = 'block';
}

function getQuestObjectiveText(quest) {
    if (quest.objective.type === 'defeat') {
        const target = quest.objective.target === 'any' ? 'any enemies' : `${quest.objective.target}s`;
        return `Defeat ${quest.objective.amount} ${target}`;
    } else if (quest.objective.type === 'collect') {
        return `Find ${quest.objective.amount} ${quest.objective.target}`;
    } else if (quest.objective.type === 'level') {
        return `Reach level ${quest.objective.target}`;
    }
    return '';
}

// Start the game
initGame();

// Make functions available globally for HTML onclick attributes
window.useItem = useItem;
window.acceptQuest = acceptQuest;
