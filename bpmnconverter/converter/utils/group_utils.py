from utils.general_parsing import get_base_shape_and_bb

def parse_groups(groups: list, bpmn_shapes: dict):
    lucid_shapes = []
    if isinstance(groups, list):
        for group in groups:
            lucid_shape = get_base_shape_and_bb(group, bpmn_shapes)
            if lucid_shape != None:
                lucid_shape['type'] = 'bpmnGroup'
                lucid_shapes.append(lucid_shape)
            else:
                continue
    else:
        lucid_shape = get_base_shape_and_bb(groups, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnGroup'
            lucid_shapes.append(lucid_shape)
    
    return lucid_shapes
