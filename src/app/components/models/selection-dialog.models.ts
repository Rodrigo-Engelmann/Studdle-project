import { DialogSize } from '../enums/dialog.enums';

export type SelectionId = number | string;

export interface SelectionItem {
  id: SelectionId;
  title: string;
  thumbnail?: string;
  subtitle?: string;
  disabled?: boolean;
}

export interface SelectionTabConfig {
  key: string;
  label: string;
  items: SelectionItem[];
  selected?: SelectionId[];
  emptyMessage?: string;
}

export interface SelectionDialogConfig {
  title: string;
  subtitle?: string;
  tabs: SelectionTabConfig[];
  confirmLabel?: string;
  cancelLabel?: string;
  size?: DialogSize;
  disableClose?: boolean;
}

export type SelectionResult = Record<string, SelectionId[]>;