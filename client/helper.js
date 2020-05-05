import {Point} from './models';

export const findXandY = (x, y) => new Point(Math.floor(x), Math.floor(y));
export const rng = num => Math.floor(Math.random() * num)

