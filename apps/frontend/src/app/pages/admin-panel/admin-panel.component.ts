import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { BackgroundComponent } from '../../components/background/background.component';
import { CommonModule, NgIf } from '@angular/common';
import { AdminAddUserComponent } from "./admin-add-user/admin-add-user.component";
import { AdminAddCredentialsComponent } from './admin-add-credentials/admin-add-credentials.component';
import { UserProfileCircleComponent } from '../../components/user-profile-circle/user-profile-circle.component';

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.css'],
    imports: [FooterComponent, BackgroundComponent, NgIf, CommonModule, AdminAddUserComponent, AdminAddCredentialsComponent, UserProfileCircleComponent],
    standalone: true
})
export class AdminPanelComponent {
    selectedSection: 'add-user' | 'credentials' | 'access' = 'add-user';

    selectSection(section: 'add-user' | 'credentials' | 'access') {
        this.selectedSection = section;
    }
}
