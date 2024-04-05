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
<<<<<<< HEAD

            #get_lane_count(entry)
            #lucid_shape = get_base_shape_and_bb(entry, bpmn_shapes)

            #if lucid_shape != None:
                #lucid_shape['choreographyType'] = choreographyType
                #lucid_shapes.append(lucid_shape)
=======
>>>>>>> f15d905893e362c8661c9eaca64c8c780430a061
        else:
            continue
    
    return lucid_shapes