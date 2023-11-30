# BPMN to Lucid converter

This is heavily a work in progress, the main idea is to have a cli application that takes a dir or an xml/bpmn file
and makes a request to to the Lucid public API to create a dirgram.

But we need to transform XML/BPMN into something Lucidchart understands, hence this is called a converter 

The idea is that one file will result in one lucidchart document

## Schemas 

The directory called schemas shows what each implemented shape should look like 

## Things that are implemented
- Recursively read directories
- Read Files
- Transform XML/BPMN into JSON
- Parse start, intermediate throw, intermediate catch, boundery and end events
- Recursively parse tasks (sen, receive, user, manual, business, service, script), subProcesses, adHocSubProcesses, transactions and callActivities
- Parse event, parallel, inclusive and complex gateways 
- Parse data objects
- Parse data stores
- Parse groups
- Schema representation for all the mplemented shapes
- Authentication
- Request to Lucid API

## Things that are yet to be implemented
- Choreographies are half way there, get_lane_coount and orientation are missing
- Conversation, this one is kinda weird, someone that understands BPMN could probably implement it in one second
- Pool
- Pool black box
- Text Annotation
- Lines
