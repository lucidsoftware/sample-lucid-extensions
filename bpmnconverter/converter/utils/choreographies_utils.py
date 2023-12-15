from bpmnconverter.converter.utils.general_parsing import get_base_shape_and_bb

#TODO: Finish
def parse_choreographies(choreographies: list, bpmn_shapes: dict, task_type: str):
    lucid_shapes = []
    for choreography in choreographies:
        keys = choreography.keys()
        for key in keys:
            entries = choreography[key]
            entries_as_list = entries if isinstance(entries, list) else [entries]
            
            choreographyType = ''
            if key == 'choreographyTask':
                choreographyType = 'task'
            elif key =='subChoreography':
                choreographyType = 'subChoreography'
            elif key == 'callChoreography':
                choreographyType = 'call'
        else:
            continue
    
    return lucid_shapes