import * as cheerio from 'cheerio';
import got, { OptionsOfTextResponseBody } from 'got';
import getImageType from 'image-type';
import isSvg from 'is-svg';
import isURL from 'is-url';
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

        const responseBuffer = (await got.default(requestURL, requestOptions)).rawBody;
        const imageType = getImageType(responseBuffer);

        if (!imageType?.mime.startsWith('image')) {
            if (responseBuffer.includes('og:image') || responseBuffer.includes('itemprop="image"')) {
                const $ = cheerio.load(responseBuffer);

                const meta = $('meta[property="og:image"]') || $('meta[itemprop="image"]');
                let metaContent = meta?.attr('content');

                if (!metaContent) return getReturnValue();

                if (metaContent[0] === '/' && metaContent[1] !== '/') metaContent = `${new URL(url).origin}${metaContent}`;

                if (!isURL(metaContent)) return getReturnValue();

                if (!/^https?:/.test(metaContent)) {
                    if (/^\/\//.test(metaContent)) metaContent = `http:${metaContent}`;
                    else if (/^\//.test(metaContent)) metaContent = `http:/${metaContent}`;
                    else metaContent = `http://${metaContent}`;
                }

                return getReturnValue(true, metaContent);
            } else if (options?.allowSVG && isSvg(responseBuffer.toString())) return getReturnValue(true);
        } else return getReturnValue(true);
    } catch (err: any) {
        if (err.code !== 'ETIMEDOUT' && err.code !== 'ENOTFOUND' && err.message !== 'Response code 404 (Not Found)') console.error(err);
    }

    return getReturnValue();
};
