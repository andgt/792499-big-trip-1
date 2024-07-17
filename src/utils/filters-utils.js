import {FilterType} from './../const.js';
import {isFuture, isPresent, isPast} from './../utils/points.js';

const filters = {
  [FilterType.EVERYTHING]: (points) => [...points],
  [FilterType.FUTURE]: (points) => points.filter((point) => isFuture(point)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPresent(point)),
  [FilterType.PAST]: (points) => points.filter((point) => isPast(point)),
};

export {filters};
