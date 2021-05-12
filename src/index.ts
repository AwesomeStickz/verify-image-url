import { JSDOM } from 'jsdom';
import AbortController from 'abort-controller';
import fetch from 'node-fetch';
import isURL from 'is-url';
import getImageType from 'image-type';

export const verifyImageURL = async (url: string, options?: { timeout: number }) => {
    const getReturnValue = (isImage = false, imageURL = url) => ({ isImage, imageURL });
    if (!isURL(url)) return getReturnValue();

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), options?.timeout ?? 5000);

    try {
        const response = await fetch(url, { signal: abortController.signal });
        const buffer = Buffer.from(await response.arrayBuffer());
        const imageType = getImageType(buffer);

        clearTimeout(timeout);

        if (!imageType?.mime.startsWith('image')) {
            const responseText = await (await fetch(url, { signal: abortController.signal })).text();

            if (responseText.includes('og:image')) {
                const dom = new JSDOM(responseText);
                const meta = dom.window.document.querySelector('meta[property="og:image"]');

                if (!isURL(meta.content)) return getReturnValue();

                if (!/^https?:/.test(meta.content)) {
                    if (/^\/\//.test(meta.content)) meta.content = `http:${meta.content}`;
                    else if (/^\//.test(meta.content)) meta.content = `http:/${meta.content}`;
                    else meta.content = `http://${meta.content}`;
                }

                return getReturnValue(true, meta.content);
            }
        } else return getReturnValue(true);
    } catch (err) {
        if (err.name !== 'AbortError') console.error(err);

        clearTimeout(timeout);
    }

    return getReturnValue();
};
