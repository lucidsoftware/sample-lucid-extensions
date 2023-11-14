from xml.dom import minidom
import xmltodict
import os
import json

filelist = [file for file in os.listdir('.') if file.endswith('.xml')]

for igxmlfile in filelist:

    docname = igxmlfile.rsplit('.', 1)
    json_file = docname + ".json"
    mydoc = minidom.parse(igxmlfile)

    docdata = None
    with open(igxmlfile) as fd:
        docdata = xmltodict.parse(fd.read())

    with open(json_file, "w") as outfile:
        json.dump(docdata, outfile)
        print("converted {0}.".format(igxmlfile))
