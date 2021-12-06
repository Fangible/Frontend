import * as React from 'react';

export enum SceneType {
  'MyCreated',
  'MyOwned',
  'MySells',
  'MyBids',
  'MarketPlace',
}

interface IEmptyProps {
  scene?: SceneType;
}

export const QueryEmpty = (props: IEmptyProps) => {
  const { scene } = props;

  switch (scene) {
    case SceneType.MyBids:
      return <></>;

    default:
      return <div>Empty...</div>;
  }
};
