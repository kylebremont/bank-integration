import 'source-map-support/register';

import * as uuid from 'uuid';

import { extractor } from './extractor';
import { convertThrownValue } from './framework/errors';
import {
  Account,
  AccountIndex,
  Credentials,
  FullResult,
  Info,
  Transaction,
} from './framework/model';
import {
  ExtractionResult,
  isErrorResult,
  TransactionOptions,
} from './framework/plugin';

const extract = async (
  creds: Credentials,
  options: TransactionOptions,
): Promise<ExtractionResult<FullResult>> => {
  const accounts = new Map<AccountIndex, Account>();
  const transactions = new Map<AccountIndex, Array<Transaction>>();
  let info: Info | undefined = undefined;

  try {
    const loginResult = await extractor.login(creds);
    if (isErrorResult(loginResult)) {
      return loginResult;
    }
    const session = loginResult.session;

    const accountsResult = await extractor.extractAccounts(session);
    if (isErrorResult(accountsResult)) {
      return accountsResult;
    }

    for (const account of accountsResult.data) {
      accounts.set(uuid.v4(), account);
    }

    if (extractor.extractInfo != null) {
      const infoResult = await extractor.extractInfo(session);
      if (isErrorResult(infoResult)) {
        return infoResult;
      }
      info = infoResult.data;
    }

    if (extractor.extractTransactions != null) {
      for (const [accountIndex, account] of accounts) {
        if (['credit', 'depository'].includes(account.type)) {
          const transactionsResult =
            await extractor.extractTransactions(session, account, options);
          if (isErrorResult(transactionsResult)) {
            return transactionsResult;
          }
          transactions.set(accountIndex, transactionsResult.data);
        }
      }
    }
  } catch (err) {
    console.log(err);
    return convertThrownValue(err);
  }

  return {
    data: {
      accounts,
      info,
      transactions,
    },
  };
};

const generateJSON = (blob: any) => JSON.stringify(blob, (key, value) => {
  if (value instanceof Error) {
    return value.stack;
  }
  if (value instanceof Map) {
    return Array.from(value.entries());
  }
  return value;
}, 2);

(async () => {
  console.log('starting extraction');

  // Enter test credentials here.
  const creds = {
    username: 'user0',
    password: 'password',
  };

  // Enter start and end date here.
  const options = {
    startDate: '2020-11-13',
    endDate: '2020-12-13',
  };

  const result = await extract(creds, options);
  console.log(generateJSON(result));
})();
