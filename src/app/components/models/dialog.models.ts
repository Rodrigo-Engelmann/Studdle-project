import { ValidatorFn } from '@angular/forms';
import {
  DialogResultStatus,
  DialogSize,
  DialogVariant,
  FieldType,
  FieldWidth,
} from '../enums/dialog.enums';

/** Opção de um <mat-select> ou de um grupo de radio. */
export interface SelectOption<V = unknown> {
  label: string;
  value: V;
  disabled?: boolean;
}

/**
 * Descrição de UM campo do formulário.
 * É o "objeto" que vira um FormControl + um input na tela.
 */
export interface FormFieldConfig {
  /** Nome do controle no FormGroup e chave no objeto retornado. */
  key: string;
  /** Texto do rótulo mostrado ao usuário. */
  label: string;
  type: FieldType;

  /** Valor inicial (usado quando não vier nada no `model` do dialog). */
  value?: unknown;
  placeholder?: string;
  /** Texto de ajuda abaixo do campo. */
  hint?: string;
  disabled?: boolean;

  /** Obrigatório para SELECT, MULTI_SELECT e RADIO. */
  options?: SelectOption[];
  /** Linhas do TEXTAREA (padrão 4). */
  rows?: number;
  /** Largura no grid de 12 colunas (padrão: FULL). */
  width?: FieldWidth;

  // ---- Validações declarativas ----
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  /** Validators extras do Angular, para regras que fogem do padrão. */
  validators?: ValidatorFn[];
  /**
   * Mensagens customizadas por chave de erro.
   * Ex.: { required: 'Informe o título do vídeo', pattern: 'URL inválida' }
   */
  errorMessages?: Record<string, string>;
  // paradas para o input de file:
  accept?: string;
  multiple?: boolean;
}

/** Configuração completa do dialog de formulário. */
export interface FormDialogConfig<T = Record<string, unknown>> {
  title: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  /** Objeto com os valores atuais — é o que transforma o dialog em "editar". */
  model?: Partial<T>;
  /** Texto do botão de confirmação (padrão: "Salvar"). */
  confirmLabel?: string;
  /** Texto do botão de cancelamento (padrão: "Cancelar"). */
  cancelLabel?: string;
  size?: DialogSize;
  /** Impede fechar clicando fora / com ESC (padrão: true em formulários). */
  disableClose?: boolean;
}

/** Configuração do dialog de mensagem / confirmação. */
export interface MessageDialogConfig {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  /** Se ficar `undefined`, o dialog mostra apenas o botão de confirmação. */
  cancelLabel?: string;
  size?: DialogSize;
  disableClose?: boolean;
}

/**
 * Retorno padronizado de QUALQUER dialog do sistema.
 * `confirmed` é atalho para `status === DialogResultStatus.CONFIRMED`.
 */
export interface DialogResult<T = unknown> {
  status: DialogResultStatus;
  confirmed: boolean;
  data?: T;
}
