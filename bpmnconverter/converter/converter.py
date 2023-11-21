import argparse
import json
from utils.bpmn_to_object import object_from_bpmn

if __name__ == '__main__':
    #TODO: Add description
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--Input", help = "File or  directory to read from, uses ./ if not specified")

    args = parser.parse_args() 

    input = args.Input if isinstance(args.Input, str) else './'

    objects = object_from_bpmn(args.Input)

    print(json.dumps(objects))