import { makeStyles } from '@material-ui/styles';
import { createStyles, Theme } from '@material-ui/core';

export const useAttributeFieldStyles = makeStyles((theme: Theme) =>
  createStyles({
    addBox: {
      '& .Mui-disabled': {
        '& ._addIcon:before, & ._addIcon:after': {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
      },
    },
    add: {
      '&:hover ': {
        '& ._addIcon:before, & ._addIcon:after': {
          backgroundColor: '#fff',
        },
      },
    },
    delIcon: {
      width: 13,
      height: 13,
      display: 'none',
      // display: 'inline-block',
      position: 'absolute',
      marginRight: '-10px',
      cursor: 'pointer',
      padding: '8px',
      transform: 'translateX(-10px) translateY(-7px) rotate(45deg)',
      border: '1px solid #ddd',
      borderRadius: '50%',
      '&:before': {
        content: `''`,
        width: '100%',
        height: 2,
        transition: 'all 0.5s',
        background:
          'linear-gradient(to right, rgba(220, 31, 255, 1), rgba(0, 255, 163, 1))',
        display: 'inline-block',
        position: 'absolute',
        left: 0,
        top: 'calc(50% - 0.5px)',
        transform: 'scale(0.7, 0.7)',
      },
      '&:after': {
        content: `''`,
        width: 2,
        height: '100%',
        transition: 'all 0.5s',
        // backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'inline-block',
        position: 'absolute',
        left: 'calc(50% - 0.5px)',
        top: 0,
        transform: 'scale(0.7, 0.7)',
        background:
          'linear-gradient(to right, rgba(220, 31, 255, 1), rgba(0, 255, 163, 1))',
      },
    },
    addIcon: {
      width: 13,
      height: 13,
      display: 'inline-block',
      position: 'relative',
      marginRight: 3,
      '&:before': {
        content: `''`,
        width: '100%',
        height: 2,
        transition: 'all 0.5s',
        backgroundColor: '#000',
        display: 'inline-block',
        position: 'absolute',
        left: 0,
        top: 'calc(50% - 1px)',
      },
      '&:after': {
        content: `''`,
        width: 2,
        height: '100%',
        transition: 'all 0.5s',
        backgroundColor: '#000',
        display: 'inline-block',
        position: 'absolute',
        left: 'calc(50% - 1px)',
        top: 0,
      },
    },
    label: {
      color: theme.palette.text.primary,
      fontWeight: 600,
    },
    attribute: {
      position: 'relative',
      display: 'inline-block',
      background:
        'linear-gradient(to right, rgba(220, 31, 255, 1), rgba(0, 255, 163, 1))',
      marginRight: 15,
      padding: '1px',
      borderRadius: 14,
      marginBottom: 15,
      '&:hover': {
        '& ._delIcon': {
          display: 'inline-block',
        },
      },
    },
    attributeText: {
      content: `''`,
      padding: '2px 15px',
      display: 'inline-block',
      width: '100%',
      height: '100%',
      background: '#fff',
      borderRadius: 13,
    },
    attributeTextType: {
      color: 'rgba(0, 0, 0, 0.4)',
    },
    inputsBox: {
      marginTop: 0,
      marginBottom: 20,
      display: 'flex',
      '& label': {
        fontWeight: 400,
      },
      '& .MuiTextField-root': {
        marginRight: 20,
      },
      '& .MuiTextField-root:last-child': {
        marginRight: 0,
      },
      '& .MuiOutlinedInput-input': {
        minHeight: 35,
      },
    },
  }),
);
