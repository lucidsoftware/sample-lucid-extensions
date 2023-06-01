export const DataConnecorName = 'example-data-connector';
export const DataSourceName = 'example-tasks-source';
export const CollectionName = 'example-tasks-collection';

export enum DataAction {
    IMPORT = 'Import',
    PATCH = 'Patch',
}

export enum TaskFieldNames {
    ID = 'id',
    NAME = 'name',
    COMPLETE = 'complete',
    DUE = 'due',
    COST = 'cost',
}
