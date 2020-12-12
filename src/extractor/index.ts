import { Extractor } from '../framework/plugin';

import { extractAccounts } from './accounts';
import { login } from './login';
import { extractInfo } from './info';

export const extractor: Extractor = {
  login,
  extractAccounts,
  extractInfo,
};
