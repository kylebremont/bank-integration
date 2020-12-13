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
  await HTTPRequest('http://firstplaidypus.herokuapp.com/login', 'POST', jar, creds);

  const session = { jar }
  return { session }
}
errorResult(ExtractorErrorCode.UnsupportedOperation);
