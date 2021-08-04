export function convertPageToOffset(
  page?: number,
  pageSize?: number
): { limit: number, skip: number } | undefined {
  if (!page || page < 0 || !pageSize || pageSize < 0) return

  return {
    limit: pageSize,
    skip: (page - 1) * pageSize,
  }
}
