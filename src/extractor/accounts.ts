import * as cheerio from 'cheerio';

import {
  Account,
  AccountType,
  Session,
} from '../framework/model';
import { ExtractionResult } from '../framework/plugin';
import { HTTPRequest } from './service';

const parseBalance = (
  balance: string,
): number => parseFloat(balance.replace('$', ''));

const convertAccountType = (
  officialName: string,
): AccountType => {
  switch (officialName) {
    case 'Business Checking':
    case 'Student Savings':
      return 'depository';
    case 'Travel Rewards Mastercard':
      return 'credit';
    case 'Auto Loan':
    case '10/1 Adjustable':
    case '20 Yr Fixed':
      return 'loan';
    default:
      throw Error(`unknown account type: ${officialName}`);
  }
};

export const extractAccounts = async (
  session: Session,
): Promise<ExtractionResult<Array<Account>>> => {
  const accountsResponse = await HTTPRequest('http://firstplaidypus.herokuapp.com/accounts', 'GET', session.jar);

  const html = cheerio.load(accountsResponse.body);
  const accountRows = html('.accountrow');
  const accounts: Array<Account> = [];

  accountRows.each((i, elem) => {
    const row = cheerio.load(elem);
    const nickname = row('div.left > h4').text();
    const officialName = row('div.left > p').text();
    const availableBalance = parseBalance(row('div.right > h4').text());
    const mask = row('.accountmask').text();
    const type = convertAccountType(officialName);

    accounts.push({
      type,
      nickname,
      officialName,
      currentBalance: availableBalance,
      availableBalance,
      mask,
    });
  });

  return { data: accounts };
};
