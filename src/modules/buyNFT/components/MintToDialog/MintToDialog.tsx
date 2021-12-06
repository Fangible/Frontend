import { Box, Dialog, Grid, IconButton, Typography } from '@material-ui/core';
import { CloseIcon } from 'modules/common/components/Icons/CloseIcon';
import { InputField } from 'modules/form/components/InputField';
import { FormErrors } from 'modules/form/utils/FormErrors';
import { t } from 'modules/i18n/utils/intl';
import { Button } from 'modules/uiKit/Button';
import { useCallback } from 'react';
import { Field, Form, FormRenderProps } from 'react-final-form';
import { useMintToDialogStyles } from './useMintToDialogStyles';

interface IMintToFormValues {
  amount: number;
  destination: string;
}

interface IMintToDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit: (values: IMintToFormValues, form: any, callback: any) => void;
  loading?: boolean;
  initialValues: IMintToFormValues;
  initBalances: {
    available: number;
    maxSupply: number;
  };
}

export const MintToDialog = ({
  isOpen = false,
  onClose,
  onSubmit,
  loading,
  initialValues,
  initBalances,
}: IMintToDialogProps) => {
  const classes = useMintToDialogStyles();
  const validateForm = useCallback(
    ({ amount, destination }: IMintToFormValues) => {
      const errors: FormErrors<IMintToFormValues> = {};
      // 校验 mint 的数量
      if (!amount) errors.amount = t('validation.required');
      else if (amount > initBalances.available)
        errors.amount = 'Insufficient number of remaining permissions';

      // 校验 mintTo 目的地地址
      if (!destination) errors.destination = t('validation.required');
      else if (destination.length !== 44)
        errors.destination = 'Invalid address, please recalibrate';

      return errors;
    },
    [initBalances.available],
  );

  const renderForm = useCallback(
    ({ handleSubmit, submitting }: FormRenderProps<IMintToFormValues>) => {
      return (
        <>
          <Box mb={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} className={classes.inputWrapper}>
                <Field
                  component={InputField}
                  name="amount"
                  type="number"
                  label={'Amount'}
                  InputProps={{
                    endAdornment: (
                      <button className={classes.maxBtn}>Max</button>
                    ),
                  }}
                  disabled
                />

                <span className={classes.mintBalance}>
                  Available / Max Supply：{initBalances.available} /{' '}
                  {initBalances.maxSupply}
                </span>
              </Grid>

              <Grid item xs={12} className={classes.inputWrapper}>
                <Field
                  component={InputField}
                  name="destination"
                  type="string"
                  label={'Destination'}
                />
              </Grid>
            </Grid>
          </Box>

          <Grid className={classes.btnWrapper}>
            <Button size="large" onClick={onClose} variant="outlined">
              Canael
            </Button>

            <Button
              size="large"
              onClick={handleSubmit}
              loading={loading}
              disabled={submitting}
            >
              Comfirm
            </Button>
          </Grid>
        </>
      );
    },
    [loading, classes, initBalances, onClose],
  );

  return (
    <Dialog
      fullWidth
      open={isOpen}
      onClose={onClose}
      classes={{ paper: classes.root }}
      PaperProps={{ elevation: 0 }}
      maxWidth="md"
    >
      <Typography variant="h2" className={classes.title}>
        Mint To
      </Typography>

      <Form
        onSubmit={onSubmit}
        render={renderForm}
        validate={validateForm}
        initialValues={initialValues}
      />

      <IconButton onClick={onClose} className={classes.close}>
        <CloseIcon fontSize="large" />
      </IconButton>
    </Dialog>
  );
};
