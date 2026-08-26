import { ConnectionPath, type CanvasConnection } from '../../features/canvas/element';
import { type ElementState } from '../../features/canvas/runtime/element';
import { type ConnectionState } from '../../types';

import {
  updateConnectionsAfterIndividualMove,
  updateConnectionsAfterGroupMove,
  type CoordinateCalculator,
} from './connectionMovementUtils';

const createConnection = (overrides?: Partial<CanvasConnection>): CanvasConnection => ({
  source: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  path: ConnectionPath.Straight,
  targetName: 'target',
  ...overrides,
});

const createMockElement = (name: string, connections?: CanvasConnection[]): ElementState => {
  const mockDiv = document.createElement('div');

  return {
    getName: jest.fn(() => name),
    div: mockDiv,
    options: {
      name,
      type: 'test-element',
      connections: connections || [],
    },
  } as unknown as ElementState;
};

const mockCalculateCoords: CoordinateCalculator = () => ({
  x1: 100,
  y1: 100,
  x2: 200,
  y2: 200,
});

describe('connectionMovementUtils', () => {
  describe('updateConnectionsAfterIndividualMove', () => {
    it('should update source coordinates when source element is moved', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      updateConnectionsAfterIndividualMove(sourceElement, connectionStates, mockCalculateCoords);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 100, y: 100 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 150, y: 150 });
    });

    it('should update target coordinates when target element is moved', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      updateConnectionsAfterIndividualMove(targetElement, connectionStates, mockCalculateCoords);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 50, y: 50 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 200, y: 200 });
    });

    it('should recalculate vertices when element is moved', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 100, y: 100 },
          targetOriginal: { x: 150, y: 150 },
          vertices: [{ x: 0.5, y: 0.5 }],
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 100, y: 100 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      updateConnectionsAfterIndividualMove(targetElement, connectionStates, mockCalculateCoords);

      const vertex = sourceElement.options?.connections?.[0].vertices?.[0];
      expect(vertex).toBeDefined();
      expect(vertex?.x).toBeCloseTo(0.25, 5);
      expect(vertex?.y).toBeCloseTo(0.25, 5);
    });

    it('should handle connections without vertices', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      expect(() => {
        updateConnectionsAfterIndividualMove(sourceElement, connectionStates, mockCalculateCoords);
      }).not.toThrow();

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 100, y: 100 });
    });

    it('should handle division by zero in vertex calculation', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 100, y: 100 },
          targetOriginal: { x: 100, y: 100 },
          vertices: [{ x: 0.5, y: 0.5 }],
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 100, y: 100 },
          targetOriginal: { x: 100, y: 100 },
        },
      ];

      expect(() => {
        updateConnectionsAfterIndividualMove(sourceElement, connectionStates, mockCalculateCoords);
      }).not.toThrow();
    });

    it('should skip connections where moved element is neither source nor target', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');
      const otherElement = createMockElement('other');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      updateConnectionsAfterIndividualMove(otherElement, connectionStates, mockCalculateCoords);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 50, y: 50 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 150, y: 150 });
    });
  });

  describe('updateConnectionsAfterGroupMove', () => {
    it('should update both coordinates when both source and target are selected', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      const selectedTargets = [sourceElement.div!, targetElement.div!];
      const movedElements = [sourceElement, targetElement];

      updateConnectionsAfterGroupMove(movedElements, selectedTargets, connectionStates, mockCalculateCoords);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 100, y: 100 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 200, y: 200 });
    });

    it('should not update when only source is selected', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      const selectedTargets = [sourceElement.div!];
      const movedElements = [sourceElement];

      updateConnectionsAfterGroupMove(movedElements, selectedTargets, connectionStates, mockCalculateCoords);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 50, y: 50 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 150, y: 150 });
    });

    it('should not update when only target is selected', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      const selectedTargets = [targetElement.div!];
      const movedElements = [targetElement];

      updateConnectionsAfterGroupMove(movedElements, selectedTargets, connectionStates, mockCalculateCoords);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 50, y: 50 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 150, y: 150 });
    });

    it('should handle multiple connections with selective updates', () => {
      const element1 = createMockElement('element1', [
        createConnection({
          targetName: 'element2',
          sourceOriginal: { x: 10, y: 10 },
          targetOriginal: { x: 20, y: 20 },
        }),
        createConnection({
          targetName: 'element3',
          sourceOriginal: { x: 30, y: 30 },
          targetOriginal: { x: 40, y: 40 },
        }),
      ]);
      const element2 = createMockElement('element2');
      const element3 = createMockElement('element3');

      const connectionStates: ConnectionState[] = [
        {
          source: element1,
          target: element2,
          info: createConnection({ targetName: 'element2' }),
          index: 0,
          sourceOriginal: { x: 10, y: 10 },
          targetOriginal: { x: 20, y: 20 },
        },
        {
          source: element1,
          target: element3,
          info: createConnection({ targetName: 'element3' }),
          index: 1,
          sourceOriginal: { x: 30, y: 30 },
          targetOriginal: { x: 40, y: 40 },
        },
      ];

      const selectedTargets = [element1.div!, element2.div!];
      const movedElements = [element1, element2];

      updateConnectionsAfterGroupMove(movedElements, selectedTargets, connectionStates, mockCalculateCoords);

      expect(element1.options?.connections?.[0].sourceOriginal).toEqual({ x: 100, y: 100 });
      expect(element1.options?.connections?.[0].targetOriginal).toEqual({ x: 200, y: 200 });

      expect(element1.options?.connections?.[1].sourceOriginal).toEqual({ x: 30, y: 30 });
      expect(element1.options?.connections?.[1].targetOriginal).toEqual({ x: 40, y: 40 });
    });

    it('should handle empty selection', () => {
      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      const connectionStates: ConnectionState[] = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      updateConnectionsAfterGroupMove([], [], connectionStates, mockCalculateCoords);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 50, y: 50 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 150, y: 150 });
    });
  });
});
