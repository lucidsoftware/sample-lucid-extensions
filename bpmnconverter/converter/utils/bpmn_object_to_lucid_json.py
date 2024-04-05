from typing import Dict, Any
from utils.group_utils import parse_groups
from utils.data_objects_utils import data_associations_by_reference, parse_data_objects, parse_data_stores
from utils.gateways_util import parse_gateways
from utils.activities_utils import parse_ad_hoc_sub_process, parse_call_activities, parse_sub_process, parse_tasks, parse_transactions
from utils.event_utils import parse_boundary_events, parse_end_events, parse_intermediate_catch_events, parse_intermediate_throw_events, parse_start_events
from utils.line_utils import parse_lines, process_edges
from utils.lane_utils import parse_lanes
from utils.annotation_utils import parse_text_annotations
from utils.namespace_utils import remove_namespace_prefixes

def get_lines_in_process(process: dict, bpmn_edges: list, lucid_shapes: list):
    lucid_lines = []
    if 'sequenceFlow' in process:
        lucid_lines += parse_lines(process['sequenceFlow'], bpmn_edges, lucid_shapes)
    return lucid_lines

def get_shapes_in_process(process: dict, bpmn_shapes: dict):
    keys = process.keys()
    data_associations =  data_associations_by_reference(process)
    lucid_shapes = []
    for key in keys:
        entry = process[key] if isinstance(process[key], list) else [process[key]]
        if key == 'startEvent':
            lucid_shapes += parse_start_events(entry, bpmn_shapes)
        elif key =='intermediateThrowEvent':
            lucid_shapes += parse_intermediate_throw_events(entry, bpmn_shapes)
        elif key =='intermediateCatchEvent':
            lucid_shapes += parse_intermediate_catch_events(entry, bpmn_shapes)
        elif key == 'boundaryEvent':
            lucid_shapes += parse_boundary_events(entry, bpmn_shapes)
        elif key == 'endEvent':
            lucid_shapes += parse_end_events(entry, bpmn_shapes)
        elif key == 'task': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'none')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'sendTask': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'send')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'receiveTask': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'receive')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'userTask': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'user')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'manualTask': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'manual')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'businessRuleTask': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'businessRule')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'serviceTask': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'service')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'scriptTask': 
            lucid_shapes += parse_tasks(entry, bpmn_shapes, 'script')
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'subProcess': 
            lucid_shapes += parse_sub_process(entry, bpmn_shapes)
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'adHocSubProcess': 
            lucid_shapes += parse_ad_hoc_sub_process(entry, bpmn_shapes)
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'transaction': 
            lucid_shapes += parse_transactions(entry, bpmn_shapes)
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'callActivity':
            lucid_shapes += parse_call_activities(entry, bpmn_shapes)
            lucid_shapes += parse_processes_list(entry, bpmn_shapes)
        elif key == 'exclusiveGateway':
            lucid_shapes += parse_gateways(entry, bpmn_shapes, 'exclusive')
        elif key == 'eventBasedGateway':
            lucid_shapes += parse_gateways(entry, bpmn_shapes, 'eventBased')
        elif key == 'parallelGateway':
            lucid_shapes += parse_gateways(entry, bpmn_shapes, 'parallel')
        elif key == 'inclusiveGateway':
            lucid_shapes += parse_gateways(entry, bpmn_shapes, 'inclusive')
        elif key == 'complexGateway':
            lucid_shapes += parse_gateways(entry, bpmn_shapes, 'complex')
        #TODO: Figure out the BPMN 2.0 standard for 'exclusiveEventBased' and 'parallelEventBased'
        elif key == 'dataObject':
            lucid_shapes += parse_data_objects(entry, bpmn_shapes, data_associations)
        elif key == 'dataStoreReference':
            lucid_shapes += parse_data_stores(entry, bpmn_shapes)
        elif key == 'group':
            lucid_shapes += parse_groups(entry, bpmn_shapes)
        elif key == 'laneSet':
            lucid_shapes += parse_lanes(entry, bpmn_shapes)
        elif key == 'textAnnotation':
            lucid_shapes += parse_text_annotations(entry, bpmn_shapes)
    return lucid_shapes

def parse_processes_list(processes: list, bpmn_shapes: dict):
    lucid_shapes = []
    for process in processes:
        lucid_shapes += get_shapes_in_process(process, bpmn_shapes)
    return lucid_shapes

def parse_processes_lines_list(processes: list, bpmn_edges: list, lucid_shapes: list):
    lucid_lines = []
    for process in processes:
        lucid_lines += get_lines_in_process(process, bpmn_edges, lucid_shapes)
    return lucid_lines

def get_bpmn_planes(diagrams):
    planes = []
    for diagram in diagrams: 
        raw_planes = {}
        if 'bpmndi:BPMNPlane' in diagram:
            raw_planes = diagram['bpmndi:BPMNPlane'] 
        elif 'BPMNPlane' in diagram:
            raw_planes = diagram['BPMNPlane']
        planes += [raw_planes] if not isinstance(raw_planes, list) else raw_planes
    return planes

def get_bpmn_shapes(planes, key: str):
    entries = []
    for plane in planes:
        if key in plane:
            shapes = plane[key]
            shapes_as_list = [shapes] if not isinstance(shapes, list) else shapes
            entries += shapes_as_list

    entries_dir = {}

    for entry in entries:
        entries_dir[entry['@bpmnElement']] = entry
    return entries_dir

def get_lucid_json(bpmn: Dict[str, Any]):
    #add try catch
    doc_name = (bpmn['file_name'].rsplit('.', 1)[0]).rsplit('/', 1)[-1]
    bpmn_doc = bpmn['data']
    lucid_doc = {
        'title': doc_name,
        'version':1, 
        'pages': [
            {
                "id": "page1",
                "title": doc_name,
                "shapes": [],
                "lines": [],
                "groups": [],
                "layers": []
            }
        ]
    }
    removedPrefixes = False
    if 'definitions' not in bpmn_doc:
        bpmn_doc = remove_namespace_prefixes(bpmn_doc)
        removedPrefixes = True

    if 'definitions' in bpmn_doc:
        definitions =  bpmn_doc['definitions']  
        processes = definitions['process']
        processes_as_list = [processes] if not isinstance(processes, list) else processes
        diagrams = {}
        if 'bpmndi:BPMNDiagram' in definitions:
            diagrams = definitions['bpmndi:BPMNDiagram']
        elif 'BPMNDiagram' in definitions:
            diagrams = definitions['BPMNDiagram']
        diagrams_as_list = [diagrams] if not isinstance(diagrams, list) else diagrams
        planes =  get_bpmn_planes(diagrams_as_list)
        if removedPrefixes:
            shapes_dir = get_bpmn_shapes(planes, 'BPMNShape')
        else:
            shapes_dir = get_bpmn_shapes(planes, 'bpmndi:BPMNShape')

        bpmn_edges = process_edges(planes)

        lucid_shapes  = parse_processes_list(processes_as_list, shapes_dir)
        lucid_lines = parse_processes_lines_list(processes_as_list, bpmn_edges, lucid_shapes)

        #TODO: Finish
        if 'choreography' in definitions:
            choreographies = definitions['choreography']
            choreographies_as_list = choreographies if isinstance(choreographies, list) else [choreographies]
        
        lucid_doc['pages'][0]['shapes'] = lucid_shapes
        lucid_doc['pages'][0]['lines'] = lucid_lines

        return lucid_doc
    else:
        print(f'Error parsing {doc_name}')
        return None
    


def parse_object(bpmn_object: Dict[str, Any]):
    if bpmn_object['type'] == 'file':
        lucid_json = get_lucid_json(bpmn_object)
        return [lucid_json] if lucid_json != None else []
    else:
        docs = []
        for entry in bpmn_object['data']:
            docs += parse_object(entry)
        return docs


def transform_object_into_lucid_json(bpmn_object: Dict[str, Any]):
    print("Transforming data into Lucid JSON")
    return parse_object(bpmn_object)
