import { calculateAngle, calculateDistance, calculateMidpoint } from './utils';

describe('utils geometry helpers', () => {
  describe('calculateMidpoint', () => {
    const testCases = [
      { name: 'should return the midpoint of two distinct points', args: [0, 0, 10, 20], expected: { x: 5, y: 10 } },
      { name: 'should return the same point when both points are equal', args: [3, 4, 3, 4], expected: { x: 3, y: 4 } },
      { name: 'should handle negative coordinates', args: [-4, -2, 4, 2], expected: { x: 0, y: 0 } },
    ];

    testCases.forEach(({ name, args, expected }) => {
      it(name, () => {
        const [x1, y1, x2, y2] = args;
        expect(calculateMidpoint(x1, y1, x2, y2)).toEqual(expected);
      });
    });
  });

  describe('calculateDistance', () => {
    const testCases = [
      { name: 'should return 0 for identical points', args: [1, 1, 1, 1], expected: 0 },
      { name: 'should measure a horizontal distance', args: [0, 0, 5, 0], expected: 5 },
      { name: 'should measure a 3-4-5 right triangle hypotenuse', args: [0, 0, 3, 4], expected: 5 },
    ];

    testCases.forEach(({ name, args, expected }) => {
      it(name, () => {
        const [x1, y1, x2, y2] = args;
        expect(calculateDistance(x1, y1, x2, y2)).toBeCloseTo(expected);
      });
    });
  });

  describe('calculateAngle', () => {
    const testCases = [
      { name: 'should return 0 radians for a point due east', args: [0, 0, 1, 0], expected: 0 },
      { name: 'should return PI/2 radians for a point due north', args: [0, 0, 0, 1], expected: Math.PI / 2 },
      { name: 'should return PI radians for a point due west', args: [0, 0, -1, 0], expected: Math.PI },
    ];

    testCases.forEach(({ name, args, expected }) => {
      it(name, () => {
        const [x1, y1, x2, y2] = args;
        expect(calculateAngle(x1, y1, x2, y2)).toBeCloseTo(expected);
      });
    });
  });
});
