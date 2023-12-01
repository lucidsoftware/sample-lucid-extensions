import json

def parse_lines(lines: list, bpmn_shapes: dict):
    lucid_lines = []
    if isinstance(lines, list):
        print("got here")
        for line in lines:
            lucid_lines.append(process_line(line))
    else:
        lucid_lines.append(process_line(lines))

    return lucid_lines



def process_line(line):
    id = line['@id']
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

    if '@sourceRef' in line:
        endpoint1 = {
            'type': 'shapeEndpoint',
            'style': 'none',
            'shapeId': line['@sourceRef'],
            'position': {'x': 1, 'y': 0.5}
        }
        lucid_line['endpoint1'] = endpoint1
    else:
        print('The line ' + json.dumps(lucid_line) + ' does not follow BPMN standards and so has not been included.')
        print("failing 1")

    if '@targetRef' in line:
        endpoint2 = {
            'type': 'shapeEndpoint',
            'style': 'arrow',
            'shapeId': line['@targetRef'],
            'position': {'x': 0, 'y': 0.5}
        }
        lucid_line['endpoint2'] = endpoint2
    else:
        print('The line ' + json.dumps(lucid_line) + ' does not follow BPMN standards and so has not been included.')
        print("failing 2")
    return lucid_line
    
