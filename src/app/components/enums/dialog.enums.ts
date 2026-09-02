export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  URL = 'url',
  DATE = 'date',
  TIME = 'time',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file'
}

export enum DialogVariant {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  CONFIRM = 'confirm',
}

export enum DialogSize {
  SMALL = '420px',
  MEDIUM = '640px',
  LARGE = '880px',
  FULL = '95vw',
}

export enum DialogResultStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum FieldWidth {
  FULL = 'full',
  HALF = 'half',
  THIRD = 'third',
}