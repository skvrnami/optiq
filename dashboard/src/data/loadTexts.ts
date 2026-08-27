import { InputText } from '@/types/input';

let pending: Promise<InputText[]> | null = null;

/**
 * Loads the text dataset on demand.
 *
 * texts.json is by far the largest asset in the project, so it is pulled in
 * with a dynamic import to keep it out of the entry chunk. Vite rewrites the
 * specifier to a correctly based URL, which a hand-built fetch() path could
 * not do while `base` is relative and the app is embedded in an iframe.
 *
 * The promise is memoised, so concurrent callers and later re-renders share a
 * single request.
 */
export const loadTexts = (): Promise<InputText[]> => {
  if (!pending) {
    pending = import('@data/texts.json').then((module) => module.default as InputText[]);
  }
  return pending;
};
