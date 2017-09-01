const version = 2;

export default function update(state) {
  if (state.stateVersion < version) {
    state.stateVersion = version;
    return doUpdate(state);
  }
  return state;
}

// Previously: each mission had one number representing the last gem awarded.
// Now: each mission has an array of all gems awarded for that mission.
function doUpdate(state) {
  if (state.gems) {
    state.gems.forEach((level, i) => {
      level.forEach((mission, j) => {
        mission.forEach((gem, k) => {
          if (!isNaN(gem)) {
            state.gems[i][j][k] = [gem];
          }
        });
      });
    });
  }
  return state;
}
