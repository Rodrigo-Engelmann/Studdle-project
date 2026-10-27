// angular
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl
  , FormControl
  , FormGroup
  , ReactiveFormsModule
  , ValidationErrors
  , ValidatorFn
  , Validators
  , FormArray
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// ckeditor5 (biblioteca pra textos dos materiais didáticos)
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
  ClassicEditor
  , Essentials
  , Paragraph
  , Heading
  , Bold
  , Italic
  , Underline
  , Strikethrough
  , Font
  , Alignment
  , List
  , Link
  , Table
  , TableToolbar
  , BlockQuote
  , Image
  , ImageToolbar
  , ImageCaption
  , ImageStyle
  , ImageResize
  , ImageUpload
  , Base64UploadAdapter
} from 'ckeditor5';

// common
import { DialogResultStatus, FieldType, FieldWidth } from '../../enums/dialog.enums';
import { DialogResult, FormDialogConfig, FormFieldConfig } from '../../models/dialog.models';
// import { MatIcon } from "@angular/material/icon-module.d";

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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
    , CKEditorModule
  ],
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})
export class FormDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<FormDialogComponent, DialogResult>>(MatDialogRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly config: FormDialogConfig = inject(MAT_DIALOG_DATA);
  protected readonly form: FormGroup = this.buildForm();
  protected readonly FieldType = FieldType;
  protected readonly FieldWidth = FieldWidth;
  protected characterCount(fieldKey: string): number {
    const value = this.form.get(fieldKey)?.value;
    return typeof value === 'string' ? value.length : 0;
  }
  protected groupList(field: FormFieldConfig): FormArray<FormGroup> {
    return this.form.get(field.key) as FormArray<FormGroup>;
  }

  protected canAdd(field: FormFieldConfig): boolean {
    return field.maxItems == null || this.groupList(field).length < field.maxItems;
  }

  protected canRemove(field: FormFieldConfig): boolean {
    return this.groupList(field).length > (field.minItems ?? 0);
  }

  protected addItem(field: FormFieldConfig): void {
    const array = this.groupList(field);
    const group = this.buildItemGroup(field, {});

    array.push(group);
    if (field.singleSelectionKey)
      this.wireSingleSelection(field, array, group);
  }

  protected removeItem(field: FormFieldConfig, index: number): void {
    this.groupList(field).removeAt(index);
  }

  protected subError(field: FormFieldConfig, index: number, sub: FormFieldConfig): string {
    return this.errorForControl(this.groupList(field).at(index).get(sub.key), sub);
  }

  protected arrayError(field: FormFieldConfig): string {
    const array = this.form.get(field.key);
    if (!array?.errors)
      return '';

    const errorKey = Object.keys(array.errors)[0];
    const detail = array.errors[errorKey];

    if (field.errorMessages?.[errorKey])
      return field.errorMessages[errorKey];

    switch (errorKey) {
      case 'minItems':
        return `Informe pelo menos ${detail.required} ${(field.itemLabel ?? 'item').toLowerCase()}(ns).`;
      case 'maxItems':
        return `O máximo é ${detail.allowed}.`;
      case 'singleSelection':
        return 'Marque uma opção como correta.';
      default:
        return 'Revise os itens desta lista.';
    }
  }
  protected errorFor(field: FormFieldConfig): string {
    return this.errorForControl(this.form.get(field.key), field);
  }

  private errorForControl(control: AbstractControl | null, field: FormFieldConfig): string {
    const errors: ValidationErrors | null = control?.errors ?? null;
    if (!errors)
      return '';

    const errorKey = Object.keys(errors)[0];
    return field.errorMessages?.[errorKey] ?? this.defaultMessage(errorKey, errors[errorKey], field);
  }

  // coisas do 'rich text'
  public Editor = ClassicEditor;
  public editorConfig = {
    licenseKey: 'GPL',
    plugins: [
      Essentials,
      Paragraph,
      Heading,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Font,
      Alignment,
      List,
      Link,
      Table,
      TableToolbar,
      BlockQuote,
      Image,
      ImageToolbar,
      ImageCaption,
      ImageStyle,
      ImageResize,
      ImageUpload,
      Base64UploadAdapter
    ],
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'resizeImage'
      ]
    },
    toolbar: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'alignment',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'link',
      'insertTable',
      'uploadImage',
      'blockQuote'
    ]
  };

  private buildForm(): FormGroup {
    const controls: Record<string, AbstractControl> = {};
    for (const field of this.config.fields) {
      controls[field.key] = field.type === FieldType.GROUP_LIST
                          ? this.buildGroupList(field)
                          : this.buildControl(field, this.initialValue(field));
    }

    return new FormGroup(controls);
  }

  private buildControl(field: FormFieldConfig, value: unknown): FormControl {
    return new FormControl(
      { value, disabled: field.disabled ?? false },
      this.buildValidators(field),
    );
  }

  private buildGroupList(field: FormFieldConfig): FormArray<FormGroup> {
    const items = (this.initialValue(field) as Record<string, unknown>[] | null) ?? [];

    const array = new FormArray<FormGroup>(
      items.map((item) => this.buildItemGroup(field, item)),
      this.buildArrayValidators(field),
    );

    // garante o mínimo de itens já na abertura (ex.: 2 alternativas em branco)
    while (array.length < (field.minItems ?? 0))
      array.push(this.buildItemGroup(field, {}));

    if (field.singleSelectionKey)
      array.controls.forEach((g) => this.wireSingleSelection(field, array, g));

    return array;
  }

  private buildItemGroup(field: FormFieldConfig, item: Record<string, unknown>): FormGroup {
    const controls: Record<string, FormControl> = {};

    for (const sub of field.subFields ?? []) {
      const raw = item[sub.key];
      const value = raw !== undefined && raw !== null ? raw
                                                      : (sub.value ?? this.defaultValue(sub));
      controls[sub.key] = this.buildControl(sub, value);
    }

    return new FormGroup(controls);
  }

  private initialValue(field: FormFieldConfig): unknown {
    const fromModel = (this.config.model as Record<string, unknown> | undefined)?.[field.key];
    if (fromModel !== undefined && fromModel !== null)
      return fromModel;

    if (field.value !== undefined)
      return field.value;

    return this.defaultValue(field);
  }

  private defaultValue(field: FormFieldConfig): unknown {
    switch (field.type) {
      case FieldType.CHECKBOX:
        return false;
      case FieldType.MULTI_SELECT:
      case FieldType.GROUP_LIST:
        return [];
      default:
        return null;
    }
  }

  private buildArrayValidators(field: FormFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.minItems != null) {
      validators.push((control) =>
        (control as FormArray).length >= field.minItems!
          ? null
          : { minItems: { required: field.minItems } });
    }

    if (field.maxItems != null) {
      validators.push((control) =>
        (control as FormArray).length <= field.maxItems!
          ? null
          : { maxItems: { allowed: field.maxItems } });
    }

    if (field.singleSelectionKey) {
      validators.push((control) => {
        const selected = (control as FormArray<FormGroup>).controls
          .filter((g) => !!g.get(field.singleSelectionKey!)?.value).length;
        return selected === 1 ? null : { singleSelection: true };
      });
    }

    return validators;
  }

  private wireSingleSelection(field: FormFieldConfig, array: FormArray<FormGroup>, group: FormGroup): void {
    const key = field.singleSelectionKey!;

    group.get(key)?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((checked) => {
      if (!checked)
        return;

      for (const other of array.controls) {
        if (other !== group)
          other.get(key)?.setValue(false, { emitEvent: false });
      }

      array.updateValueAndValidity({ emitEvent: false });
    });
  }

  private buildValidators(field: FormFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required) {
      validators.push(
        field.type === FieldType.CHECKBOX
          ? Validators.requiredTrue
          : field.type === FieldType.RICH_TEXT
            ? this.richTextRequired()
            : Validators.required,
      );
    }

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

  // sistema pra verificar a ausência de informação dentro do rich_text
  private richTextRequired(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const html = String(control.value ?? '');

      const text = html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\u00A0/g, ' ')
        .trim();

      const hasMedia = /<(img|video|audio|iframe|embed|table)\b/i.test(html);

      return text || hasMedia ? null : { required: true };
    };
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
