from xml.dom import minidom
import xmltodict
import os
import json
import requests
import subprocess
import sys

downScale = 1
#--------------------------------------------------------------------------------------------------
#A simple method that scales numbers down based on the global downScale value
#--------------------------------------------------------------------------------------------------
def scale(intString):
    num = int(intString)
    num = num / downScale
    return(str(num))

#--------------------------------------------------------------------------------------------------
#A simple method that reads in each file to be read as a dictionary
#--------------------------------------------------------------------------------------------------
def readInFiles():
    print("Reading each BPMN file")
    filelist = [file for file in os.listdir('.') if file.endswith('.xml')]
    doclist = []
    for bpmnfile in filelist:

        filesize = len(bpmnfile)
        docname = bpmnfile[:filesize - 4]
    
        docdata = None
        with open(bpmnfile) as fd:
            docdata = xmltodict.parse(fd.read())
        docdata['name'] = docname
        doclist.append(docdata)
    return doclist

#--------------------------------------------------------------------------------------------------
#A method that takes the raw XML and converts it to JSON and makes it useable by Lucid
#--------------------------------------------------------------------------------------------------
def simplifyDocs(doclist):
    print("Simplifying the document data")
    lucidDocs = []
    for doc in doclist:
        simplifiedDoc = {}
        simplifiedDoc['shapes'] = {}
        simplifiedDoc['lines'] = {}
        diagram = doc.get('definitions').get('bpmndi:BPMNDiagram')
        process = doc.get('definitions').get('process')
        for shape in diagram.get('bpmndi:BPMNPlane').get('bpmndi:BPMNShape'): #TODO look at other info that might need to be pulled
            shape_id = shape.get('@bpmnElement')
            bounds = shape.get('dc:Bounds')
            simplifiedDoc.get('shapes')[shape_id] = {
                                                    'x': bounds.get('@x')
                                                    'y': bounds.get('@y')
                                                    'w': bounds.get('@width')
                                                    'h': bounds.get('@height')
                                                    'type': None
                                                    'shape_text' = None
                                                }
        if isinstance(process, list):
            for section in process:
                simplifiedDoc = simplifyProcess(section, simplifiedDoc)
        else:
            simplifiedDoc = simplifyProcess(process, simplifiedDoc)
        for flow in process.get('sequenceFlow'): #TODO add line points (optional)
            simplifiedDoc.get('lines')[flow.get('@id')] = {
                                                            'source': flow.get('@sourceRef'),
                                                            'target': flow.get('@targetRef')
                                                          }
        lucidDocs.append(convertBPMNDoc(simplifiedDoc))
    return lucidDocs

#--------------------------------------------------------------------------------------------------
#A method that adds the details of shapes based on what is located in each process/section
#--------------------------------------------------------------------------------------------------
def simplifyProcess(process, simplifiedDoc):
    #TODO parse the dictionary for the process that was passed in
    #Will need to check for list or dictionary and parse accordingly
    return simplifiedDoc

#--------------------------------------------------------------------------------------------------
#Method that uploads each BPMN Doc into Lucidchart
#--------------------------------------------------------------------------------------------------
def uploadDoc(bpmn_doc, access_token): #TODO update this method to upload each JSON instead of uploading each file
    print("Uploading doc {0}".format(bpmn_doc))
    upload_url = "https://api.lucid.co/documents"
    headers = {"Authorization": "Bearer {0}".format(access_token), "Lucid-Api-Version": "1"}
    name_size = len(bpmn_doc)
    doc_name = bpmn_doc[:name_size - 4]
    body = {"title": doc_name}
    files = {"file": (bpmn_doc, open(bpmn_doc, "rb"), "x-application/vnd.lucid.drawio")}
    return requests.post("https://api.lucid.co/documents", headers=headers, data=body, files=files)

#--------------------------------------------------------------------------------------------------
#Method that converts the bpmn file into a JSON file
#--------------------------------------------------------------------------------------------------
def convertBPMNDoc(bpmn):
    print(bpmn)
    return bpmn

#--------------------------------------------------------------------------------------------------
#Authentication process in Lucid
#--------------------------------------------------------------------------------------------------
def oauth():
    print("Authenticating in Lucidchart")

    authorize_url = "https://lucid.app/oauth2/authorize"
    token_url = "https://api.lucid.co/oauth2/token"

    #client (application) credentials
    client_id = input('Client ID Copied From Lucid: ')
    client_secret = input('Client Secret Copied From Lucid: ')

    #callback url specified when the application was defined
    callback_uri = "https://lucid.app/oauth2/clients/{0}/redirect".format(client_id)
    print("Please make sure that the following URL is an Authorized Redirect URI in Lucidchart: " + callback_uri)

    authorization_redirect_url = authorize_url + '?response_type=code&client_id=' + client_id + '&redirect_uri=' + callback_uri + '&scope=lucidchart.document.app'


    print("go to the following url on the browser and enter the code from the returned url: ")
    print("---\n" + authorization_redirect_url + "\n---")
    authorization_code = input('code: ')

    data = {'grant_type': 'authorization_code',
            'code': authorization_code,
            'client_secret': client_secret,
            'client_id': client_id,
            'redirect_uri': callback_uri}

    print("requesting access token")
    access_token_response = requests.post(token_url, json=data, verify=False, allow_redirects=False)

    # we can now use the access_token as much as we want to access protected resources.
    tokens = json.loads(access_token_response.text)
    access_token = tokens['access_token']
    print("access token: " + access_token)

    return access_token

if __name__ == '__main__':
    doc_list = readInFiles()
    simplified_docs = simplifyDocs(doc_list)
