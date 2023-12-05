from utils.general_parsing import get_base_shape_and_bb

def parse_text_annotations(annotations: list, bpmn_shapes: dict):
    lucid_shapes = []
    for annotation in annotations:
        lucid_shape = get_base_shape_and_bb(annotation, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnTextAnnotation'
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes
