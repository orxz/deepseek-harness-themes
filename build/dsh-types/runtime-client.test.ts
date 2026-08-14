/**
 * Test-environment stand-in for the platform store factory. Mirrors the
 * defineStore contract (immediate state, baked actions over the draft) so
 * slot-store tests run without the dsh module table.
 */

export interface StoreSpec<T, A> {
  init: () => T;
  persist?: string;
  actions: A;
}

export type BakedActions<T, A> = {
  [K in keyof A]: A[K] extends (draft: T, ...params: infer P) => void
    ? (...params: P) => void
    : never;
};

export interface StoreInstance<T, A> {
  readonly actions: BakedActions<T, A>;
  getSnapshot(): T;
  subscribe(fn: () => void): () => void;
  clearPersisted(): void;
}

export interface StoreHandle<T, A> {
  readonly spec: StoreSpec<T, A>;
  create(scopeKey?: string): StoreInstance<T, A>;
}

export type EngineStoreHandle<T, A> = StoreHandle<T, A>;

export function defineStore<
  T,
  A extends Record<string, (draft: T, ...params: never[]) => void>,
>(spec: StoreSpec<T, A>): EngineStoreHandle<T, A> {
  let state = spec.init();
  const listeners = new Set<() => void>();
  const actions = {} as Record<string, (...params: never[]) => void>;
  for (const [key, action] of Object.entries(spec.actions)) {
    actions[key] = (...params: never[]) => {
      // Draft semantics in the test stand-in: actions mutate the state
      // in place, matching the immer-draft contract the engine bakes.
      action(state, ...params);
      for (const listener of listeners) listener();
    };
  }
  return {
    spec,
    create: () => ({
      actions: actions as BakedActions<T, A>,
      getSnapshot: () => state,
      subscribe: (fn) => {
        listeners.add(fn);
        return () => {
          listeners.delete(fn);
        };
      },
      clearPersisted: () => {},
    }),
  };
}
