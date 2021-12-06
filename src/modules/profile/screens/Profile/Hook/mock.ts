import { MetadataCategory } from 'npms/oystoer';
import { INftInfoSchema } from './types';

export const MockNftList: INftInfoSchema[] = [
  {
    mintAddress: 'CfVGFEgkHFhuAtTzpKjkhBtMWLxZq9oCA8vCqb4ZUcYs',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    name: 'TEST_10.28',
    symbol: '',
    uri: 'https://ap1-cfs3-media-bounce.bounce.finance/edd83372495d6e642433f852408d087a-1635417242.json',
    sellerFeeBasisPoints: 0,
    primarySaleHappened: false,
    creators: [
      {
        address: 'AhNbarZ7LBjJayxWtvsygAXz78iMsbXrBxe1c3pTHKDs',
        share: 100,
        verified: true,
      },
    ],
    owner: 'AhNbarZ7LBjJayxWtvsygAXz78iMsbXrBxe1c3pTHKDs',
    image:
      'https://ap1-cfs3-media-bounce.bounce.finance/d77bdd126f2daa46505d8177ff7d5a80-1635417215.jpg',
    metadata: {
      category: MetadataCategory.Image,
      name: 'TEST_10.28',
      symbol: '',
      image:
        'https://ap1-cfs3-media-bounce.bounce.finance/d77bdd126f2daa46505d8177ff7d5a80-1635417215.jpg',
      description: 'description',
      properties: {
        category: 'image',
        creators: [
          {
            address: 'AhNbarZ7LBjJayxWtvsygAXz78iMsbXrBxe1c3pTHKDs',
            share: 100,
          },
        ],
        files: [{}],
      },
      attributes: [],
    },
    masterEdition: {
      key: 6,
      supply: 0,
      maxSupply: 3,
    },
    edition: null,
  },
  {
    mintAddress: '2Gxk8QmKMKJzjhkJHXpzHDaEWRH3pKSmtsJQNzdkxMDC',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    name: 'TEST_10.28',
    symbol: '',
    uri: 'https://ap1-cfs3-media-bounce.bounce.finance/e633637ca0822009b49c09260fc062df-1635417440.json',
    sellerFeeBasisPoints: 0,
    primarySaleHappened: false,
    creators: [
      {
        address: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
        share: 100,
        verified: true,
      },
    ],
    owner: 'AhNbarZ7LBjJayxWtvsygAXz78iMsbXrBxe1c3pTHKDs',
    image:
      'https://ap1-cfs3-media-bounce.bounce.finance/bf726d92a5cd5c4cc73dd8d18f4a5f4f-1635417422.jpg',
    metadata: {
      category: MetadataCategory.Image,
      name: 'TEST_10.28',
      symbol: '',
      image:
        'https://ap1-cfs3-media-bounce.bounce.finance/bf726d92a5cd5c4cc73dd8d18f4a5f4f-1635417422.jpg',
      description: 'description',
      properties: {
        category: 'image',
        creators: [
          {
            address: 'AhNbarZ7LBjJayxWtvsygAXz78iMsbXrBxe1c3pTHKDs',
            share: 100,
          },
        ],
        files: [{}],
      },
      attributes: [],
    },
    masterEdition: {
      key: 6,
      supply: 0,
      maxSupply: 3,
    },
    edition: null,
  },
];
