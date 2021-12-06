import React from 'react';

interface IEmptyPageDataProps {
  className?: string;
  onNetworkChange?: () => void;
}

export const EmptyPageData = ({
  className,
  onNetworkChange,
}: IEmptyPageDataProps) => {
  return <></>;
};
