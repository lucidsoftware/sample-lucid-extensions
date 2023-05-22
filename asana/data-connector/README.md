# Asana Data Connector
This integration uses a data connector to fetch and update data from Asana. 
The data connector aslo defines how data will be represented when it gets added to Lucid documents.

You can read more about developing data connectors [here](https://developer.lucid.co/extension-api/#connecting-to-external-data).

## Folder / file structure
```
└── data-connector
    ├── actions
    ├── collections
    └── utils
```

`actions` contains the logic for all of the requests that are made to the data connector, in this case imports, patches (when data updates need to be sent to Asana), and hard refreshes (a process which aquires a fresh copy of external data when a Lucid document is opened).

`collections` defines the collections and data types that will be added to Lucid documents to store Asana data. This integration uses separate collections for projects, sections, tasks, and users.

`utils` contains helpers for converting between and Asana's representation of data and Lucid's representation of that same data.