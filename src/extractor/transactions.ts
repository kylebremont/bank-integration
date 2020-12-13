import * as cheerio from 'cheerio';

import {
  Session,
  Account,
  Transaction
} from '../framework/model';
import {
  ExtractionResult,
  TransactionOptions,
} from '../framework/plugin';
import { HTTPRequest } from './service';

const csvParse = require('csv-parse/lib/sync'); // tslint:disable-line
// Helper for parsing CSV response body, including header row if present.
const parseCSV = (
  data: string,
): Array<Array<string>> => csvParse(data);


/*
  @params downloadPage: html string for the download page
          account: specific account which id we are looking for
  returns the id associated with the specific account
*/
const getAccountId = (
  downloadPage: string,
  account: Account,
): string => {
  let accountId = '';
  const html = cheerio.load(downloadPage);
  const ids = html('option');

  // finding the correct account id associated with the account
  ids.each((i, elem) => {
    const accountName = cheerio.load(elem)('option').text().split(/\s{4}/);
    if (accountName[0] === account.officialName) {
      accountId = elem.attribs.value;
    }
  });

  return accountId;
}

/*
  @params csv: object containing the parsed transaction data
  returns an array of transactions that have been paid for
*/
const getPaidTransactions = (
  csv: Array<Array<string>>,
): Array<Transaction> => {
  const transactions: Array<Transaction> = [];
  csv.forEach((value, index) => {
    if (index > 0) {
      transactions.push({
        amount: parseFloat(value[2]),
        date: value[1].split(' ')[0],
        description: value[3],
        pending: false
      });
    }
  });

  return transactions;
}

/*
  @params accountInfoPage: html string for the specific account's info page
          options: the date range in which we are looking for transactions
  returns an array of transactions that are pending
*/
const getPendingTransactions = (
  accountInfoPage: string,
  options: TransactionOptions,
): Array<Transaction> => {
  // finding all pending transactions
  const html = cheerio.load(accountInfoPage);
  const rows = html('div.table-container.pending > table > tbody').text().split('\n');
  const data: Array<string> = [];
  rows.forEach((value, index) => {
    value = value.trim();
    if (value !== '') {
      data.push(value);
    }
  });

  // formating object into array of transactions
  const pendingTransactions: Array<Transaction> = [];
  if (data.length > 0) {
    for (let i = 2; i < data.length; i += 3) {
      pendingTransactions.push({
        amount: parseFloat(data[i]),
        date: data[i - 2],
        description: data[i - 1],
        pending: true
      })
    }
  }

  // checking if the pending transactions are in the specified date range
  const validPendingTransactions: Array<Transaction> = [];
  const startData = options.startDate.split('-');
  const endData = options.endDate.split('-');
  const start = new Date(parseInt(startData[0]), parseInt(startData[1]) - 1, parseInt(startData[2]));
  const end = new Date(parseInt(endData[0]), parseInt(endData[1]) - 1, parseInt(endData[2]));
  pendingTransactions.forEach((value, index) => {
    const pendingData = value.date.split('-');
    const pending = new Date(parseInt(pendingData[0]), parseInt(pendingData[1]) - 1, parseInt(pendingData[2]));
    if (pending >= start && pending <= end) {
      validPendingTransactions.push(value);
    }
  })

  return validPendingTransactions;
}

export const extractTransactions = async (
  session: Session,
  account: Account,
  options: TransactionOptions,
): Promise<ExtractionResult<Array<Transaction>>> => {

  // making a get to the download link
  const downloadPage = await HTTPRequest('http://firstplaidypus.herokuapp.com/download', 'GET', session.jar);
  // getting the account id
  const accountId = getAccountId(downloadPage.body, account);

  // get call to specific account page
  const accountInfoResponse = await HTTPRequest(`http://firstplaidypus.herokuapp.com/accounts/${accountId}`, 'GET', session.jar);
  // getting the pending transactions
  const pendingTransactions = getPendingTransactions(accountInfoResponse.body, options);

  // post call to download paid transactions
  const formBody = { account_id: accountId, start_date: options.startDate, end_date: options.endDate };
  const transactionResponse = await HTTPRequest('http://firstplaidypus.herokuapp.com/download', 'POST', session.jar, formBody);
  // getting paid transactions
  const csv = parseCSV(transactionResponse.body);
  const paidTransactions = getPaidTransactions(csv);

  return { data: pendingTransactions.concat(paidTransactions) };
}