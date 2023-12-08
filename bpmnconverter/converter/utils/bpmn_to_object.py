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

    if converted_data['data'] == None: 
        return None
    return converted_data


def extract_dir_and_convert(dir_name: str, recursive: bool):
    print(f"Reading dir {dir_name}")
    dir_contents = os.listdir(dir_name)
    converted_data_list = {
        'type': 'dir', 
        'dir_name': dir_name,
        'data': None
    }
    data = []
    for entry in dir_contents:
        path = dir_name + '/' + entry
        if recursive:
            parsed_object = object_from_bpmn(path,recursive)
            if parsed_object != None:
                data.append(parsed_object)
        else:
            if os.path.isfile(path):
                parsed_object = convert_file_to_object(path)
                if parsed_object != None:
                    data.append(parsed_object)
    converted_data_list['data']=data

    return converted_data_list


def object_from_bpmn(source: str, recursive: bool):
    if os.path.isfile(source):
        return convert_file_to_object(source)
    elif os.path.isdir(source):
        return extract_dir_and_convert(source, recursive)
    else:
        print(f"Failed to parse {source}, skipping")
        return None
    