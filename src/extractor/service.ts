import { asyncRequest, CookieJar, HttpResponse } from '../framework/requests';

export const HTTPRequest = async (
    url: string,
    method: 'GET' | 'POST',
    jar: CookieJar,
    form?: {},
): Promise<HttpResponse<string>> => {
    const response = await asyncRequest<string>(
        url,
        {
            method,
            jar,
            form,
        }
    );
    return response;
}