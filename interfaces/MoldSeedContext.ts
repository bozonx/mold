export interface MoldSeedContext {
  insert(set: string, docs: Record<string, any>[]);
}
