import { ValidatorFn } from '@angular/forms';
import {
  DialogResultStatus,
  DialogSize,
  DialogVariant,
  FieldType,
  FieldWidth,
} from '../enums/dialog.enums';

export interface SelectOption<V = unknown> {
  label: string;
  value: V;
  disabled?: boolean;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: FieldType;

  value?: unknown;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;

  options?: SelectOption[];
  rows?: number;
  width?: FieldWidth;

  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  validators?: ValidatorFn[];

  errorMessages?: Record<string, string>;
  accept?: string;
  multiple?: boolean;

  subFields?: FormFieldConfig[];
  itemLabel?: string;
  addItemLabel?: string;
  minItems?: number;
  maxItems?: number;
  singleSelectionKey?: string;
}

export interface FormDialogConfig<T = Record<string, unknown>> {
  title: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  model?: Partial<T>;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: DialogSize;
  disableClose?: boolean;
}

export interface MessageDialogConfig {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: DialogSize;
  disableClose?: boolean;
}

export interface DialogResult<T = unknown> {
  status: DialogResultStatus;
  confirmed: boolean;
  data?: T;
}
