import { useSolanaTextStyles } from './useSolanaTextStyles';

export const SolanaText = ({ context }: { context: any }) => {
  const classes = useSolanaTextStyles();
  return <span className={classes.root}>{context}</span>;
};
