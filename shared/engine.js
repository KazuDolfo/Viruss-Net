"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discardCards = exports.endTurn = exports.checkWin = exports.playCard = exports.drawCard = exports.canPlayCard = exports.initGame = exports.shuffle = exports.createDeck = exports.COLORS = void 0;
exports.COLORS = ['red', 'blue', 'green', 'yellow'];
const createDeck = () => {
    const deck = [];
    let id = 0;
    const addCards = (type, color, name, count) => {
        for (let i = 0; i < count; i++) {
            deck.push({ id: `${type}-${color}-${id++}`, type, color, name });
        }
    };
    addCards('organ', 'red', 'Corazón', 5);
    addCards('organ', 'green', 'Estómago', 5);
    addCards('organ', 'blue', 'Cerebro', 5);
    addCards('organ', 'yellow', 'Huesos', 5);
    addCards('organ', 'multicolor', 'Órgano Comodín', 1);
    addCards('virus', 'red', 'Virus Rojo', 4);
    addCards('virus', 'green', 'Virus Verde', 4);
    addCards('virus', 'blue', 'Virus Azul', 4);
    addCards('virus', 'yellow', 'Virus Amarillo', 4);
    addCards('virus', 'multicolor', 'Virus Comodín', 1);
    addCards('medicine', 'red', 'Medicina Roja', 4);
    addCards('medicine', 'green', 'Medicina Verde', 4);
    addCards('medicine', 'blue', 'Medicina Azul', 4);
    addCards('medicine', 'yellow', 'Medicina Amarilla', 4);
    addCards('medicine', 'multicolor', 'Medicina Comodín', 4);
    addCards('special', 'multicolor', 'Transplante', 2);
    addCards('special', 'multicolor', 'Ladrón de órganos', 2);
    addCards('special', 'multicolor', 'Contagio', 2);
    addCards('special', 'multicolor', 'Error médico', 2);
    addCards('special', 'multicolor', 'Guante de látex', 2);
    addCards('special', 'multicolor', 'Vacuna', 2);
    const finalDeck = deck.map(c => {
        if (c.name === 'Transplante')
            c.description = 'Intercambia un órgano por otro entre dos jugadores cualesquiera. No importa el color o si están infectados o vacunados. Prohibido trasplantar órganos inmunizados.';
        if (c.name === 'Ladrón de órganos')
            c.description = 'Roba un órgano cualquiera al cuerpo de otro jugador y añádelo al tuyo.';
        if (c.name === 'Contagio')
            c.description = 'Traslada todos los virus que puedas de tus órganos a los de otros jugadores. Sólo a órganos libres (sin virus ni medicinas).';
        if (c.name === 'Guante de látex')
            c.description = 'Todos los demás jugadores descartan su mano completa.';
        if (c.name === 'Error médico')
            c.description = 'Intercambia todo tu cuerpo (órganos, virus y medicinas) con el de otro jugador.';
        return c;
    });
    return (0, exports.shuffle)(finalDeck);
};
exports.createDeck = createDeck;
const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
exports.shuffle = shuffle;
const initGame = (playerNames) => {
    const deck = (0, exports.createDeck)();
    const players = playerNames.map((name, index) => ({
        id: `p${index}`,
        name,
        hand: [],
        organs: []
    }));
    // Initial draw: 3 cards each
    for (let i = 0; i < 3; i++) {
        players.forEach(p => {
            const card = deck.pop();
            if (card)
                p.hand.push(card);
        });
    }
    return {
        players,
        currentPlayerIndex: 0,
        deck,
        discardPile: [],
        winner: null,
        logs: ['¡El juego ha comenzado!'],
        needsDrawing: false
    };
};
exports.initGame = initGame;
/**
 * Authoritative validation for playing a card.
 * @param actingPlayerId The ID of the player attempting the action. Required for ownership and turn validation.
 */
const canPlayCard = (gameState, card, actingPlayerId, targetPlayerId, targetOrganId, targetPlayerId2, targetOrganId2) => {
    if (gameState.needsDrawing)
        return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    // 1. Turn Validation (if actingPlayerId provided)
    if (actingPlayerId && currentPlayer.id !== actingPlayerId)
        return false;
    // 2. Ownership Validation (if actingPlayerId provided)
    if (actingPlayerId) {
        const hasCard = currentPlayer.hand.some(c => c.id === card.id);
        if (!hasCard)
            return false;
    }
    // 3. Organ Placement
    if (card.type === 'organ' || (card.type === 'special' && card.name === 'Órgano artificial')) {
        const colorToMatch = card.name === 'Órgano artificial' ? 'multicolor' : card.color;
        const hasColor = currentPlayer.organs.some(o => o.organCard.color === colorToMatch);
        if (hasColor)
            return false;
        if (currentPlayer.organs.length >= 4)
            return false;
        return true;
    }
    // 4. Virus Attack
    if (card.type === 'virus') {
        if (targetPlayerId === undefined || targetOrganId === undefined)
            return false;
        const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
        if (!targetPlayer || targetPlayer.id === currentPlayer.id)
            return false; // Can't attack self
        const targetOrgan = targetPlayer.organs.find(o => o.id === targetOrganId);
        if (!targetOrgan || targetOrgan.isImmune)
            return false;
        const colorMatch = card.color === 'multicolor' || targetOrgan.organCard.color === 'multicolor' || card.color === targetOrgan.organCard.color;
        if (!colorMatch)
            return false;
        if (targetOrgan.virus.length >= 2)
            return false;
        return true;
    }
    // 5. Medicine / Protection
    if (card.type === 'medicine') {
        if (targetPlayerId === undefined || targetOrganId === undefined)
            return false;
        const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
        if (!targetPlayer || targetPlayer.id !== currentPlayer.id)
            return false; // Can only heal self
        const targetOrgan = targetPlayer.organs.find(o => o.id === targetOrganId);
        if (!targetOrgan || targetOrgan.isImmune)
            return false;
        const colorMatch = card.color === 'multicolor' || targetOrgan.organCard.color === 'multicolor' || card.color === targetOrgan.organCard.color;
        if (!colorMatch)
            return false;
        return true;
    }
    // 6. Special Cards
    if (card.type === 'special') {
        if (card.name === 'Guante de látex')
            return true;
        if (card.name === 'Contagio') {
            // Must have at least one virus to spread
            return currentPlayer.organs.some(o => o.virus.length > 0);
        }
        if (card.name === 'Error médico') {
            if (targetPlayerId === undefined)
                return false;
            if (targetPlayerId === currentPlayer.id)
                return false;
            return true;
        }
        if (card.name === 'Transplante') {
            if (targetPlayerId === undefined || targetOrganId === undefined || targetPlayerId2 === undefined || targetOrganId2 === undefined)
                return false;
            const p1 = gameState.players.find(p => p.id === targetPlayerId);
            const p2 = gameState.players.find(p => p.id === targetPlayerId2);
            if (!p1 || !p2)
                return false;
            const o1 = p1.organs.find(o => o.id === targetOrganId);
            const o2 = p2.organs.find(o => o.id === targetOrganId2);
            if (!o1 || !o2 || o1.isImmune || o2.isImmune)
                return false;
            // Check if swap would result in duplicate colors for either player
            const p1OrgansAfter = p1.organs.filter(o => o.id !== targetOrganId).concat(o2);
            const p2OrgansAfter = p2.organs.filter(o => o.id !== targetOrganId2).concat(o1);
            const hasDuplicate = (organs) => {
                const colors = organs.map(o => o.organCard.color);
                return new Set(colors).size !== colors.length;
            };
            if (hasDuplicate(p1OrgansAfter) || hasDuplicate(p2OrgansAfter))
                return false;
            return true;
        }
        if (card.name === 'Ladrón de órganos') {
            if (targetPlayerId === undefined || targetOrganId === undefined)
                return false;
            const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
            if (!targetPlayer || targetPlayer.id === currentPlayer.id)
                return false;
            const targetOrgan = targetPlayer.organs.find(o => o.id === targetOrganId);
            if (!targetOrgan || targetOrgan.isImmune)
                return false;
            if (currentPlayer.organs.some(o => o.organCard.color === targetOrgan.organCard.color))
                return false;
            return true;
        }
        if (card.name === 'Vacuna') {
            if (targetPlayerId === undefined || targetOrganId === undefined)
                return false;
            const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
            if (!targetPlayer || targetPlayer.id !== currentPlayer.id)
                return false;
            const targetOrgan = targetPlayer.organs.find(o => o.id === targetOrganId);
            if (!targetOrgan || targetOrgan.isImmune)
                return false;
            return true;
        }
        return true;
    }
    return false;
};
exports.canPlayCard = canPlayCard;
const drawCard = (state) => {
    const newState = JSON.parse(JSON.stringify(state));
    const currentPlayer = newState.players[newState.currentPlayerIndex];
    while (currentPlayer.hand.length < 3) {
        if (newState.deck.length === 0) {
            if (newState.discardPile.length === 0)
                break;
            newState.deck = (0, exports.shuffle)(newState.discardPile);
            newState.discardPile = [];
            newState.logs.unshift('El mazo se ha agotado. Barajando...');
        }
        currentPlayer.hand.push(newState.deck.pop());
    }
    newState.needsDrawing = false;
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
    // AUTO-RECOVERY: If next player has less than 3 cards, draw automatically
    const nextPlayer = newState.players[newState.currentPlayerIndex];
    if (nextPlayer.hand.length < 3) {
        newState.logs.unshift(`${nextPlayer.name} roba cartas automáticamente para recuperar su mano.`);
        while (nextPlayer.hand.length < 3) {
            if (newState.deck.length === 0) {
                if (newState.discardPile.length === 0)
                    break;
                newState.deck = (0, exports.shuffle)(newState.discardPile);
                newState.discardPile = [];
            }
            nextPlayer.hand.push(newState.deck.pop());
        }
    }
    return newState;
};
exports.drawCard = drawCard;
// Cross-platform compatible random ID generator
const generateId = (prefix) => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};
const playCard = (state, cardId, targetPlayerId, targetOrganId, targetPlayerId2, targetOrganId2) => {
    const newState = JSON.parse(JSON.stringify(state));
    const currentPlayer = newState.players[newState.currentPlayerIndex];
    const cardIndex = currentPlayer.hand.findIndex(c => c.id === cardId);
    const card = currentPlayer.hand[cardIndex];
    if (!card)
        return state;
    currentPlayer.hand.splice(cardIndex, 1);
    let staysOnBoard = false;
    if (card.type === 'organ' || (card.type === 'special' && card.name === 'Órgano artificial')) {
        newState.players[newState.currentPlayerIndex].organs.push({
            id: generateId('organ'),
            organCard: card,
            virus: [],
            medicines: [],
            isImmune: false
        });
        newState.logs.unshift(`${currentPlayer.name} bajó un ${card.name}`);
        staysOnBoard = true;
    }
    else if (card.type === 'virus') {
        const targetPlayer = newState.players.find(p => p.id === targetPlayerId);
        if (targetPlayer && targetOrganId !== undefined) {
            const organIndex = targetPlayer.organs.findIndex(o => o.id === targetOrganId);
            const organ = targetPlayer.organs[organIndex];
            if (organ && organ.medicines.length > 0) {
                const cured = organ.medicines.pop();
                if (cured)
                    newState.discardPile.push(cured);
                newState.discardPile.push(card);
                newState.logs.unshift(`${currentPlayer.name} infectó medicina de ${targetPlayer.name}`);
            }
            else if (organ) {
                organ.virus.push(card);
                newState.logs.unshift(`${currentPlayer.name} infectó a ${targetPlayer.name}`);
                if (organ.virus.length >= 2) {
                    newState.discardPile.push(organ.organCard);
                    organ.virus.forEach(v => newState.discardPile.push(v));
                    targetPlayer.organs.splice(organIndex, 1);
                    newState.logs.unshift(`¡Órgano de ${targetPlayer.name} destruido!`);
                }
                else {
                    staysOnBoard = true;
                }
            }
        }
    }
    else if (card.type === 'medicine') {
        const targetPlayer = newState.players.find(p => p.id === targetPlayerId);
        if (targetPlayer && targetOrganId !== undefined) {
            const organ = targetPlayer.organs.find(o => o.id === targetOrganId);
            if (organ && organ.virus.length > 0) {
                const cured = organ.virus.pop();
                if (cured)
                    newState.discardPile.push(cured);
                newState.discardPile.push(card);
                newState.logs.unshift(`${currentPlayer.name} curó virus`);
            }
            else if (organ) {
                organ.medicines.push(card);
                newState.logs.unshift(`${currentPlayer.name} puso medicina`);
                if (organ.medicines.length >= 2) {
                    organ.isImmune = true;
                    newState.logs.unshift(`¡Órgano INMUNE!`);
                }
                else {
                    staysOnBoard = true;
                }
            }
        }
    }
    else if (card.type === 'special') {
        if (card.name === 'Guante de látex') {
            newState.players.forEach(p => {
                if (p.id !== currentPlayer.id) {
                    p.hand.forEach(c => newState.discardPile.push(c));
                    p.hand = [];
                }
            });
            newState.logs.unshift(`¡Guante de látex! Todos descartan su mano`);
        }
        else if (card.name === 'Error médico') {
            const targetPlayer = newState.players.find(p => p.id === targetPlayerId);
            if (targetPlayer) {
                const temp = currentPlayer.organs;
                currentPlayer.organs = targetPlayer.organs;
                targetPlayer.organs = temp;
                newState.logs.unshift(`¡Error Médico! ${currentPlayer.name} cambió cuerpo con ${targetPlayer.name}`);
            }
        }
        else if (card.name === 'Transplante') {
            const p1 = newState.players.find(p => p.id === targetPlayerId);
            const p2 = newState.players.find(p => p.id === targetPlayerId2);
            if (p1 && p2 && targetOrganId && targetOrganId2) {
                const idx1 = p1.organs.findIndex(o => o.id === targetOrganId);
                const idx2 = p2.organs.findIndex(o => o.id === targetOrganId2);
                const o1 = p1.organs[idx1];
                const o2 = p2.organs[idx2];
                p1.organs[idx1] = o2;
                p2.organs[idx2] = o1;
                newState.logs.unshift(`¡Transplante! ${p1.name} y ${p2.name} intercambiaron órganos`);
            }
        }
        else if (card.name === 'Ladrón de órganos') {
            const victim = newState.players.find(p => p.id === targetPlayerId);
            if (victim && targetOrganId !== undefined) {
                const organIndex = victim.organs.findIndex(o => o.id === targetOrganId);
                const stolen = victim.organs.splice(organIndex, 1)[0];
                currentPlayer.organs.push(stolen);
                newState.logs.unshift(`${currentPlayer.name} robó órgano a ${victim.name}`);
            }
        }
        else if (card.name === 'Contagio') {
            const myViruses = [];
            currentPlayer.organs.forEach(o => {
                while (o.virus.length > 0)
                    myViruses.push(o.virus.pop());
            });
            myViruses.forEach(v => {
                let placed = false;
                for (let p of newState.players) {
                    if (p.id === currentPlayer.id)
                        continue;
                    for (let o of p.organs) {
                        if (!o.isImmune && (v.color === 'multicolor' || o.organCard.color === 'multicolor' || v.color === o.organCard.color) && o.virus.length === 0 && o.medicines.length === 0) {
                            o.virus.push(v);
                            placed = true;
                            break;
                        }
                    }
                    if (placed)
                        break;
                }
                if (!placed)
                    newState.discardPile.push(v);
            });
            newState.logs.unshift(`¡Contagio! ${currentPlayer.name} repartió sus virus`);
        }
        else if (card.name === 'Vacuna') {
            if (targetOrganId !== undefined) {
                const organ = currentPlayer.organs.find(o => o.id === targetOrganId);
                if (organ) {
                    organ.virus.forEach(v => newState.discardPile.push(v));
                    organ.virus = [];
                    organ.isImmune = true;
                    newState.logs.unshift(`${currentPlayer.name} usó Vacuna: Órgano curado e inmune`);
                }
            }
        }
        newState.discardPile.push(card);
    }
    if (!staysOnBoard && card.type !== 'special') {
        if (!newState.discardPile.some(c => c.id === card.id)) {
            newState.discardPile.push(card);
        }
    }
    if ((0, exports.checkWin)(currentPlayer)) {
        newState.winner = currentPlayer;
        newState.logs.unshift(`¡${currentPlayer.name} HA GANADO!`);
    }
    return (0, exports.endTurn)(newState);
};
exports.playCard = playCard;
const checkWin = (player) => {
    const healthyOrgans = player.organs.filter(o => o.virus.length === 0);
    const uniqueColors = new Set(healthyOrgans.map(o => o.organCard.color === 'multicolor' ? 'multicolor' : o.organCard.color));
    return uniqueColors.size >= 4;
};
exports.checkWin = checkWin;
const endTurn = (state) => {
    const newState = JSON.parse(JSON.stringify(state));
    newState.needsDrawing = true;
    return newState;
};
exports.endTurn = endTurn;
const discardCards = (state, cardIds) => {
    const newState = JSON.parse(JSON.stringify(state));
    const currentPlayer = newState.players[newState.currentPlayerIndex];
    cardIds.forEach(id => {
        const index = currentPlayer.hand.findIndex(c => id === c.id);
        if (index !== -1) {
            const card = currentPlayer.hand.splice(index, 1)[0];
            newState.discardPile.push(card);
        }
    });
    newState.logs.unshift(`${currentPlayer.name} descartó ${cardIds.length} carta(s)`);
    return (0, exports.endTurn)(newState);
};
exports.discardCards = discardCards;
