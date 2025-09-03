import got, { OptionsOfTextResponseBody } from 'got';
import getImageType from 'image-type';
import isSvg from 'is-svg';
import isURL from 'is-url';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

export const verifyImageURL = async (url: string, options?: { allowSVG?: boolean; proxy?: { url: string; auth?: string }; timeout?: number }) => {
    const getReturnValue = (isImage = false, imageURL = url) => ({ isImage, imageURL });
    if (!isURL(url)) return getReturnValue();

    try {
        let requestURL: string;

        const requestOptions: OptionsOfTextResponseBody = {
            headers: {
                'User-Agent': 'got',
            },
            timeout: options?.timeout ?? 5000,
        };

        // If proxy auth is provided, send a POST request to the proxy url with the provided auth
        if (options?.proxy?.auth) {
            requestURL = options.proxy.url;

            requestOptions.method = 'POST';
            requestOptions.json = { method: 'GET', url };

            requestOptions.headers!.Authorization = options.proxy.auth;
        }
        // Otherwise, if a proxy url is provided, use it
        else if (options?.proxy?.url) requestURL = `${options.proxy.url}${encodeURIComponent(url)}`;
        // Otherwise, send the request directly
        else requestURL = url;

        const responseBuffer = (await got(requestURL, requestOptions)).rawBody;
        const imageType = getImageType(responseBuffer);

        if (!imageType?.mime.startsWith('image')) {
            if (responseBuffer.includes('og:image') || responseBuffer.includes('itemprop="image"')) {
                const dom = new JSDOM(responseBuffer);
                const meta = dom.window.document.querySelector('meta[property="og:image"]') || dom.window.document.querySelector('meta[itemprop="image"]');

                if (!meta?.content) return getReturnValue();

                if (meta.content[0] === '/' && meta.content[1] !== '/') meta.content = `${new URL(url).origin}${meta.content}`;

                if (!isURL(meta.content)) return getReturnValue();

                if (!/^https?:/.test(meta.content)) {
                    if (/^\/\//.test(meta.content)) meta.content = `http:${meta.content}`;
                    else if (/^\//.test(meta.content)) meta.content = `http:/${meta.content}`;
                    else meta.content = `http://${meta.content}`;
                }

                return getReturnValue(true, meta.content);
            } else if (options?.allowSVG && isSvg(responseBuffer)) return getReturnValue(true);
        } else return getReturnValue(true);
    } catch (err: any) {
        if (err.code !== 'ETIMEDOUT' && err.code !== 'ENOTFOUND' && err.message !== 'Response code 404 (Not Found)') console.error(err);
    }

    return getReturnValue();
};
