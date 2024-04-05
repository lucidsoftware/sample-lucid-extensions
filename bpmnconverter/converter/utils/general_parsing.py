def get_base_shape_and_bb(shape: dict, bpmn_shapes: dict):
    # add try catch 
    id = shape['@id']
    lucid_shape = {
        'id': id
    }
    if '@name' in shape:
        lucid_shape['text'] = shape['@name']
    elif 'text' in shape:
<<<<<<< HEAD
        text = shape['text']
        if text:
            if 'font-size: small' in text:
                text = text.replace('font-size: small', 'font-size: 3 px')
            elif 'font-size: medium' in text:
                text = text.replace('font-size: medium', 'font-size: 5 px')
            elif 'font-size: large' in text:
                text = text.replace('font-size: large', 'font-size: 7 px')
            elif 'font-size: x-large' in text:
                text = text.replace('font-size: x-large', 'font-size: 9 px')
            elif 'font-size: xx-large' in text:
                text = text.replace('font-size: xx-large', 'font-size: 11 px')
        lucid_shape['text'] = text
=======
        lucid_shape['text'] = shape['text']
>>>>>>> f15d905893e362c8661c9eaca64c8c780430a061
    if id in bpmn_shapes:
        shape_description = bpmn_shapes[id]
        shape_bb ={}
        if 'omgdc:Bounds' in shape_description:
            shape_bb = shape_description['omgdc:Bounds']
        elif 'dc:Bounds' in shape_description:
            shape_bb = shape_description['dc:Bounds']
        elif 'Bounds' in shape_description:
            shape_bb = shape_description['Bounds']
        lucid_shape['boundingBox'] = {
            'x': float(shape_bb['@x']),
            'y': float(shape_bb['@y']),
            'w': float(shape_bb['@width']),
<<<<<<< HEAD
            'h': float(shape_bb['@height'])
=======
            'h': float(shape_bb['@height']),
>>>>>>> f15d905893e362c8661c9eaca64c8c780430a061
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
    
