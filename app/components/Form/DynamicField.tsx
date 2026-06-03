import React from 'react';
import { ApplicationField } from '@/types';
import { ClayTextInput } from './ClayTextInput';
import { ClayDropdown } from './ClayDropdown';
import { ClayCheckbox } from './ClayCheckbox';
import { ClayFileUpload } from './ClayFileUpload';

interface DynamicFieldProps {
  field: ApplicationField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error }) => {
  const labelWithRequired = `${field.label}${field.required ? ' *' : ''}`;

  switch (field.type) {
    case 'text':
      return (
        <ClayTextInput
          label={labelWithRequired}
          value={value || ''}
          onChangeText={onChange}
          error={error}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      );
    case 'dropdown':
      return (
        <ClayDropdown
          label={labelWithRequired}
          value={value || ''}
          options={field.options || []}
          onChange={onChange}
          error={error}
          placeholder={`Select ${field.label.toLowerCase()}`}
        />
      );
    case 'checkbox':
      return (
        <ClayCheckbox
          label={labelWithRequired}
          checked={!!value}
          onChange={onChange}
          error={error}
        />
      );
    case 'file':
      return (
        <ClayFileUpload
          label={labelWithRequired}
          value={value || null}
          onChange={onChange}
          error={error}
        />
      );
    default:
      return null;
  }
};
