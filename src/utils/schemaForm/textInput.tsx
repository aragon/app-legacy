import {
  ISchemaComponentProps,
  ValueAction,
  ValueDispatch,
} from '@restspace/schema-form';
import React, {useContext} from 'react';
import {
  Label,
  NumberInput,
  TextareaSimple,
  TextInput as UITextInput,
} from '@aragon/ods-old';
import {fieldType} from './schema';
//import dayjs from 'dayjs';
import 'dayjs/plugin/utc';

interface StringFilter {
  toStore(uiVal: string): unknown;
  toUi(storeVal: unknown): string;
}

const stringFilters: {[key: string]: StringFilter} = {
  'html-newlines': {
    toStore: uiVal => uiVal.replace(/\n/g, '<br/>'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toUi: storeVal => (storeVal as any).toString().replace(/<br\/>/g, '\n'),
  },
};

export const TextInput = ({
  schema: schemaObj,
  path,
  value,
  onFocus,
  onBlur,
  caption,
}: ISchemaComponentProps) => {
  const dispatch = useContext(ValueDispatch);
  //const [holdString, setHoldString] = useState('');
  const schema = schemaObj as Record<string, unknown>;
  const name = path.join('.');

  function handleTextChange(ev: React.FormEvent<HTMLInputElement>) {
    let val = ev.currentTarget['value'];
    if (schema['filter']) {
      const filter = stringFilters[schema['filter'] as string];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      val = (filter.toStore(val) as any).toString();
    }
    dispatch(ValueAction.set(path, val));
  }

  function handleTextAreaChange(ev: React.FormEvent<HTMLTextAreaElement>) {
    let val = ev.currentTarget['value'];
    if (schema['filter']) {
      const filter = stringFilters[schema['filter'] as string];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      val = (filter.toStore(val) as any).toString();
    }
    dispatch(ValueAction.set(path, val));
  }

  function handleChange(ev: React.FormEvent<HTMLInputElement>) {
    const val = ev.currentTarget.value;
    dispatch(ValueAction.set(path, val));
  }

  function handleSelectChange(ev: React.FormEvent<HTMLSelectElement>) {
    const val = ev.currentTarget.value;
    dispatch(ValueAction.set(path, val));
  }

  /*
  function handleTextDateTimeChange(ev: React.FormEvent<HTMLInputElement>) {
    const str = ev.currentTarget.value;
    if (str === '') {
      setHoldString('');
      dispatch(ValueAction.set(path, null));
    } else {
      const dt = dayjs(
        str,
        ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD'],
        true
      );
      setHoldString(str);
      if (!dt.isValid()) return;
      const newStr = dt.utc().format();
      console.log('ch d val ' + newStr);
      dispatch(ValueAction.set(path, newStr));
    }
  }
  */

  function handleChangeNumber(ev: React.FormEvent<HTMLInputElement>) {
    const str = ev.currentTarget.value;
    if (str === '') dispatch(ValueAction.set(path, null));
    else {
      const num = parseFloat(str);
      if (!isNaN(num)) {
        dispatch(ValueAction.set(path, num));
      }
    }
  }

  function handleSelectChangeNumber(ev: React.FormEvent<HTMLSelectElement>) {
    const str = ev.currentTarget.value;
    if (str === '') dispatch(ValueAction.set(path, null));
    else {
      const num = parseFloat(str);
      if (!isNaN(num)) {
        dispatch(ValueAction.set(path, num));
      }
    }
  }

  /*
  function handleCurrencyChange(ev: React.FormEvent<HTMLInputElement>) {
    let str = ev.currentTarget.value;
    if (str === "" || str == currencySymbol) {
      setHoldString("");
      dispatch(ValueAction.set(path, null));
    } else {
      const numStr = str.replace(currencySymbol, "");
      const num = parseFloat(numStr);
      const fmt = formatCurrency(num);
      const fmtNoSymbol = fmt.replace(currencySymbol, "");
      setHoldString(fmt === str || fmtNoSymbol === str ? "" : str);
      if (!isNaN(num)) {
        dispatch(ValueAction.set(path, num));
      }
    }
  }
  */

  function handleCheckChange(ev: React.ChangeEvent<HTMLInputElement>) {
    dispatch(ValueAction.set(path, ev.target['checked']));
  }

  /*
  function handleHeldBlur() {
    if (!value && holdString) dispatch(ValueAction.set(path, holdString));
    setHoldString('');
    handleBlur();
  }
  */
  function handleFocus() {
    onFocus(path);
  }

  function handleBlur() {
    onBlur(path);
  }

  function uiValue(storeVal: unknown): string {
    return schema['filter']
      ? storeVal
        ? stringFilters[schema['filter'] as string].toUi(storeVal)
        : ''
      : (storeVal || '').toString();
  }

  function schemaInput(isError: boolean) {
    const classes = (specific: string) =>
      `sf-control ${specific} ${isError && 'sf-has-error'}`;
    const readOnly = (schema['readOnly'] as boolean) || false;
    const baseProps = {
      name,
      readOnly,
      id: name,
      onFocus: handleFocus,
      onBlur: handleBlur,
    };
    const commonProps = {
      ...baseProps,
      value: (value || '').toString(),
      onChange: () => {},
      onInput: handleChange,
    };
    const selectProps = {
      ...baseProps,
      value: (value || '').toString(),
      onChange: handleSelectChange,
      disabled: baseProps.readOnly,
    };

    switch (fieldType(schema)) {
      case 'null':
        return <></>;
      case 'string':
        return (
          <UITextInput
            onInput={handleTextChange}
            value={uiValue(value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readOnly={readOnly}
            className={classes('sf-string')}
          />
        );
      case 'boolean':
        return (
          <input
            {...baseProps}
            type="checkbox"
            checked={(value || false) as boolean}
            className={classes('sf-boolean sf-checkbox')}
            onChange={handleCheckChange}
          />
        );
      case 'number':
        // eslint-disable-next-line prettier/prettier
        return (
          <NumberInput
            {...baseProps}
            value={(value || '').toString()}
            onChange={handleChangeNumber}
          />
        );
      //   case "currency":
      //     const currencyProps = {
      //       ...baseProps,
      //       value: holdString ? holdString : formatCurrency(value),
      //       onChange: () => {},
      //       onInput: handleCurrencyChange,
      //     };
      //     console.log("hold string:::" + holdString);
      //     return (
      //       <input
      //         {...currencyProps}
      //         type="text"
      //         className={classes("sf-currency")}
      //       />
      //     );
      case 'date':
        return (
          <input {...commonProps} type="date" className={classes('sf-date')} />
        );
      //   case "date-time":
      //     if (browserInfo.isIE || browserInfo.isSafari || browserInfo.isFirefox) {
      //       const val =
      //         holdString ||
      //         (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "");
      //       const textDateTimeProps = {
      //         ...baseProps,
      //         value: val,
      //         onChange: () => {},
      //         onInput: handleTextDateTimeChange,
      //         onBlur: handleHeldBlur,
      //       };
      //       return (
      //         <input
      //           {...textDateTimeProps}
      //           type="text"
      //           className={classes("sf-datetime")}
      //           placeholder="e.g. 2000-11-22 15:33:44"
      //         />
      //       );
      //     } else if (false) {
      //       return <></>;
      //     } else {
      //       const dateTimeProps = {
      //         ...baseProps,
      //         value: (value || "").toString().substring(0, 16),
      //         onChange: () => {},
      //         onInput: handleDateTimeChange,
      //       };
      //       return (
      //         <input
      //           {...dateTimeProps}
      //           type="datetime-local"
      //           className={classes("sf-datetime")}
      //         />
      //       );
      //     }
      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            className={classes('sf-email')}
          />
        );
      case 'password':
        return (
          <input
            {...commonProps}
            type="password"
            className={classes('sf-password')}
          />
        );
      case 'hidden':
        return <input {...commonProps} type="hidden" className="sf-hidden" />;
      case 'textarea':
        return (
          <TextareaSimple
            {...commonProps}
            value={uiValue(value)}
            onInput={handleTextAreaChange}
          />
        );
      case 'enum': {
        const enumText = (schema['enumText'] || schema['enum']) as (
          | string
          | number
        )[];
        if (schema['type'] === 'number')
          selectProps.onChange = handleSelectChangeNumber;
        return (
          <select {...selectProps} className={classes('sf-enum')}>
            <option key="" value=""></option>
            {(schema['enum'] as string[]).map(
              (val: string | number, idx: number) => (
                <option key={val || idx} value={val}>
                  {enumText[idx] || val}
                </option>
              )
            )}
          </select>
        );
      }
    }
    return <div>No such type</div>;
  }

  return (
    <div className="space-y-1.5">
      <Label label={caption} helpText={schema.description as string} />
      {schemaInput(false)}
    </div>
  );
};
