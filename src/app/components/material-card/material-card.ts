// angular
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

// services
import { DialogService } from '../services/dialog.service'
import { MaterialService } from '../../../app/services/materials/materials.service'
import { UserDataBridgeService } from '../services/userData-bridge.service';

// common
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// others
import { material } from '../../../../common/material';
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-mat-card',
  imports: [
    MatMenuModule
    , MatIconModule
  ],
  templateUrl: './material-card.html',
  styleUrl: './material-card.scss',
})

export class MaterialCard implements OnInit {
  @Output() updateData = new EventEmitter<any>();
  @Input() material!: material;
  
  userData: any = undefined;

  private destroy$ = new Subject<void>();

  constructor(private dialogService: DialogService
            , private materialService: MaterialService
            , private router: Router
            , private sanitizer: DomSanitizer
            , private userDataBridgeService: UserDataBridgeService
  ) {}

  get thumbnailVar() {
    return this.sanitizer.bypassSecurityTrustStyle(
      `url(http://localhost:3000${this.material.main_image})`
    );
  }

  ngOnInit(): void {
    this.userDataBridgeService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bridgeUserData: any) => {
        this.userData = bridgeUserData;
    });
  }

  openMaterial(): void {
    const url = 'view/material/'+this.material.link;
    this.router.navigate([url]);
  }

  //#region: update
  settingsSelect() {
    this.dialogService.openForm<any>({
      title: 'Atualizar Material Didático',
      size: DialogSize.LARGE,
      model: {
        main_image: this.material.main_image,
        title: this.material.title,
        summary: this.material.summary,
        main_content: this.material.main_content,
        sequence: this.material.sequence
      },
      fields: [
        { key: 'main_image', label: 'Imagem principal', type: FieldType.FILE, required: true, width: FieldWidth.HALF },
        { key: 'title', label: 'Título', type: FieldType.TEXT, required: true, maxLength: 100  },
        { key: 'summary', label: 'Resumo', type: FieldType.TEXT, required: true, maxLength: 250  },
        { key: 'main_content', label: 'Conteúdo', type: FieldType.RICH_TEXT, required: true },
        { key: 'sequence', label: 'Sequência dos materiais', type: FieldType.NUMBER, required: true }
      ],
    }).subscribe((res: any) => {
      if (!res.confirmed)
        return;

      const data = res.data;
      if (data.main_image instanceof File) {
        this.materialService.uploadImage(data.main_image)
          .subscribe((uploadRes) => {
            data.main_image = uploadRes.path;

            this.updateMaterial(data)
          });
      } else {
        data.main_image = this.material.main_image;

        this.updateMaterial(data)
      }
    });
  }

  updateMaterial(data: any): void {
    this.materialService.update(this.material.id, data)
      .subscribe((updateRes: any) => {
        this.updateData.emit(updateRes)
      });
  }
  //#endregion
  
  //#region: delete
  deleteSelect() {
    const confirmDelete = confirm('Tem certeza que deseja excluir este conteúdo?');
    if (!confirmDelete)
      return;

    this.materialService.delete(this.material.id).subscribe((res: any) => {
      if (res.deleted) {
        this.material.deletedMaterial = true;
        this.updateData.emit(this.material);
      }
    });
  }
  //#endregion
}