import { convertMapDataToFrontendFormat, formatCoordinatesFromNodes, reconcilePipelineSegmentLengths } from '../util';
import { reconcilePipelineOutgoingNodes } from '../pipeline';
import type { MapData, MapEditorNode } from '../types';

test('legacy maps without arc geometry display their facilities without changing source data', () => {
  const map: MapData = {
    all_nodes: {P1: {node_type: 'ProductionPad', coordinates: ['-103', '34']}},
    connections: {all_connections: {P1: ['K1']}},
  };
  const before = JSON.stringify(map);
  const [nodes, lines, center] = convertMapDataToFrontendFormat(map);
  expect(nodes).toEqual([expect.objectContaining({name: 'P1', nodeType: 'ProductionPad', coordinates: [-103, 34]})]);
  expect(lines).toEqual([]);
  expect(center).toEqual([34, -103]);
  expect(JSON.stringify(map)).toBe(before);
});

test('imported bends remain visible and measured lengths survive appending a connection', () => {
  const nodes: MapEditorNode['nodes'] = [{name: 'A', coordinates: [-103, 34], segment_coordinates: [[-103,34],[-102.5,34.2],[-102,34]]},
    {name: 'B', coordinates: [-102, 34]}];
  expect(formatCoordinatesFromNodes(nodes)).toEqual([[34,-103],[34.2,-102.5],[34,-102]]);
  const lengths = reconcilePipelineSegmentLengths([...nodes, {name: 'C', coordinates: [-101,34]}], nodes, [123]);
  expect(lengths[0]).toBe(123);
  expect(lengths[1]).toBeGreaterThan(0);
  const moved = reconcilePipelineOutgoingNodes([nodes[0], {...nodes[1], coordinates: [-101, 34]}], nodes);
  expect(moved[0].segment_coordinates).toBeUndefined();
  expect(formatCoordinatesFromNodes(moved)).toEqual([[34, -103], [34, -101]]);
});
