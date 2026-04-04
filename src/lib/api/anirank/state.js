import { HISTORY_LIMIT } from "./config";
import { getRandomItem } from "./utils";

export const QUESTION_CACHE = {
  anime: null,
  hanime: null,
  lastUpdated: { anime: 0, hanime: 0 },
};

export const RECENT_ITEMS = {
  genre: [],
  studio: [],
  year: [],
  decade: [],
  multiGenre: [],
};

export function updateHistory(type, value) {
  const history = RECENT_ITEMS[type];
  if (history) {
    history.unshift(value);
    if (history.length > HISTORY_LIMIT) {
      history.pop();
    }
  }
}

export function getRandomNonRecentItem(type, items) {
  const history = RECENT_ITEMS[type] || [];
  const nonRecentItems = items.filter((item) => !history.includes(item));

  if (nonRecentItems.length > 0) {
    return getRandomItem(nonRecentItems);
  }
  // If all items are "recent", just pick any random one to avoid getting stuck
  return getRandomItem(items);
}
