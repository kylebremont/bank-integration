## Extractor Code

### Implementation Details

#### Login

Before getting any information from the site, the user must login. The login function makes a POST request to the /login endpoint and sends the user's credentials in the form body. If the user is redirected to the correct page, it continues extracting. Otherwise, it returns an error.

#### Accounts

After logging in, the extractor scrapes the data from the accounts page by making a GET request to the /accounts endpoint.

#### Info

The extractInfo function makes a GET request to the /settings/user endpoint. It then parses the string that is returned to build the customer info with their address.

#### Transactions

First, the extractTransactions function makes a GET request to the /download endpoint and scrapes the HTML to find the account id associated with the specific account. It then makes a GET request to the specific account's page and scrapes the HTML to find the pending transactions. Lastly, it makes a POST request to the /download endpoint with the desired date range and downloads and parses all of the transaction data. All of the pending and paid for transactions in the given date range are returned.

#### Service

An HTTPRequest service was created to add one more layer of separation between the request call and the logic in the extractor itself. This allows for the request library to be swapped out easily in the future if need be. Instead of switching out asyncRequest in every extractor function, you would just have to change it in the HTTPRequest function.