import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { add, addCircle, ellipse, home, information, informationCircleOutline, square, triangle } from 'ionicons/icons';
import FetchProduct from './pages/fetchProduct';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
/* import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css'; */

/* Theme variables */
import './theme/variables.css';
import { addIcons } from 'ionicons';

export default function App () {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          
          <IonRouterOutlet>
            <Route path="/" component={Home} exact={true} />
            <Route path="/product/:barcode" component={FetchProduct} />
          </IonRouterOutlet>
  
          <IonTabBar slot="bottom">
            <IonTabButton tab="informations" href="/about">
              <IonIcon icon={information} />
              <IonLabel>À propos</IonLabel>
            </IonTabButton>
            <IonTabButton tab="accueil" href="/">
              <IonIcon icon={home} />
              <IonLabel>Accueil</IonLabel>
            </IonTabButton>
            <IonTabButton tab="suggest" href="/suggest">
              <IonIcon icon={add} />
              <IonLabel>Contribuer</IonLabel>
            </IonTabButton>
          </IonTabBar>
  
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
} 
