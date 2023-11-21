def get_base_shape_and_bb(shape: dict, bpmn_shapes: dict):
    # add try catch 
    id = shape['@id']
    lucid_shape = {
        'id': id
    }
    if '@name' in shape:
        lucid_shape['text'] = shape['@name']
    if id in bpmn_shapes:
        shape_description = bpmn_shapes[id]
        shape_bb ={}
        if 'omgdc:Bounds' in shape_description:
            shape_bb = shape_description['omgdc:Bounds']
        elif 'dc:Bounds' in shape_description:
            shape_bb = shape_description['dc:Bounds']
        lucid_shape['boundingBox'] = {
            'x': shape_bb['@x'],
            'y': shape_bb['@y'],
            'w': shape_bb['@width'],
            'h': shape_bb['@height'],
        }
        lucid_shape['style'] = {}
        if '@bioc:stroke' in shape_description:
            lucid_shape['style']['stroke'] ={
                'color': shape_description['@bioc:stroke']
            }
        if '@bioc:fill' in shape_description:
            lucid_shape['style']['fill'] = {
                'type': 'color',
                'color': shape_description['@bioc:fill']
            }
        return lucid_shape
    else:
        print(f'Error parsing shape {id}')
        return None
    
