import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { FormDialogComponent } from '../dialogs/form-dialog/form-dialog.component';
import { MessageDialogComponent } from '../dialogs/message-dialog/message-dialog.component';
import { DialogResultStatus, DialogSize, DialogVariant } from '../enums/dialog.enums';
import {
  DialogResult,
  FormDialogConfig,
  FormFieldConfig,
  MessageDialogConfig,
} from '../models/dialog.models';
import { inferFields } from '../utils/field-inference.util';

/** Resultado usado quando o dialog é fechado por fora (ESC, clique no backdrop). */
const CANCELLED: DialogResult<never> = {
  status: DialogResultStatus.CANCELLED,
  confirmed: false,
};

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);

  //#region Formulário

  /**
   * Abre o formulário genérico.
   *
   * @typeParam T formato do objeto devolvido em `result.data`
   */
  openForm<T extends Record<string, unknown>>(
    config: FormDialogConfig<T>,
  ): Observable<DialogResult<T>> {
    return this.dialog
      .open<FormDialogComponent, FormDialogConfig<T>, DialogResult<T>>(FormDialogComponent, {
        data: config,
        width: config.size ?? DialogSize.MEDIUM,
        maxWidth: '95vw',
        maxHeight: '90vh',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        // formulário não fecha por acidente: evita perder o que foi digitado
        disableClose: config.disableClose ?? true,
      })
      .afterClosed()
      .pipe(map((result) => result ?? (CANCELLED as DialogResult<T>)));
  }

  /**
   * Atalho: monta os campos a partir de um objeto e já abre o formulário.
   * Ideal para CRUDs simples e protótipos.
   */
  openFormFromModel<T extends Record<string, unknown>>(
    title: string,
    model: T,
    overrides: Record<string, Partial<FormFieldConfig>> = {},
    extra: Partial<Omit<FormDialogConfig<T>, 'title' | 'fields' | 'model'>> = {},
  ): Observable<DialogResult<T>> {
    return this.openForm<T>({
      title,
      fields: inferFields(model, overrides),
      model,
      ...extra,
    });
  }
  //#regionend

  
  //#region Mensagens
  openMessage(config: MessageDialogConfig): Observable<DialogResult<void>> {
    return this.dialog
      .open<MessageDialogComponent, MessageDialogConfig, DialogResult<void>>(
        MessageDialogComponent,
        {
          data: config,
          width: config.size ?? DialogSize.SMALL,
          maxWidth: '95vw',
          autoFocus: 'first-tabbable',
          restoreFocus: true,
          disableClose: config.disableClose ?? false,
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? CANCELLED));
  }

  /** Confirmação - emite `true` só quando o usuário clica no botão principal. */
  confirm(
    title: string,
    message: string,
    options: Partial<Omit<MessageDialogConfig, 'title' | 'message'>> = {},
  ): Observable<boolean> {
    return this.openMessage({
      title,
      message,
      variant: DialogVariant.CONFIRM,
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      ...options,
    }).pipe(map((result) => result.confirmed));
  }

  info(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.INFO });
  }

  success(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.SUCCESS });
  }

  warning(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.WARNING });
  }

  error(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.ERROR });
  }
  //#regionend
}
