// angular
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { Route, Router } from '@angular/router';

// services
import { MaterialService } from '../../services/materials/materials.service'
import { DialogService } from '../services/dialog.service'

// components
import { MaterialCard } from '../material-card/material-card';

// others
import { material } from '../../../../common/material';
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

@Component({
  selector: 'app-materiais',
  standalone: true,
  imports: [
    MaterialCard
    , MatIconModule
    , MatProgressSpinnerModule
  ],
  templateUrl: './materiais.html',
  styleUrl: './materiais.scss',
})
export class Materiais implements OnInit {
  materials: material[] = [];
  isLoading: boolean = true;

  constructor(private dialogService: DialogService
            , private materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  async loadMaterials() {
    await this.materialService.findAll().subscribe((res: any) => {
      console.log("load: ", res)
      res.map((a: any)=>this.materials.push(a));
      this.isLoading = false;
    });
  }

  // main_image
  // summary
  // main_content
  // sequence
  async newMaterialDialog() {
    this.dialogService.openForm<any>({
      title: 'Criar Material Didático',
      size: DialogSize.LARGE,
      fields: [
        { key: 'main_image', label: 'Imagem principal', type: FieldType.FILE, required: true, width: FieldWidth.HALF },
        { key: 'title', label: 'Título', type: FieldType.TEXT, required: false, min: 1, max: 100 },
        { key: 'summary', label: 'Resumo', type: FieldType.TEXT, required: false, min: 50, max: 250 },
        { key: 'main_content', label: 'Conteúdo', type: FieldType.TEXTAREA, required: false },
        { key: 'sequence', label: 'Sequência dos materiais', type: FieldType.NUMBER, required: false }
      ],
    }).subscribe((res: any) => {
      const data = res.data;
      this.materialService.uploadImage(data.main_image)
      .subscribe((uploadRes) => {
          // Agora temos o caminho da imagem
          data.main_image = uploadRes.path;

          // Aqui você usa sua rota CREATE genérica normalmente
          this.materialService.create(data).subscribe((postRes: any) => {
              this.materials.push(postRes);
            });
        });
    });
  }
}

