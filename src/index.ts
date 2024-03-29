import { JSDOM } from 'jsdom';
import isURL from 'is-url';
import getImageType from 'image-type';
import got from 'got';
import isSvg from 'is-svg';

export const verifyImageURL = async (url: string, options?: { timeout?: number; allowSVG?: boolean }) => {
    const getReturnValue = (isImage = false, imageURL = url) => ({ isImage, imageURL });
    if (!isURL(url)) return getReturnValue();

    try {
        const responseBuffer = (await got(url, { headers: { 'User-Agent': 'got' }, timeout: options?.timeout ?? 5000 })).rawBody;
        const imageType = getImageType(responseBuffer);

        if (!imageType?.mime.startsWith('image')) {
            if (responseBuffer.includes('og:image')) {
                const dom = new JSDOM(responseBuffer);
                const meta = dom.window.document.querySelector('meta[property="og:image"]');

                if (!meta || !meta.content || !isURL(meta.content)) return getReturnValue();

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
