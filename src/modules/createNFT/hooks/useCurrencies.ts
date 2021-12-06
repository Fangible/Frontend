import { WRAPPED_SOL_MINT } from 'npms/oystoer';

export function useCurrencies() {
  return {
    options: [
      {
        label: 'SOL',
        value: WRAPPED_SOL_MINT,
        contract: WRAPPED_SOL_MINT,
        decimals: 9,
      },
    ],
    default: WRAPPED_SOL_MINT,
  };
}
