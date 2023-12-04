from utils.general_parsing import get_base_shape_and_bb
def parse_lanes(laneSets: dict, bpmn_shapes: dict):
    lucid_shapes = []
    if isinstance(laneSets, list):
        for laneSet in laneSets:
            lanes = laneSet['lane']
            if isinstance(lanes, list):
                for lane in lanes:
                    bpmnPool = get_base_shape_and_bb(lane, bpmn_shapes)
                    bpmnPool['title'] = bpmnPool.pop('text')
                    bpmnPool['type'] = 'bpmnPool'
                    lucid_shapes += get_pool_details(bpmnPool, lane, bpmn_shapes)
            else:
                bpmnPool = get_base_shape_and_bb(lanes, bpmn_shapes)
                bpmnPool['title'] = bpmnPool.pop('text')
                bpmnPool['type'] = 'bpmnPool'
                lucid_shapes += get_pool_details(bpmnPool, lanes, bpmn_shapes)
    else:
        lanes = laneSets['lane']
        if isinstance(lanes, list):
            for lane in lanes:
                bpmnPool = get_base_shape_and_bb(lane, bpmn_shapes)
                bpmnPool['title'] = bpmnPool.pop('text')
                bpmnPool['type'] = 'bpmnPool'
                lucid_shapes += get_pool_details(bpmnPool, lane, bpmn_shapes)
        else:
            bpmnPool = get_base_shape_and_bb(lanes, bpmn_shapes)
            bpmnPool['title'] = bpmnPool.pop('text')
            bpmnPool['type'] = 'bpmnPool'
            lucid_shapes += get_pool_details(bpmnPool, lanes, bpmn_shapes)
    return lucid_shapes

def get_pool_details(bpmnPool: dict, lane: dict, bpmn_shapes: dict):
    lucid_shapes = []
    bpmnPool, orientation = get_pool_orientation(bpmnPool, bpmn_shapes)
    bpmnPool['lanes'] = []
    bpmnPool['magnetize'] = False
    childLaneSet = lane.get('childLaneSet')
    childLanes = childLaneSet['lane']
    if isinstance(childLanes, list):
        for childLane in childLanes:
            bpmnPool['lanes'].append(get_pool_lane_resource(childLane, bpmn_shapes, orientation))
            if childLane.get('childLaneSet'):
                laneSet= {
                            'lane': childLane
                }
                lucid_shapes += parse_lanes(laneSet, bpmn_shapes)
                    
    else:
        bpmnPool['lanes'].append(get_pool_lane_resource(childLanes, bpmn_shapes, orientation))
        if childLanes.get('childLaneSet'):
            laneSet = {
                        'lane': childLane
            }
            lucid_shapes += parse_lanes(laneSet, bpmn_shapes)
    lucid_shapes.append(bpmnPool)
    return lucid_shapes

def get_pool_lane_resource(lane, bpmn_shapes, orientation):
    id = lane['@id']
    pool_lane = {}
    pool_lane['laneFill'] = '#FFFFFF00'
    if '@name' in lane:
        pool_lane['title'] = lane['@name']
    else:
        pool_lane['title'] = ''
    if id in bpmn_shapes:
        lane_description = bpmn_shapes[id]
        lane_bb = {}
        if 'omgdc:Bounds' in lane_description:
            lane_bb = lane_description['omgdc:Bounds']
        elif 'dc:Bounds' in lane_description:
            lane_bb = lane_description['dc:Bounds']
        if orientation == 'horizontal':
            pool_lane['width'] = float(lane_bb['@height'])
        elif orientation == 'vertical': 
            pool_lane['width'] = float(lane_bb['@width'])
    return pool_lane
    

def get_pool_orientation(bpmnPool: dict, bpmn_shapes: dict):
    rawPool = bpmn_shapes[bpmnPool['id']]
    orientation = 'vertical'
    if (rawPool['@isHorizontal'] == "true"):
        bpmnPool['vertical'] = False
        bpmnPool['verticalLaneText'] = True
        orientation = 'horizontal'
    return bpmnPool, orientation

