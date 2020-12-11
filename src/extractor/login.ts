import {
  errorResult,
  ExtractorErrorCode,
} from '../framework/errors';
import { Credentials } from '../framework/model';
import { LoginResult } from '../framework/plugin';

export const login = async (
  creds: Credentials,
): Promise<LoginResult> =>
  // TODO: Fill out login logic
  errorResult(ExtractorErrorCode.UnsupportedOperation);
