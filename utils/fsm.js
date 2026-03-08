const state = new Map();

function setState(userId, newState) {
  state.set(userId, newState);
}

function getState(userId) {
  return state.get(userId);
}

function clearState(userId) {
  state.delete(userId);
}

module.exports = {
  setState,
  getState,
  clearState,
};
