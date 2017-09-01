// This is a direct copy of the migrations folder from geniblocks, for now. If
// this becomes a hassle, we should consider adding the geniblocks project as a
// dependency and importing it directly.

import v02 from './02_convert_gems_to_array';

const migrations = [
  v02
];

export const currentStateVersion = 2;

export default function migrate(state) {
  if (!state) {
    return;
  }

  if (!state.stateVersion) {
    // previously we were not saving stateVersion in the state itself,
    // so those versions count as v 1.
    state.stateVersion = 1;
  }
  migrations.forEach((update) => {
    state = update(state);
  });
  return state;
}
