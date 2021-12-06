import Box from '@material-ui/core/Box';
import FormLabel from '@material-ui/core/FormLabel';
import { FieldRenderProps } from 'react-final-form';
import { Button } from 'modules/uiKit/Button';
import { useAttributeFieldStyles } from './attributesStyle';
import { TextField } from '@material-ui/core';
import { Attribute } from 'npms/oystoer';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

export const FCAttribute: React.FC<{
  attributes: Attribute[];
  slot?: (index: number) => React.ReactNode;
}> = ({ attributes, slot }) => {
  const classes = useAttributeFieldStyles();
  return (
    <>
      {attributes.map((attribute, index) => {
        return (
          <div key={index} className={classes.attribute}>
            <span className={classes.attributeText}>
              <span className={classes.attributeTextType}>
                {attribute.trait_type}:{' '}
              </span>
              {attribute.value}
            </span>
            {slot?.(index)}
          </div>
        );
      })}
    </>
  );
};
export const AttributesField: React.FC<FieldRenderProps<string>> = ({
  label,
  input,
  ...rest
}) => {
  const [attributes, setAttribute] = useState<Attribute[]>([]);
  const classes = useAttributeFieldStyles();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    input.onChange({
      attributes,
      key,
      value,
    });
    // eslint-disable-next-line
  }, [attributes, key, value]);

  const onAdd = () => {
    if (!key || !value) {
      return;
    }
    setAttribute([
      ...attributes,
      {
        trait_type: key,
        value,
      },
    ]);
    setKey('');
    setValue('');
  };
  const onDel = (index: number) => {
    const att = _.clone(attributes);
    att.splice(index, 1);
    setAttribute(att);
  };
  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };
  const handleVaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <FormLabel className={classes.label}>{label}</FormLabel>
      </Box>
      <div style={{ height: 30 }}></div>
      <FCAttribute
        attributes={attributes}
        slot={index => {
          return (
            <div
              className={classNames(classes.delIcon, '_delIcon')}
              onClick={() => onDel(index)}
            ></div>
          );
        }}
      />
      <div className={classes.inputsBox}>
        <TextField label="Name" value={key} onChange={handleKeyChange} />
        <TextField label="Value" value={value} onChange={handleVaultChange} />
      </div>
      <div className={classes.addBox}>
        <Button
          disabled={Boolean(!key || !value)}
          onClick={onAdd}
          rounded
          fullWidth
          variant="outlined"
          className={classes.add}
        >
          <div className={[classes.addIcon, '_addIcon'].join(' ')}></div>
          Add attribute
        </Button>
      </div>
    </>
  );
};
