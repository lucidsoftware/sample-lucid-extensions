from typing import Dict
from utils.general_parsing import get_base_shape_and_bb

def parse_data_stores(data_references: list, bpmn_shapes: dict):
    lucid_shapes = []
    for data_reference in data_references:
        lucid_shape = get_base_shape_and_bb(data_reference, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnDataStore'
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def get_data_type(data_object: dict, associations: Dict[str, set]):
    if '@isCollection' in data_object and data_object['@isCollection'] == 'true':
        return 'collection'
    elif data_object["@id"] in associations['inputs']:
        return 'input'
    elif data_object["@id"] in associations['outputs']:
        return 'output'
    else:
        return 'none'

def data_associations_by_reference(process: dict):
    keys = process.keys()
    input_associations = set()
    output_associations = set()
    for key in keys:
        if key == 'dataInputAssociation':
            inputs = process['dataInputAssociation']
            inputs_as_list = inputs if isinstance(inputs, list) else [inputs]
            for input in inputs_as_list:
                input_associations.add(input['sourceRef'])
        elif key == 'dataOutputAssociation':
            outputs = process['dataOutputAssociation']
            ouputs_as_list = outputs if isinstance(outputs, list) else [outputs]
            for output in ouputs_as_list:
                output_associations.add(output['targetRef'])
    return {'inputs': input_associations, 'outputs': output_associations}

def parse_data_objects(data_objects: list, bpmn_shapes: dict, associations:  Dict[str, set]):
    lucid_shapes = []
    for data_object in data_objects:
        lucid_shape = get_base_shape_and_bb(data_object, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnDataObject'
            lucid_shape['dataType'] = get_data_type(data_object, associations)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes