import { Component, OnInit } from '@angular/core';
import { AdminPanelService } from '../admin-panel.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RESPONSE_CODES } from '../../../config/response-codes.const';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

interface SsoService {
  name: string;
  label: string;
  requiresEmail: boolean;
  supportsAutoRegister: boolean;
}

interface SelectableUser {
  id: string;
  username: string;
  email: string;
}

@Component({
  selector: 'app-admin-add-credentials',
  templateUrl: './admin-add-credentials.component.html',
  styleUrls: ['./admin-add-credentials.component.css'],
  imports: [FormsModule, CommonModule, TranslateModule, ConfirmDialogComponent],
})
export class AdminAddCredentialsComponent implements OnInit {
  services: SsoService[] = [];
  users: SelectableUser[] = [];
  selectedService = '';
  autoRegister = true;
  confirmOpen = false;

  credentials: {
    username: string;
    password: string;
    email: string;
    targetUser: string;
  } = {
    username: '',
    password: '',
    email: '',
    targetUser: '',
  };

  constructor(
    private adminService: AdminPanelService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {}

  async ngOnInit() {
    try {
      this.services = (await this.adminService.getAvailableServices()) ?? [];
    } catch {
      this.toastr.error(this.translate.instant('ADMIN.SERVICES_LOAD_FAILED'));
    }
  }

  get currentService(): SsoService | undefined {
    return this.services.find((s) => s.name === this.selectedService);
  }

  serviceRequiresEmail(): boolean {
    return !!this.currentService?.requiresEmail;
  }

  async onServiceChange() {
    this.credentials = {
      username: '',
      password: '',
      email: '',
      targetUser: '',
    };
    this.autoRegister = true;
    this.users = [];
    if (!this.selectedService) return;
    try {
      this.users =
        (await this.adminService.getUsersWithoutCredential(
          this.selectedService,
        )) ?? [];
    } catch {
      this.toastr.error(this.translate.instant('ADMIN.USERS_LOAD_FAILED'));
    }
  }

  onSubmit() {
    this.confirmOpen = true;
  }

  onCancelConfirm() {
    this.confirmOpen = false;
  }

  async onConfirmSave() {
    this.confirmOpen = false;

    const response = await this.adminService.registerCredential({
      service: this.selectedService,
      targetUser: this.credentials.targetUser,
      autoRegister: this.autoRegister,
      username: this.autoRegister ? undefined : this.credentials.username,
      password: this.autoRegister ? undefined : this.credentials.password,
      email: this.serviceRequiresEmail() ? this.credentials.email : undefined,
    });

    if (response?.responseCode === RESPONSE_CODES.AUTH.USER_NOT_FOUND) {
      this.toastr.error(this.translate.instant('ADMIN.TARGET_USER_NOT_FOUND'));
    } else if (
      response?.responseCode ===
      RESPONSE_CODES.CREDENTIALS.CREDENTIALS_ALREADY_EXIST
    ) {
      this.toastr.error(
        this.translate.instant('ADMIN.CREDENTIALS_ALREADY_EXIST'),
      );
    } else if (
      response?.responseCode ===
      RESPONSE_CODES.CREDENTIALS.JELLYFIN_USER_CREATION_FAILED
    ) {
      this.toastr.error(
        this.translate.instant('ADMIN.JELLYFIN_CREATION_FAILED'),
      );
    } else if (
      response?.responseCode ===
        RESPONSE_CODES.CREDENTIALS.SERVICE_REGISTRATION_FAILED ||
      response?.responseCode ===
        RESPONSE_CODES.CREDENTIALS.ADMIN_SERVICE_CREDENTIALS_MISSING
    ) {
      this.toastr.error(this.translate.instant('ADMIN.REGISTRATION_FAILED'));
    } else {
      this.toastr.success(this.translate.instant('ADMIN.CREDENTIALS_SAVED'));
      this.selectedService = '';
      await this.onServiceChange();
    }
  }
}
