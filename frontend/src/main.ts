import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// o bootstrapApplication é a função que "dá a partida" no Angular no navegador
// AppComponent = é o componente raiz da aplicação
// appConfig = é a configuração da aplicação
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
