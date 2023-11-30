import requests
import shutil
import json
import os

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

def uploadDoc(standard_doc, access_token):
    doc_name = standard_doc.get('title')
    print("Uploading doc {0}".format(doc_name))
    os.mkdir(doc_name)
    lucid_file = doc_name + '.lucid'

    with open(doc_name + '/' + 'document.json', 'w') as f:
        json.dump(standard_doc, f)
    
    shutil.make_archive(doc_name, 'zip', doc_name)
    shutil.move(doc_name + '.zip', lucid_file)

    upload_url = "https://api.lucid.co/documents"
    headers = {"Authorization": "Bearer {0}".format(access_token), "Lucid-Api-Version": "1"}
    body = {"title": doc_name, "product": "lucidchart"}
    files = {"file": (lucid_file, open(lucid_file, "rb"), "x-application/vnd.lucid.standardImport")}
    upload_response = requests.post("https://api.lucid.co/documents", headers=headers, data=body, files=files)
    os.remove(lucid_file) # remove .lucid zip file
    shutil.rmtree(doc_name) # remove dir

    print(upload_response.content)

    return upload_response
