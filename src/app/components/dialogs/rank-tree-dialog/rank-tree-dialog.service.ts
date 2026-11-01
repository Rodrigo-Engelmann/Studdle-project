import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';

import { RankTreeDialogComponent } from './rank-tree-dialog/rank-tree-dialog.component';
import { TreeNode, TreeNodeAction } from './models/tree-node.model';

@Injectable({ providedIn: 'root' })
export class RankTreeDialogService {
  private dialogRef?: MatDialogRef<RankTreeDialogComponent>;
  private readonly dataSubject = new BehaviorSubject<TreeNode[]>([]);

  constructor(private readonly dialog: MatDialog) {}

  open(ranks: TreeNode[]): Observable<TreeNodeAction> {
    this.dataSubject.next(ranks);

    this.dialogRef = this.dialog.open(RankTreeDialogComponent, {
      width: '480px',
      maxHeight: '85vh',
      autoFocus: false,
      data: this.dataSubject.asObservable(),
    });

    return this.dialogRef.componentInstance.action$;
  }

  updateData(ranks: TreeNode[]): void {
    this.dataSubject.next(ranks);
  }

  close(): void {
    this.dialogRef?.close();
  }
}
