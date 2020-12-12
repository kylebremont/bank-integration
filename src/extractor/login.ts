import {
  errorResult,
  ExtractorErrorCode,
} from '../framework/errors';
import { Credentials } from '../framework/model';
import { LoginResult } from '../framework/plugin';
import { asyncRequest, createJar } from '../framework/requests';

export const login = async (
  creds: Credentials,
): Promise<LoginResult> => {

  const jar = createJar();
  await asyncRequest<string>(
    'http://firstplaidypus.herokuapp.com/login',
    {
      method: 'POST',
      jar: jar,
      form: creds,
    },
  );

  const session = { jar }
  return { session }
}
errorResult(ExtractorErrorCode.UnsupportedOperation);
