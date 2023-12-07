from utils.general_parsing import get_base_shape_and_bb

def get_activity_marker_from_activity(activity: dict):
    markers = []
    if 'standardLoopCharacteristics' in activity:
        markers.append('loop')
    elif 'multiInstanceLoopCharacteristics' in activity:
        mi = activity['multiInstanceLoopCharacteristics']
        if mi != None:
            if '@isSequential' in mi and mi['@isSequential'] == "true":
                markers.append('sequentialMI')
        markers.append('parallelMI')
    if 'bpmn:compensateEventDefinition' in activity:
        markers.append('compensation')
    return markers
    
def attach_markers(lucid_shape, markers: list):
    length = len(markers)
    if length >= 1:
        lucid_shape['activityMarker1'] = markers[0]
    if length >=2: 
        lucid_shape['activityMarker2'] = markers[1]

def parse_call_activities(activities: list, bpmn_shapes: dict):
    lucid_shapes = []
    for activity in activities:
        lucid_shape = get_base_shape_and_bb(activity, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnActivity'
            lucid_shape['activityType'] = 'callActivity'
            lucid_shape['taskType'] = 'none'
            markers =  get_activity_marker_from_activity(activity)
            attach_markers(lucid_shape, markers)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_transactions(transactions: list, bpmn_shapes: dict):
    lucid_shapes = []
    for transaction in transactions:
        lucid_shape = get_base_shape_and_bb(transaction, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnActivity'
            lucid_shape['activityType'] = 'transaction'
            lucid_shape['taskType'] = 'none'
            markers =  get_activity_marker_from_activity(transaction)
            attach_markers(lucid_shape, markers)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_ad_hoc_sub_process(tasks: list, bpmn_shapes: dict):
    lucid_shapes = []
    for task in tasks:
        lucid_shape = get_base_shape_and_bb(task, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnActivity'
            lucid_shape['activityType'] = 'task'
            lucid_shape['taskType'] = 'none'
            markers =  ['subProcess', 'adhoc']
            attach_markers(lucid_shape, markers)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_sub_process(tasks: list, bpmn_shapes: dict):
    lucid_shapes = []
    for task in tasks:
        lucid_shape = get_base_shape_and_bb(task, bpmn_shapes)
        if lucid_shape != None:
            if '@triggeredByEvent' in task and task['@triggeredByEvent'] == "true":
                lucid_shape['type'] = 'bpmnActivity'
                lucid_shape['activityType'] = 'eventSubProcess'
                lucid_shape['taskType'] = 'none'
                markers =  ['subProcess']
                attach_markers(lucid_shape, markers)
                lucid_shapes.append(lucid_shape)
            else:
                lucid_shape['type'] = 'bpmnActivity'
                lucid_shape['activityType'] = 'task'
                lucid_shape['taskType'] = 'none'
                markers =  ['subProcess']+ get_activity_marker_from_activity(task)
                attach_markers(lucid_shape, markers)
                lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes

def parse_tasks(tasks: list, bpmn_shapes: dict, task_type: str):
    lucid_shapes = []
    for task in tasks:
        lucid_shape = get_base_shape_and_bb(task, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = 'bpmnActivity'
            lucid_shape['activityType'] = 'task'
            lucid_shape['taskType'] = task_type
            markers =  get_activity_marker_from_activity(task)
            attach_markers(lucid_shape, markers)
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes
