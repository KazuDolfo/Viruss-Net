import { initGame, reduceGameState } from './src/engine';
import { GameState, Card } from './src/models';

const p1Id = 'player-1';
const p2Id = 'player-2';

const createCard = (type: any, color: any, name: string): Card => ({
  id: `test-${name}-${Math.random()}`,
  type,
  color,
  name
});

function runTests() {
  console.log('Running Card Functionality Tests...');

  let state = initGame([
    { id: p1Id, name: 'Player 1' },
    { id: p2Id, name: 'Player 2' }
  ]);
  (state.players[0] as any).hand = [];
  (state.players[1] as any).hand = [];
  (state as any).currentPlayerIndex = 0;

  // 1. PLAY_ORGAN
  {
    const card = createCard('organ', 'red', 'Corazón');
    (state.players[0].hand as any).push(card);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: { type: 'PLAY_ORGAN', cardId: card.id }
    });
    if (newState.players[0].body.length === 1 && newState.players[0].body[0].organCard.color === 'red') {
      console.log('✅ PLAY_ORGAN: Success');
    } else {
      console.error('❌ PLAY_ORGAN: Failed');
    }
  }

  // 2. PLAY_VIRUS
  {
    const organCard = createCard('organ', 'red', 'Corazón');
    (state.players[1].body as any).push({
      id: 'target-organ',
      organCard,
      viruses: [],
      medicines: [],
      isImmune: false
    });
    const virusCard = createCard('virus', 'red', 'Virus Rojo');
    (state.players[0].hand as any).push(virusCard);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: {
        type: 'PLAY_VIRUS',
        cardId: virusCard.id,
        target: { playerId: p2Id, organId: 'target-organ' }
      }
    });
    if (newState.players[1].body[0].viruses.length === 1) {
      console.log('✅ PLAY_VIRUS: Success');
    } else {
      console.error('❌ PLAY_VIRUS: Failed');
    }
  }

  // 3. PLAY_MEDICINE
  {
    const organCard = createCard('organ', 'blue', 'Cerebro');
    (state.players[0].body as any).push({
      id: 'my-organ',
      organCard,
      viruses: [],
      medicines: [],
      isImmune: false
    });
    const medCard = createCard('medicine', 'blue', 'Medicina Azul');
    (state.players[0].hand as any).push(medCard);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: {
        type: 'PLAY_MEDICINE',
        cardId: medCard.id,
        target: { playerId: p1Id, organId: 'my-organ' }
      }
    });
    if (newState.players[0].body.find(o => o.id === 'my-organ')?.medicines.length === 1) {
      console.log('✅ PLAY_MEDICINE: Success');
    } else {
      console.error('❌ PLAY_MEDICINE: Failed');
    }
  }

  // 4. TRANSPLANTE
  {
    const o1 = createCard('organ', 'red', 'Corazón');
    const o2 = createCard('organ', 'blue', 'Cerebro');
    (state.players[0].body as any).push({ id: 'o1', organCard: o1, viruses: [], medicines: [], isImmune: false });
    (state.players[1].body as any).push({ id: 'o2', organCard: o2, viruses: [], medicines: [], isImmune: false });
    const treatment = createCard('treatment', 'wildcard', 'Transplante');
    (state.players[0].hand as any).push(treatment);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: {
        type: 'PLAY_TREATMENT',
        cardId: treatment.id,
        targets: [
          { playerId: p1Id, organId: 'o1' },
          { playerId: p2Id, organId: 'o2' }
        ]
      }
    });
    if (newState.players[0].body.some(o => o.organCard.color === 'blue') && newState.players[1].body.some(o => o.organCard.color === 'red')) {
      console.log('✅ TREATMENT (Transplante): Success');
    } else {
      console.error('❌ TREATMENT (Transplante): Failed');
    }
  }

  // 5. LADRON DE ORGANOS
  {
    const o2 = createCard('organ', 'yellow', 'Hueso');
    (state.players[1].body as any).push({ id: 'o-yellow', organCard: o2, viruses: [], medicines: [], isImmune: false });
    const treatment = createCard('treatment', 'wildcard', 'Ladrón de órganos');
    // Ensure card name matches exactly with special characters or whatever engine expects
    (treatment as any).name = 'LadrÃ³n de Ã³rganos'; 
    (state.players[0].hand as any).push(treatment);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: {
        type: 'PLAY_TREATMENT',
        cardId: treatment.id,
        targets: [{ playerId: p2Id, organId: 'o-yellow' }]
      }
    });
    if (newState.players[0].body.some(o => o.organCard.color === 'yellow') && !newState.players[1].body.some(o => o.organCard.color === 'yellow')) {
      console.log('✅ TREATMENT (Ladrón): Success');
    } else {
      console.error('❌ TREATMENT (Ladrón): Failed');
    }
  }

  // 6. CONTAGIO
  {
    const v1 = createCard('virus', 'green', 'Virus');
    const p1o1 = createCard('organ', 'green', 'Estómago');
    (state.players[0].body as any).push({ id: 'p1o-green', organCard: p1o1, viruses: [v1], medicines: [], isImmune: false });
    const p2o1 = createCard('organ', 'green', 'Estómago');
    (state.players[1].body as any).push({ id: 'p2o-green', organCard: p2o1, viruses: [], medicines: [], isImmune: false });
    const treatment = createCard('treatment', 'wildcard', 'Contagio');
    (state.players[0].hand as any).push(treatment);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: {
        type: 'PLAY_TREATMENT',
        cardId: treatment.id,
        targets: []
      }
    });
    const p1HasVirus = newState.players[0].body.find(o => o.id === 'p1o-green')?.viruses.length! > 0;
    const p2HasVirus = newState.players[1].body.find(o => o.id === 'p2o-green')?.viruses.length! > 0;
    if (!p1HasVirus && p2HasVirus) {
      console.log('✅ TREATMENT (Contagio): Success');
    } else {
      console.error('❌ TREATMENT (Contagio): Failed');
    }
  }

  // 7. GUANTE DE LATEX
  {
    const dummyCard = createCard('organ', 'red', 'C');
    (state.players[1].hand as any).push(dummyCard);
    const treatment = createCard('treatment', 'wildcard', 'Guante de látex');
    (treatment as any).name = 'Guante de lÃ¡tex';
    (state.players[0].hand as any).push(treatment);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: {
        type: 'PLAY_TREATMENT',
        cardId: treatment.id,
        targets: []
      }
    });
    if (newState.discardPile.some(c => c.id === dummyCard.id)) {
      console.log('✅ TREATMENT (Guante): Success');
    } else {
      console.error('❌ TREATMENT (Guante): Failed');
    }
  }

  // 8. ERROR MEDICO
  {
    const o1 = createCard('organ', 'red', 'Corazón');
    const o2 = createCard('organ', 'blue', 'Cerebro');
    (state.players[0].body as any).push({ id: 'err-o1', organCard: o1, viruses: [], medicines: [], isImmune: false });
    (state.players[1].body as any).push({ id: 'err-o2', organCard: o2, viruses: [], medicines: [], isImmune: false });
    const treatment = createCard('treatment', 'wildcard', 'Error médico');
    (treatment as any).name = 'Error mÃ©dico';
    (state.players[0].hand as any).push(treatment);
    const newState = reduceGameState(state, {
      playerId: p1Id,
      action: {
        type: 'PLAY_TREATMENT',
        cardId: treatment.id,
        targets: [{ playerId: p2Id }]
      }
    });
    const p1HasBlue = newState.players[0].body.some(o => o.organCard.color === 'blue');
    const p2HasRed = newState.players[1].body.some(o => o.organCard.color === 'red');
    if (p1HasBlue && p2HasRed) {
      console.log('✅ TREATMENT (Error Médico): Success');
    } else {
      console.error('❌ TREATMENT (Error Médico): Failed');
    }
  }

  console.log('Tests Completed.');
}

runTests();
