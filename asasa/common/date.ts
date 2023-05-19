// Converts task.due_at into a dateonly string in the local timezone so that it displays correctly
export function convertDueAtToDateonly(dueAt: string): string {
    const theDate = new Date(dueAt);
    const onlyDate = new Date(theDate.getFullYear(), theDate.getMonth(), theDate.getDate());
    return onlyDate.toISOString().split('T')[0];
}
