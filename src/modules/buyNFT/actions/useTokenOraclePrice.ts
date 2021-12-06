import { Axios } from 'modules/common/conts';
import { WRAPPED_SOL_MINT } from 'npms/oystoer';
import { useEffect, useState } from 'react';

export default function useTokenOraclePrice(symbol: string = 'SOL') {
  const [oraclePrice, setOraclePrice] = useState(0);

  useEffect(() => {
    (() => {
      Axios.get('/oracles/price', {
        params: {
          mintAddress: WRAPPED_SOL_MINT.toBase58(),
        },
      })
        .then(res => {
          if (res.status !== 200) return console.error('预言机接口有问题');
          const _price = res.data.data;
          setOraclePrice(_price);
        })
        .catch(() => {
          console.error('预言机接口有问题');
        });
    })();
  }, [symbol]);

  return oraclePrice;
}
