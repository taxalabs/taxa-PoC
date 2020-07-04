import { INIT_DB } from '../types';

export function db(state = { loaded: false }, action) {
  switch(action.type) {
    case INIT_DB:
      return {
        ...action.orbitInstance,
        loaded: true
      };
    default:
      return state;
  }
}
