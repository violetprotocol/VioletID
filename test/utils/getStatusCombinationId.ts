export const getStatusCombinationId = (attributeIds: number[]) =>
  attributeIds.reduce((acc, attributeIndex) => {
    return acc | (1 << attributeIndex);
  }, 0);
