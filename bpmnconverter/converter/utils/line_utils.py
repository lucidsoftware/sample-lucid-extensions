import json

def parse_lines(lines: list, bpmn_edges: list, lucid_shapes: list):
    lucid_lines = []
    if isinstance(lines, list):
        for line in lines:
            lucid_line = process_line(line, bpmn_edges, lucid_shapes)
            if lucid_line:
                lucid_lines.append(lucid_line)

    elif isinstance(lines, dict):
        lucid_line = process_line(lines, bpmn_edges, lucid_shapes)
        if lucid_line:
            lucid_lines.append(lucid_line)

    return lucid_lines

def process_edges(bpmn_planes: list):
    bpmn_edges = []
    for plane in bpmn_planes:
        if 'bpmndi:BPMNEdge' in plane:
            bpmn_edges += plane['bpmndi:BPMNEdge']
        elif 'BPMNEdge' in plane:
            bpmn_edges += plane['BPMNEdge']

    return bpmn_edges

def getShapes(lucid_shapes: list, sourceId: str, targetId: str):
    sourceShape = {}
    sourceGathered = False
    targetShape = {}
    targetGathered = False
    for shape in lucid_shapes:
        if shape['id'] == sourceId:
            sourceShape = shape
            sourceGathered = True

        if shape['id'] == targetId:
            targetShape = shape
            targetGathered = True

        if sourceGathered and targetGathered:
            break

    return sourceShape, targetShape

def getEdge(edges: list, edgeId: str):
    targetEdge = {}
    for edge in edges:
        if isinstance(edge, dict):
            if edge['@bpmnElement'] == edgeId:
                targetEdge = edge
                break

    return targetEdge

def get_bounding_box_coordinates(shape: dict):
    
    x = shape['boundingBox']['x']
    y = shape['boundingBox']['y']
    w = shape['boundingBox']['w']
    h = shape['boundingBox']['h']
    
    # Calculate the right and bottom coordinates based on x, y, width, and height
    x_max = x + w
    y_max = y + h
        
    return x, y, x_max, y_max

def normalize_coordinates(x, y, x_min, y_min, x_max, y_max):
    # Calculate the relative values
    relative_x = (x - x_min) / (x_max - x_min)
    relative_y = (y - y_min) / (y_max - y_min)

    return relative_x, relative_y

def getPosition(shape: dict, waypoint: dict):
    x_min, y_min, x_max, y_max = get_bounding_box_coordinates(shape)
    x = float(waypoint['@x'])
    y = float(waypoint['@y'])
    position_x, position_y = normalize_coordinates(x, y, x_min, y_min, x_max, y_max)
    position = {}
    if (0 <= position_x <= 1) and (0 <= position_y <= 1):
        position = {
            'x': position_x,
            'y': position_y
        }
    else:
        position = {
            'x': 1,
            'y': 0.5
        }
    return position

def process_line(line: dict, bpmn_edges: list, lucid_shapes: list):
    id = line['@id']
    sourceId = line['@sourceRef']
    targetId = line['@targetRef']
    sourceShape, targetShape = getShapes(lucid_shapes, sourceId, targetId)
    
    edge = getEdge(bpmn_edges, id)
    waypoints = []
    if 'omgdi:waypoint' in edge:
        waypoints = edge['omgdi:waypoint']
    elif 'di:waypoint' in edge:
        waypoints = edge['di:waypoint']
    elif 'waypoint' in edge:
        waypoints = edge['waypoint']
    else:
        return None

    lucid_line = {
        'id': id,
        'lineType': 'elbow'
    }

    if '@name' in line:
        text = [
            {
                'text': line['@name'],
                'position': 0.5,
                'side': "middle"
            }
        ]
        lucid_line['text'] = text
    if 'boundingBox' in sourceShape:
        position1 = getPosition(sourceShape, waypoints[0])
        endpoint1 = {
            'type': 'shapeEndpoint',
            'style': 'none',
            'shapeId': sourceId,
            'position': position1
        }
        lucid_line['endpoint1'] = endpoint1
    else:
        x1 = float(waypoints[0]['@x'])
        y1 = float(waypoints[0]['@y'])
        endpoint1 = {
            'type': 'positionEndpoint',
            'style': 'none',
            'position': {'x': x1, 'y': y1}
        }
        lucid_line['endpoint1'] = endpoint1

    if 'boundingBox' in targetShape:
        position2 = getPosition(targetShape, waypoints[-1])
        endpoint2 = {
            'type': 'shapeEndpoint',
            'style': 'arrow',
            'shapeId': targetId,
            'position': position2
        }
        lucid_line['endpoint2'] = endpoint2
    else:
        x2 = float(waypoints[-1]['@x'])
        y2 = float(waypoints[-1]['@y'])
        endpoint2 = {
            'type': 'positionEndpoint',
            'style': 'none',
            'position': {'x': x2, 'y': y2}
        }
        lucid_line['endpoint2'] = endpoint2



    return lucid_line
    
