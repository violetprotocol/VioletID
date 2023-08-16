// Combine multiple statuses into 1 bitmask by setting all their index to 1.
// A statusId is the (0th-based) index of the corresponding bit.
// For example given statusIds = [1, 3], this would set bits at index 1 and 3, i.e 1010 in binary,
// so the statusCombinationId is 10.
export const getStatusCombinationId = (statusIds: number[]) =>
  statusIds.reduce((acc, statusId) => {
    return acc | (1 << statusId);
  }, 0);
