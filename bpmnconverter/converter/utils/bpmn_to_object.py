from xml.dom import minidom
import xmltodict
import os

def convert_file_to_object(file_name: str):
    print(f"Reading file {file_name}")
    converted_data = {
        'type': 'file',
        'file_name': file_name,
        'data': None
    }
    if file_name.endswith('.xml') or file_name.endswith('.bpmn'):
        data = None
        with open(file_name) as bpmn_file:
            data = xmltodict.parse(bpmn_file.read())
        converted_data['data'] = data
    else:
        print(f"Failed to parse {file_name}, skipping")
    return converted_data


def extract_dir_and_convert(dir_name: str):
    print(f"Reading dir {dir_name}")
    dir_contents = os.listdir(dir_name)
    converted_data_list = {
        'type': 'dir', 
        'dir_name': dir_name,
        'data': None
    }
    data = []
    for entry in dir_contents:
        data.append(object_from_bpmn(dir_name + '/' +entry))
    converted_data_list['data']=data

    return converted_data_list


def object_from_bpmn(input: str):
    if os.path.isfile(input):
        return convert_file_to_object(input)
    elif os.path.isdir(input):
        return extract_dir_and_convert(input)
    else:
        print(f"Failed to parse {input}, skipping")
        return None