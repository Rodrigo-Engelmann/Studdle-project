import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signin } from './components/signin/signin';
import { Recomendacoes } from './components/recomendacoes/recomendacoes';
import { Videos } from './components/videos/videos';
import { Materiais } from './components/materiais/materiais';
import { Engine } from './components/engine/engine';

import { TabHeaderLayoutComponent } from './components/header_layout/header_layout.component'

import { UserConfigs } from './components/user-configs/user-configs'
import { ViewVideo } from './components/view-video/view-video';
import { ViewMaterial } from './components/view-material/view-material';

export const routes: Routes = [
    // tentei implementar um sistema de segurança (que o usuário não consegue entrar nas rotas até que tenha tokens), só que não consegui, então fica normal sem alterações
    //  IMPORTANTE: ler essa linha de cima e implementar quando possível, pois senão poderá ser uma brecha de segurança para o usuário (mesmo não registrado) entrar
    
    {path: '',
        component: TabHeaderLayoutComponent,
        children: [
            { path: 'recomendacoes', component: Recomendacoes },
            { path: 'videos', component: Videos },
            { path: 'materiais', component: Materiais },
            { path: 'engine', component: Engine },
            { path: '', redirectTo: 'recomendacoes', pathMatch: 'full' }
        ]
    },
    {path: 'login', component: Login},
    {path: 'signin', component: Signin},
    {path: 'watch/video', component: ViewVideo},
    {path: 'view/material', component: ViewMaterial},
    {path: 'userConfigs', component: UserConfigs},
];
