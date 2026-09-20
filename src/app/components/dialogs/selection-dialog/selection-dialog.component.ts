// angular
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// common
import { DialogResultStatus } from '../../enums/dialog.enums';
import { DialogResult } from '../../models/dialog.models';
import {
  SelectionDialogConfig
  , SelectionId
  , SelectionItem
  , SelectionResult
  , SelectionTabConfig
} from '../../models/selection-dialog.models';

@Component({
  selector: 'app-selection-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule
    , MatTabsModule
    , MatCheckboxModule
    , MatButtonModule
    , MatIconModule
  ],
  templateUrl: './selection-dialog.component.html',
  styleUrls: ['./selection-dialog.component.scss']
})
export class SelectionDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<SelectionDialogComponent, DialogResult<SelectionResult>>>(MatDialogRef);

  protected readonly config: SelectionDialogConfig = inject(MAT_DIALOG_DATA);

  private readonly selection = new Map<string, Set<SelectionId>>();

  constructor() {
    for (const tab of this.config.tabs)
      this.selection.set(tab.key, new Set(tab.selected ?? []));
  }

  protected isSelected(tab: SelectionTabConfig, item: SelectionItem): boolean {
    return this.selection.get(tab.key)!.has(item.id);
  }

  protected toggle(tab: SelectionTabConfig, item: SelectionItem): void {
    if (item.disabled)
      return;

    const selected = this.selection.get(tab.key)!;

    if (selected.has(item.id))
      selected.delete(item.id);
    else
      selected.add(item.id);
  }

  protected countOf(tab: SelectionTabConfig): number {
    return this.selection.get(tab.key)!.size;
  }

  protected confirm(): void {
    const data: SelectionResult = {};
    for (const [key, ids] of this.selection)
      data[key] = [...ids];

    this.dialogRef.close({
      status: DialogResultStatus.CONFIRMED,
      confirmed: true,
      data,
    });
  }

  protected cancel(): void {
    this.dialogRef.close({
      status: DialogResultStatus.CANCELLED,
      confirmed: false,
    });
  }
}