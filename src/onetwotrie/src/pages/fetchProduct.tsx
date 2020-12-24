import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import FetchTheProduct from '../components/FetchTheProduct';
import { RouteComponentProps } from "react-router";

interface UserDetailPageProps extends RouteComponentProps<{
    barcode: string;
}> {}

const FetchProduct: React.FC<UserDetailPageProps> = ({match}) => {
    return (
        <IonPage>
        <IonHeader>
            <IonToolbar>
            <IonTitle>Tab 1</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
            <IonHeader collapse="condense">
            <IonToolbar>
                <IonTitle size="large">Tab 1</IonTitle>
            </IonToolbar>
            </IonHeader>
            <FetchTheProduct barcode={parseInt(match.params.barcode)} />
        </IonContent>
        </IonPage>
    );
}

export default FetchProduct;