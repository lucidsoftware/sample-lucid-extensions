
from utils.general_parsing import get_base_shape_and_bb

def get_event_type_from_event(event: dict):
    if 'messageEventDefinition' in event: 
        return 'message'
    elif 'timerEventDefinition' in event:
        return 'timer'
    elif 'escalationEventDefinition' in event: 
        return 'escalation'
    elif 'conditionalEventDefinition' in event:
        return 'conditional'
    elif 'linkEventDefinition' in event:
        return 'link'
    elif 'errorEventDefinition' in event:
        return 'error'
    elif 'cancelEventDefinition' in event:
        return 'cancel'
    elif 'compensateEventDefinition' in event:
        return 'compensation'
    elif 'signalEventDefinition' in event: 
        return 'signal'
    elif 'multipleEventDefinition' in event: 
        return 'multiple'
    elif 'parallelMultipleEventDefinition' in event: 
        return 'parallelMultiple'
    elif 'terminateEventDefinition' in event: 
        return 'terminate'
    else:
        return 'none'

def is_non_interrupting(event: dict):
    if '@cancelActivity' in event and event['@cancelActivity'] == 'false':
        return True
    else:
        return False

def parse_boundary_events(events: list, bpmn_shapes: dict):
    lucid_shapes = []
    for event in events:
        lucid_shape = get_base_shape_and_bb(event, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnEvent'
            lucid_shape['eventGroup'] = 'intermediate'
            lucid_shape['throwing'] = False
            lucid_shape['nonInterrupting'] = is_non_interrupting(event)
            lucid_shape['eventType'] = get_event_type_from_event(event)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_intermediate_throw_events(events: list, bpmn_shapes: dict):
    lucid_shapes = []
    for event in events:
        lucid_shape = get_base_shape_and_bb(event, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnEvent'
            lucid_shape['eventGroup'] = 'intermediate'
            lucid_shape['throwing'] = True
            lucid_shape['nonInterrupting'] = is_non_interrupting(event)
            lucid_shape['eventType'] = get_event_type_from_event(event)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_intermediate_catch_events(events: list, bpmn_shapes: dict):
    lucid_shapes = []
    for event in events:
        lucid_shape = get_base_shape_and_bb(event, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnEvent'
            lucid_shape['eventGroup'] = 'intermediate'
            lucid_shape['throwing'] = False
            lucid_shape['nonInterrupting'] = is_non_interrupting(event)
            lucid_shape['eventType'] = get_event_type_from_event(event)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_end_events(events: list, bpmn_shapes: dict):
    lucid_shapes = []
    for event in events:
        lucid_shape = get_base_shape_and_bb(event, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnEvent'
            lucid_shape['eventGroup'] = 'end'
            lucid_shape['throwing'] = False
            lucid_shape['nonInterrupting'] = is_non_interrupting(event)
            lucid_shape['eventType'] = get_event_type_from_event(event)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_start_events(events: list, bpmn_shapes: dict):
    lucid_shapes = []
    for event in events:
        lucid_shape = get_base_shape_and_bb(event, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnEvent'
            lucid_shape['eventGroup'] = 'start'
            lucid_shape['throwing'] = False
            lucid_shape['nonInterrupting'] = is_non_interrupting(event)
            lucid_shape['eventType'] = get_event_type_from_event(event)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes