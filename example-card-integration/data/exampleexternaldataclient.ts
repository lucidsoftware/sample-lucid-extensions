/**
 * This class simulates the responses you'd get from a third party data source.
 */
export class ExternalExampleDataClient {
  private readonly taskId1 = 'task1';
  private readonly taskId2 = 'task2';
  private readonly taskId3 = 'task3';

  private readonly partialTaskData = [
      {
          id: this.taskId1,
          name: 'The first task',
          complete: false,
      },
      {
          id: this.taskId2,
          name: 'The second task',
          complete: true,
      },
      {
          id: this.taskId3,
          name: 'The third task',
          complete: true,
      },
  ];

  private readonly fullTaskData = [
      {
          id: this.taskId1,
          name: 'The first task',
          complete: false,
          dueDate: '2025-01-01',
          cost: 2,
      },
      {
          id: this.taskId2,
          name: 'The second task',
          complete: true,
          dueDate: '2025-03-02',
          cost: 5,
      },
      {
          id: this.taskId3,
          name: 'The third task',
          complete: true,
          dueDate: '2025-07-07',
          cost: 1,
      },
  ];

  /**
   * This mocks an API call that would fetch a list of tasks from an extenal source. The data
   * is used to populte the import modal.
   */
  public getExampleSearchData(complete?: boolean, search?: string) {
      return this.partialTaskData.filter((task) => {
          if (complete !== undefined && task.complete !== complete) {
              return false;
          }
          if (search !== undefined && !task.name.includes(search)) {
              return false;
          }
          return true;
      });
  }

  /**
   * This mocks an API call that would fetch the full task data for all provided task ids.
   */
  public getExampleFullTaskData(ids: string[]) {
      return this.fullTaskData.filter((task) => ids.some((id) => id === JSON.stringify(task['id'])));
  }

  /**
   * This mocks an API call that would create a new task in the external source. This also returns the full
   * task data for the newly created task.
   */
  public create(taskCreationData: {name: string; dueDate?: string; complete?: boolean; cost?: number}) {
      const taskId = 'task' + (Math.floor(Math.random() * 100000) + 4); // Generate a random task ID
      const defaultDate = '2025-07-07';
      const fullTask = {
          id: taskId,
          name: taskCreationData.name,
          complete: taskCreationData.complete ?? false,
          dueDate: taskCreationData.dueDate ?? defaultDate,
          cost: taskCreationData.cost ?? 0,
      };
      return fullTask;
  }

  /**
   * This mocks an API call that would update a task in the external data source
   */
  public update(taskUpdateData: {id: string; name?: string; dueDate?: string; complete?: boolean; cost?: number}) {}
}
