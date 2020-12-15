import {
  errorResult,
  ExtractorErrorCode,
} from '../framework/errors';
import { Credentials } from '../framework/model';
import { LoginResult } from '../framework/plugin';
import { createJar } from '../framework/requests';
import { HTTPRequest } from './service';

export const login = async (
  creds: Credentials,
): Promise<LoginResult> => {

  const jar = createJar();
  const response = await HTTPRequest('http://firstplaidypus.herokuapp.com/login', 'POST', jar, creds);

  // if you don't get redirected to the accounts page, throw error
  if (response.headers.location !== 'http://firstplaidypus.herokuapp.com/accounts/') {
    return errorResult(ExtractorErrorCode.InvalidCredentials);
  }

  const session = { jar }
  return { session }
}