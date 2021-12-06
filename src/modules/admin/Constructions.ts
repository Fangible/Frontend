import { StringPublicKey } from 'npms/oystoer';
import { MetaplexKey } from 'models/metaplex';

export class WhitelistedCreator {
  key: MetaplexKey = MetaplexKey.WhitelistedCreatorV1;
  address: StringPublicKey;
  activated: boolean = true;

  // Populated from name service
  twitter?: string;
  name?: string;
  image?: string;
  description?: string;

  constructor(args: { address: string; activated: boolean }) {
    this.address = args.address;
    this.activated = args.activated;
  }
}
