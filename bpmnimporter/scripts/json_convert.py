from xml.dom import minidom
import xmltodict
import os
import json
from datetime import datetime

filelist = [file for file in os.listdir('.') if file.endswith('.xml')]

for igxmlfile in filelist:

    filesize = len(igxmlfile)
    docname = igxmlfile[:filesize - 4]
    json_file = docname + ".json"
    mydoc = minidom.parse(igxmlfile)

    docdata = None
    with open(igxmlfile) as fd:
        docdata = xmltodict.parse(fd.read())

    with open(json_file, "w") as outfile:
        json.dump(docdata, outfile)
        print("converted {0}.".format(igxmlfile))
