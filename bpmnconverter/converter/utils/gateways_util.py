from utils.general_parsing import get_base_shape_and_bb

def parse_gateways(gateways: list, bpmn_shapes: dict, gateway_type: str):
    lucid_shapes = []
    for gateway in gateways:
        lucid_shape = get_base_shape_and_bb(gateway, bpmn_shapes)
        if lucid_shape != None:
            lucid_shape['type'] = "bpmnGateway"
            lucid_shape['gatewayType'] = gateway_type
            lucid_shapes.append(lucid_shape)
        else:
            continue
    
    return lucid_shapes