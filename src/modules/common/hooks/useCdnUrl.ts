import { useEffect, useState } from 'react';

// 传入原始图片链接、目标宽高，处理得到缩略图链接，返回该链接并进行预加载。
const useCdnUrl = (src: string, width?: number, height?: number) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const cdnUrl = process.env.REACT_APP_IMG_CDN_URL;
  const hecoCdnUrl = process.env.REACT_APP_IMG_HECO_CDN_URL;

  const preLoad = (src: string, origin: string, reload?: boolean) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      if (!reload && src.slice(-4)?.includes('.gif')) {
        requestAnimationFrame(() => preLoad(origin, origin, true));
      }
    };
    img.onerror = () => setImgSrc('');
  };

  const getCdnUrl = (
    src: string | { image: string },
    width: number = 0,
    height: number = 0,
  ): string => {
    const suffixs = ['.jpg', '.png', '.gif', '.jp2', '.jpeg'];
    let realSrc = '';
    if (typeof src === 'object') {
      src = src.image || '';
    } else {
      realSrc = src;
    }
    const hasThumbnail =
      (realSrc?.slice(0, cdnUrl?.length) === cdnUrl ||
        realSrc?.slice(0, hecoCdnUrl?.length) === hecoCdnUrl) &&
      suffixs.find(format => realSrc.slice(-5)?.includes(format));

    const getThumbnailUrl = (realSrc: String): string => {
      if (cdnUrl || hecoCdnUrl) {
        return `${realSrc?.slice(0, realSrc?.lastIndexOf('/'))}/${
          width > 0 ? width : 'auto'
        }x${height > 0 ? height : 'auto'}${realSrc?.slice(
          realSrc?.lastIndexOf('/'),
        )}`;
      }
      return '';
    };

    return hasThumbnail ? getThumbnailUrl(src) : src;
  };

  useEffect(() => {
    if (src) {
      preLoad(getCdnUrl(src, width, height), src);
    }
    // eslint-disable-next-line
  }, [src, width, height]);

  return { imgSrc, setImgSrc };
};

export default useCdnUrl;
