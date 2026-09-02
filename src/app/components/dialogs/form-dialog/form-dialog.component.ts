// angular
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl
  , FormControl
  , FormGroup
  , ReactiveFormsModule
  , ValidationErrors
  , ValidatorFn
  , Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// common
import { DialogResultStatus, FieldType, FieldWidth } from '../../enums/dialog.enums';
import { DialogResult, FormDialogConfig, FormFieldConfig } from '../../models/dialog.models';
// import { MatIcon } from "@angular/material/icon-module.d";

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule
    , MatDialogModule
    , MatFormFieldModule
    , MatInputModule
    , MatSelectModule
    , MatCheckboxModule
    , MatRadioModule
    , MatButtonModule
    , MatIconModule
],
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})
export class FormDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<FormDialogComponent, DialogResult>>(MatDialogRef);

  protected readonly config: FormDialogConfig = inject(MAT_DIALOG_DATA);
  protected readonly form: FormGroup = this.buildForm();
  protected readonly FieldType = FieldType;
  protected readonly FieldWidth = FieldWidth;

  private buildForm(): FormGroup {
    const controls: Record<string, FormControl> = {};

    for (const field of this.config.fields) {
      controls[field.key] = new FormControl(
        { value: this.initialValue(field), disabled: field.disabled ?? false },
        this.buildValidators(field),
      );
    }

    return new FormGroup(controls);
  }

  private initialValue(field: FormFieldConfig): unknown {
    const fromModel = (this.config.model as Record<string, unknown> | undefined)?.[field.key];
    if (fromModel !== undefined && fromModel !== null)
      return fromModel;

    if (field.value !== undefined)
      return field.value;

    switch (field.type) {
      case FieldType.CHECKBOX:
        return false;
      case FieldType.MULTI_SELECT:
        return [];
      default:
        return null;
    }
  }

  private buildValidators(field: FormFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required)
      validators.push(field.type === FieldType.CHECKBOX ? Validators.requiredTrue : Validators.required);

    if (field.minLength != null) 
      validators.push(Validators.minLength(field.minLength));

    if (field.maxLength != null) 
      validators.push(Validators.maxLength(field.maxLength));

    if (field.min != null) 
      validators.push(Validators.min(field.min));

    if (field.max != null) 
      validators.push(Validators.max(field.max));

    if (field.pattern) 
      validators.push(Validators.pattern(field.pattern));

    if (field.type === FieldType.EMAIL) 
      validators.push(Validators.email);

    if (field.type === FieldType.URL) 
      validators.push(Validators.pattern(/^https:\/\/www\.youtube\.com\/watch\?v=/i));

    if (field.validators?.length) 
      validators.push(...field.validators);

    return validators;
  }

  protected errorFor(field: FormFieldConfig): string {
    const control: AbstractControl | null = this.form.get(field.key);
    const errors: ValidationErrors | null = control?.errors ?? null;
    if (!errors) return '';

    const errorKey = Object.keys(errors)[0];
    return field.errorMessages?.[errorKey] ?? this.defaultMessage(errorKey, errors[errorKey], field);
  }

  private defaultMessage(key: string, detail: any, field: FormFieldConfig): string {
    switch (key) {
      case 'required':
      case 'requiredTrue':
        return 'Preencha este campo.';
      case 'email':
        return 'Informe um e-mail válido.';
      case 'minlength':
        return `Use pelo menos ${detail.requiredLength} caracteres.`;
      case 'maxlength':
        return `Use no máximo ${detail.requiredLength} caracteres.`;
      case 'min':
        return `O valor mínimo é ${detail.min}.`;
      case 'max':
        return `O valor máximo é ${detail.max}.`;
      case 'pattern':
        return field.type === FieldType.URL ? 'URL inválida'
                                            : 'O formato informado não é aceito.';
      default:
        return 'Revise este campo.';
    }
  }
  
  protected confirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      status: DialogResultStatus.CONFIRMED,
      confirmed: true,
      data: this.form.getRawValue(),
    });
  }

  protected cancel(): void {
    this.dialogRef.close({
      status: DialogResultStatus.CANCELLED,
      confirmed: false,
    });
  }

  protected onFileSelected(event: Event, fieldKey: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.form.get(fieldKey)?.setValue(file);
    this.form.get(fieldKey)?.markAsTouched();
    this.form.get(fieldKey)?.updateValueAndValidity();
  }
}
