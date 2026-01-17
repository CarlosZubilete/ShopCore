/*
  Here we define a generic repository interface that can be used across different modules.
  This promotes code reusability and consistency in how data operations are handled.
*/
export type Query = Record<string, unknown>;

export interface IRepository<T = unknown> {
  create(data: T): Promise<T>;
  find(query?: Query): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
