// angular
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

// services
import { DialogService } from '../services/dialog.service'
import { MaterialService } from '../../../app/services/materials/materials.service'

// common
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// others
import { material } from '../../../../common/material';

@Component({
  selector: 'app-mat-card',
  imports: [
    MatMenuModule
    , MatIconModule
  ],
  templateUrl: './material-card.html',
  styleUrl: './material-card.scss',
})

export class MaterialCard {
  @Output() updateData = new EventEmitter<any>();
  @Input() material!: material;

  constructor(private dialogService: DialogService
            , private materialService: MaterialService
            , private router: Router
    ) {}

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
        { key: 'title', label: 'Título', type: FieldType.TEXT, required: false },
        { key: 'summary', label: 'Resumo', type: FieldType.TEXT, required: false },
        { key: 'main_content', label: 'Conteúdo', type: FieldType.RICH_TEXT, required: false },
        { key: 'sequence', label: 'Sequência dos materiais', type: FieldType.NUMBER, required: false }
      ],
    }).subscribe((res: any) => {
      const data = res.data;
      console.log('dados:', data);
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
        console.log('updateRes:', updateRes);
        this.updateData.emit(updateRes)
      });
  }
  //#endregion
  
  //#region: delete
  deleteSelect() {
    this.materialService.delete(this.material.id).subscribe((res: any) => {
      if (res.deleted) {
        this.material.deletedMaterial = true;
        console.log("DELETAR ESS MERDA PQP")
        // this.updateData.emit(this.material);
      }
    });
  }
  //#endregion
}