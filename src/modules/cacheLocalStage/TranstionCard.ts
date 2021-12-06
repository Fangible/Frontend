import { ICacheNftInfo, TransitionCacheName } from './types';

export const getLocalStage = (name: TransitionCacheName, user: string) => {
  const data__ = localStorage.getItem(name + user);
  if (data__) {
    const data_ = JSON.parse(data__);
    const data = JSON.parse(data_);
    return data as { [key: string]: ICacheNftInfo };
  }
  return {};
};

export const setLocalStage = (
  name: TransitionCacheName,
  context: any,
  user: string,
) => {
  const _context = JSON.stringify(context);
  if (_context) localStorage.setItem(name + user, _context);
};

// export const catch_PublishItems = (() => {
//   const set = (auctionAddress: string, nftInfo: ICacheNftInfo, address: string) => {
//     try {
//       const data = getLocalStage(TransitionCacheName.PublishItems);
//       data[auctionAddress] = nftInfo;
//       const _data = JSON.stringify(data);
//       setLocalStage(TransitionCacheName.PublishItems, _data, address);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const get = () => {
//     const data = getLocalStage(TransitionCacheName.PublishItems);
//     return data;
//   };

//   const del = (auctionAddress: string) => {
//     try {
//       const data = getLocalStage(TransitionCacheName.PublishItems);
//       delete data[auctionAddress];
//       const _data = JSON.stringify(data);
//       setLocalStage(TransitionCacheName.PublishItems, _data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const toArray: () => ICacheNftInfo[] = () => {
//     try {
//       const data = getLocalStage(TransitionCacheName.PublishItems);
//       const arr: ICacheNftInfo[] = [];
//       for (const key in data) {
//         if (Object.prototype.hasOwnProperty.call(data, key)) {
//           const element = data[key];
//           arr.push(element);
//         }
//       }
//       return arr;
//     } catch (error) {
//       console.error(error);
//       return [];
//     }
//   };

//   return { set, get, del, toArray };
// })();

export class CardTranstionCache {
  cacheName: TransitionCacheName = TransitionCacheName.BurnItems;
  user: string = '';

  constructor(type: TransitionCacheName, user: string) {
    this.cacheName = type;
    this.user = user;
  }

  set = (keyAddress: string, nftInfo: ICacheNftInfo) => {
    try {
      const data = getLocalStage(this.cacheName, this.user);
      data[keyAddress] = nftInfo;
      const _data = JSON.stringify(data);
      setLocalStage(this.cacheName, _data, this.user);
    } catch (error) {
      console.error(error);
    }
  };

  get = () => {
    const data = getLocalStage(this.cacheName, this.user);
    return data;
  };

  del = (keyAddress: string) => {
    try {
      const data = getLocalStage(this.cacheName, this.user);
      delete data[keyAddress];
      const _data = JSON.stringify(data);
      setLocalStage(this.cacheName, _data, this.user);
    } catch (error) {
      console.error(error);
    }
  };

  toArray: () => ICacheNftInfo[] = () => {
    try {
      const data = getLocalStage(this.cacheName, this.user);
      const arr: ICacheNftInfo[] = [];
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const element = data[key];
          arr.push(element);
        }
      }
      return arr;
    } catch (error) {
      console.error(error);
      return [];
    }
  };
}
