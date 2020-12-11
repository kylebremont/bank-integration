import { Extractor } from '../framework/plugin';

import { extractAccounts } from './accounts';
import { login } from './login';

export const extractor: Extractor = {
  login,
  extractAccounts,
};
