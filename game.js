// Game state
const gameState = {
    player: {
        health: 100,
        maxHealth: 100,
        level: 1,
        xp: 0,
        nextLevel: 100,
        gold: 10,
        attackPower: 10
    },
    enemies: [],
    items: [],
    inCombat: false
};

// DOM elements
const healthEl = document.getElementById('health');
const levelEl = document.getElementById('level');
const xpEl = document.getElementById('xp');
const nextLevelEl = document.getElementById('next-level');
const goldEl = document.getElementById('gold');
const messageLog = document.getElementById('message-log');
const enemiesContainer = document.getElementById('enemies');
const itemsContainer = document.getElementById('items');

// Buttons
document.getElementById('attack-btn').addEventListener('click', attack);
document.getElementById('heal-btn').addEventListener('click', heal);
document.getElementById('explore-btn').addEventListener('click', explore);

// Game functions
function updateStats() {
    healthEl.textContent = gameState.player.health;
    levelEl.textContent = gameState.player.level;
    xpEl.textContent = gameState.player.xp;
    nextLevelEl.textContent = gameState.player.nextLevel;
    goldEl.textContent = gameState.player.gold;
}

function addMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageLog.appendChild(messageElement);
    messageLog.scrollTop = messageLog.scrollHeight;
}

function spawnEnemy() {
    if (gameState.enemies.length >= 3) return;
    
    const enemy = {
        id: Date.now(),
        health: 30 + Math.floor(Math.random() * 20),
        attackPower: 5 + Math.floor(Math.random() * 5),
        x: Math.floor(Math.random() * 450),
        y: Math.floor(Math.random() * 370)
    };
    
    gameState.enemies.push(enemy);
    
    const enemyElement = document.createElement('div');
    enemyElement.className = 'enemy';
    enemyElement.id = `enemy-${enemy.id}`;
    enemyElement.style.left = `${enemy.x}px`;
    enemyElement.style.top = `${enemy.y}px`;
    enemiesContainer.appendChild(enemyElement);
    
    addMessage(`A wild enemy appeared!`);
    gameState.inCombat = true;
}

function spawnItem() {
    const item = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'gold' : 'health',
        value: Math.floor(Math.random() * 10) + 5,
        x: Math.floor(Math.random() * 450),
        y: Math.floor(Math.random() * 370)
    };
    
    gameState.items.push(item);
    
    const itemElement = document.createElement('div');
    itemElement.className = 'item';
    itemElement.id = `item-${item.id}`;
    itemElement.style.left = `${item.x}px`;
    itemElement.style.top = `${item.y}px`;
    itemsContainer.appendChild(itemElement);
}

function attack() {
    if (gameState.enemies.length === 0) {
        addMessage("No enemies to attack!");
        return;
    }
    
    // Simple attack - hits first enemy
    const enemy = gameState.enemies[0];
    enemy.health -= gameState.player.attackPower;
    
    addMessage(`You hit the enemy for ${gameState.player.attackPower} damage!`);
    
    if (enemy.health <= 0) {
        // Enemy defeated
        const enemyIndex = gameState.enemies.findIndex(e => e.id === enemy.id);
        gameState.enemies.splice(enemyIndex, 1);
        document.getElementById(`enemy-${enemy.id}`).remove();
        
        const xpGain = 20 + Math.floor(Math.random() * 10);
        const goldGain = 5 + Math.floor(Math.random() * 6);
        
        gameState.player.xp += xpGain;
        gameState.player.gold += goldGain;
        
        addMessage(`Enemy defeated! Gained ${xpGain} XP and ${goldGain} gold.`);
        
        // Check for level up
        checkLevelUp();
    } else {
        // Enemy counter attack
        gameState.player.health -= enemy.attackPower;
        addMessage(`Enemy hits you for ${enemy.attackPower} damage!`);
        
        if (gameState.player.health <= 0) {
            gameState.player.health = 0;
            addMessage("You have been defeated! Game over.");
            gameState.inCombat = false;
        }
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
    
    if (eventRoll < 0.4) {
        spawnEnemy();
    } else if (eventRoll < 0.7) {
        spawnItem();
        addMessage("You found an item!");
    } else {
        const goldFound = Math.floor(Math.random() * 5) + 1;
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
        gameState.player.maxHealth += 20;
        gameState.player.health = gameState.player.maxHealth;
        gameState.player.attackPower += 3;
        
        addMessage(`Level up! You are now level ${gameState.player.level}!`);
        updateStats();
    }
}

// Initialize game
updateStats();
addMessage("Welcome to the RPG game! Click 'Explore' to begin your adventure.");
