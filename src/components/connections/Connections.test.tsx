import { ConnectionPath, type CanvasConnection } from '../../features/canvas/element';
import { type ElementState } from '../../features/canvas/runtime/element';
import { type Scene } from '../../features/canvas/runtime/scene';
import { type ConnectionState } from '../../types';

import { Connections } from './Connections';

jest.mock('../../utils', () => ({
  calculateCoordinates: jest.fn(() => ({
    x1: 100,
    y1: 100,
    x2: 200,
    y2: 200,
  })),
  getParentBoundingClientRect: jest.fn(() => ({
    left: 0,
    top: 0,
    width: 1000,
    height: 1000,
    right: 1000,
    bottom: 1000,
    x: 0,
    y: 0,
    toJSON: () => {},
  })),
  getConnections: jest.fn(() => []),
  updateConnectionsAfterIndividualMove: jest.requireActual('../../components/connections/connectionMovementUtils')
    .updateConnectionsAfterIndividualMove,
  updateConnectionsAfterGroupMove: jest.requireActual('../../components/connections/connectionMovementUtils')
    .updateConnectionsAfterGroupMove,
}));

const { calculateCoordinates } = jest.requireMock('../../utils');

const createConnection = (overrides?: Partial<CanvasConnection>): CanvasConnection => ({
  source: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  path: ConnectionPath.Straight,
  targetName: 'target',
  ...overrides,
});

const createMockElement = (name: string, connections?: CanvasConnection[]): ElementState => {
  const mockDiv = document.createElement('div');
  mockDiv.getBoundingClientRect = jest.fn(() => ({
    left: 100,
    top: 100,
    width: 50,
    height: 50,
    right: 150,
    bottom: 150,
    x: 100,
    y: 100,
    toJSON: () => {},
  }));

  const mockParent = document.createElement('div');
  Object.defineProperty(mockDiv, 'parentElement', {
    value: mockParent,
    configurable: true,
  });

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

const createMockScene = (): Scene =>
  ({
    byName: new Map(),
    scale: 1,
    div: document.createElement('div'),
    root: { elements: [] } as never,
    isEditingEnabled: true,
    selecto: null as never,
  }) as unknown as Scene;

describe('Connections', () => {
  describe('updateConnectionsAfterIndividualMove - integration', () => {
    it('should call calculateCoordinates when source element is moved', () => {
      const mockScene = createMockScene();
      const connectionsObj = new Connections(mockScene);

      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      connectionsObj.state = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      calculateCoordinates.mockClear();
      connectionsObj.updateConnectionsAfterIndividualMove(sourceElement);

      expect(calculateCoordinates).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        connectionsObj.state[0].info,
        targetElement,
        1
      );
    });

    it('should update coordinates through shared utility', () => {
      const mockScene = createMockScene();
      const connectionsObj = new Connections(mockScene);

      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      connectionsObj.state = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ];

      connectionsObj.updateConnectionsAfterIndividualMove(sourceElement);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 100, y: 100 });
    });
  });

  describe('updateConnectionsAfterGroupMove - integration', () => {
    it('should call calculateCoordinates when both elements are selected', () => {
      const mockScene = createMockScene();
      const connectionsObj = new Connections(mockScene);

      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      connectionsObj.state = [
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

      calculateCoordinates.mockClear();
      connectionsObj.updateConnectionsAfterGroupMove(movedElements, selectedTargets);

      expect(calculateCoordinates).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        connectionsObj.state[0].info,
        targetElement,
        1
      );
    });

    it('should update both coordinates through shared utility', () => {
      const mockScene = createMockScene();
      const connectionsObj = new Connections(mockScene);

      const sourceElement = createMockElement('source', [
        createConnection({
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        }),
      ]);
      const targetElement = createMockElement('target');

      connectionsObj.state = [
        {
          source: sourceElement,
          target: targetElement,
          info: createConnection(),
          index: 0,
          sourceOriginal: { x: 50, y: 50 },
          targetOriginal: { x: 150, y: 150 },
        },
      ] as ConnectionState[];

      const selectedTargets = [sourceElement.div!, targetElement.div!];
      const movedElements = [sourceElement, targetElement];

      connectionsObj.updateConnectionsAfterGroupMove(movedElements, selectedTargets);

      expect(sourceElement.options?.connections?.[0].sourceOriginal).toEqual({ x: 100, y: 100 });
      expect(sourceElement.options?.connections?.[0].targetOriginal).toEqual({ x: 200, y: 200 });
    });
  });
});
