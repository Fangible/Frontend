import { SvgIcon, SvgIconProps } from '@material-ui/core';

export const VideoErrorIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 50 70">
      <rect width="50" height="70" rx="8" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25 33C32.1797 33 38 27.1797 38 20C38 12.8203 32.1797 7 25 7C17.8203 7 12 12.8203 12 20C12 27.1797 17.8203 33 25 33ZM7 43C6.44772 43 6 43.4477 6 44C6 44.5523 6.44772 45 7 45H43C43.5523 45 44 44.5523 44 44C44 43.4477 43.5523 43 43 43H7ZM6 51C6 50.4477 6.44772 50 7 50H43C43.5523 50 44 50.4477 44 51C44 51.5523 43.5523 52 43 52H7C6.44772 52 6 51.5523 6 51ZM7 57C6.44772 57 6 57.4477 6 58C6 58.5523 6.44772 59 7 59H29C29.5523 59 30 58.5523 30 58C30 57.4477 29.5523 57 29 57H7Z"
        fill="#E0E0E0"
      />
      <path
        d="M30.7882 19.6738C31.3704 20.0707 31.3704 20.9293 30.7882 21.3262L22.5633 26.9341C21.8995 27.3867 21 26.9113 21 26.1079L21 14.8921C21 14.0887 21.8995 13.6133 22.5633 14.0659L30.7882 19.6738Z"
        fill="white"
      />
    </SvgIcon>
  );
};
