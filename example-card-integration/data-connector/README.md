# Example Data Connector
This integration uses a data connector to fetch and update data from the mock data source. 
The data connector aslo defines how data will be represented when it gets added to Lucid documents.

You can read more about developing data connectors [here](https://developer.lucid.co/extension-api/#connecting-to-external-data).

## Folder / file structure
```
└── data-connector
    ├── actions
    ├── schema
```

`actions` contains the logic for all of the requests that are made to the data connector, in this case imports & patches (when data updates need to be sent to the external source)

`schema` defines the data types that will be added to Lucid documents to store the sample data.
