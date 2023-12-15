# BPMN to Lucid Converter

This is heavily a work in progress. The main idea is to have a CLI application that takes a directory or an XML/BPMN file and makes a request to the Lucid public API to create a diagram.

But we need to transform XML/BPMN into something Lucidchart understands; hence, this is called a converter.

The idea is that one file will result in one Lucidchart document.

## Schemas

The directory called "schemas" shows what each implemented shape should look like.

## Things that are implemented
- Recursively read directories
- Read files
- Transform XML/BPMN into JSON
- Parse start, intermediate throw, intermediate catch, boundary, and end events
- Recursively parse tasks (send, receive, user, manual, business, service, script), subProcesses, adHocSubProcesses, transactions, and callActivities
- Parse event, parallel, inclusive, and complex gateways
- Parse data objects
- Parse data stores
- Parse groups
- Schema representation for all the implemented shapes
- Authentication
- Request to Lucid API
- Lines
- Pool
- Text Annotation

## Things that are yet to be implemented
- Choreographies are halfway there; get_lane_count and orientation are missing.
- Conversation; this one is kind of weird. Someone that understands BPMN could probably implement it in one second.
- Pool black box
