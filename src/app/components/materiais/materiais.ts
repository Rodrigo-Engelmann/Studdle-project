// angular
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// services
import { MaterialService } from '../../services/materials/materials.service'
import { DialogService } from '../services/dialog.service'
import { FilterDataService } from '../services/filterData.service';
import { UserDataBridgeService } from '../services/userData-bridge.service';

// components
import { MaterialCard } from '../material-card/material-card';

// others
import { material } from '../../../../common/material';
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'
import { firstValueFrom, takeUntil, Subject } from 'rxjs';

// search
import Fuse from 'fuse.js';

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
  userData: any = undefined;

  private destroy$ = new Subject<void>();

  constructor(private dialogService: DialogService
            , private materialService: MaterialService
            , private filterDataService: FilterDataService
            , private userDataBridgeService: UserDataBridgeService
  ) {}

  ngOnInit(): void {
    this.loadMaterials();

    this.filterDataService.FilterData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filterData => {
        this.updateFilterData(filterData);
    });

    this.userDataBridgeService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bridgeUserData: any) => {
        this.userData = bridgeUserData;
    });
  }

  async updateFilterData(filterDataList: any): Promise<void> {
    if (!filterDataList?.length)
      return;
    
    const filterData: any = filterDataList.find((filter: any) => filter.pageIndex === 2);
    if (!filterData && this.materials.length)
      return;

    this.materials = [];
    this.isLoading = true;
    let newVideoData: any[] = [];
    if (filterData.selectedModule?.id === -1 || !filterData.selectedModule) {
      newVideoData = await firstValueFrom(this.materialService.findAll());
    } else
      newVideoData = await firstValueFrom(this.materialService.getMaterialsByModule(filterData.selectedModule.id));

    if (filterData.selectedCategory !== -1 && filterData.selectedCategory)
      newVideoData = newVideoData.filter((vid:any) => vid.task_id === filterData.selectedCategory);
    
    if (filterData.searchQuery && filterData.searchQuery !== '') {
      const fuse = new Fuse(newVideoData, {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'summary', weight: 0.3 },
          { name: 'main_content', weight: 0.05 }
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2
      });

      const resultados = fuse.search(filterData.searchQuery);
      
      newVideoData = resultados.map((r: any) => r.item);
    }

    this.isLoading = false;
    this.materials = newVideoData;
  }

  async loadMaterials() {
    await this.materialService.findAll().subscribe((res: any) => {
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
        { key: 'title', label: 'Título', type: FieldType.TEXT, required: true, maxLength: 100 },
        { key: 'summary', label: 'Resumo', type: FieldType.TEXT, required: true, maxLength: 250 },
        { key: 'main_content', label: 'Conteúdo', type: FieldType.RICH_TEXT, required: true },
        { key: 'sequence', label: 'Sequência dos materiais', type: FieldType.NUMBER, required: true }
      ],
    }).subscribe((res: any) => {
      if (!res.confirmed)
        return;

      const data = res.data;
      this.materialService.uploadImage(data.main_image)
      .subscribe((uploadRes) => {
        data.main_image = uploadRes.path;
        data.link = data.title.replaceAll(' ', '') + data.sequence;

        this.materialService.create(data).subscribe((postRes: any) => {
          this.materials.push(postRes);
        });
      });
    });
  }

  updateSingular(event: any): void {
    const index: number = this.materials.findIndex((v)=>v.id===event.id)
    if (event.deletedMaterial) {
      this.materials.splice(index,1);
      return;
    }

    this.materials[index] = event;
  }
}

