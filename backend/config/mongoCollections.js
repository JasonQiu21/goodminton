import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    if(_col === "sessions") await _col.createIndex({createdAt: 1}, {expireAfterSeconds: 60 * 60})

    return _col;
  };
};

// Note: You will need to change the code below to have the collection required by the assignment!
export const events = getCollectionFn('events');
export const players = getCollectionFn('players');
export const sessions = getCollectionFn('sessions');
