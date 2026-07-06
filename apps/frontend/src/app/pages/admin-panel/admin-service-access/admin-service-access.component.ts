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

interface AccessUser {
  id: string;
  username: string;
  email: string;
  userType: string;
  hasCredentials: boolean;
}

type AccessMode = 'grant' | 'revoke';

@Component({
  selector: 'app-admin-service-access',
  templateUrl: './admin-service-access.component.html',
  styleUrls: ['./admin-service-access.component.css'],
  imports: [FormsModule, CommonModule, TranslateModule, ConfirmDialogComponent],
})
export class AdminServiceAccessComponent implements OnInit {
  services: SsoService[] = [];
  users: AccessUser[] = [];
  mode: AccessMode = 'grant';
  selectedService = '';
  targetUser = '';
  confirmOpen = false;

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

  get selectedUser(): AccessUser | undefined {
    return this.users.find((u) => u.username === this.targetUser);
  }

  get isAdminSelected(): boolean {
    return this.selectedUser?.userType === 'admin';
  }

  setMode(mode: AccessMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.selectedService = '';
    this.targetUser = '';
    this.users = [];
  }

  async onServiceChange() {
    this.targetUser = '';
    this.users = [];
    if (!this.selectedService) return;
    try {
      this.users =
        (this.mode === 'grant'
          ? await this.adminService.getUsersWithoutAccess(this.selectedService)
          : await this.adminService.getUsersWithAccess(this.selectedService)) ??
        [];
    } catch {
      this.toastr.error(this.translate.instant('ADMIN.USERS_LOAD_FAILED'));
    }
  }

  roleLabelKey(userType: string): string {
    return userType === 'admin'
      ? 'ADMIN.USER_TYPE_ADMIN'
      : 'ADMIN.USER_TYPE_USER';
  }

  onSubmit() {
    this.confirmOpen = true;
  }

  onCancelConfirm() {
    this.confirmOpen = false;
  }

  onConfirm() {
    if (this.mode === 'grant') {
      this.onConfirmGrant();
    } else {
      this.onConfirmRevoke();
    }
  }

  async onConfirmGrant() {
    this.confirmOpen = false;

    const response = await this.adminService.grantAccess({
      service: this.selectedService,
      targetUser: this.targetUser,
    });

    if (response?.responseCode === RESPONSE_CODES.AUTH.USER_NOT_FOUND) {
      this.toastr.error(this.translate.instant('ADMIN.TARGET_USER_NOT_FOUND'));
    } else if (
      response?.responseCode === RESPONSE_CODES.AUTH.USER_ALREADY_HAS_ACCESS
    ) {
      this.toastr.error(this.translate.instant('ADMIN.USER_ALREADY_HAS_ACCESS'));
    } else if (response?.success) {
      this.toastr.success(
        this.translate.instant('ADMIN.ACCESS_GRANTED', {
          username: this.targetUser,
        }),
      );
      this.selectedService = '';
      await this.onServiceChange();
    } else {
      this.toastr.error(this.translate.instant('ADMIN.ACCESS_GRANT_FAILED'));
    }
  }

  async onConfirmRevoke() {
    this.confirmOpen = false;

    const response = await this.adminService.revokeAccess({
      service: this.selectedService,
      targetUser: this.targetUser,
    });

    if (response?.responseCode === RESPONSE_CODES.AUTH.USER_NOT_FOUND) {
      this.toastr.error(this.translate.instant('ADMIN.TARGET_USER_NOT_FOUND'));
    } else if (
      response?.responseCode === RESPONSE_CODES.AUTH.USER_DOES_NOT_HAVE_ACCESS
    ) {
      this.toastr.error(
        this.translate.instant('ADMIN.USER_DOES_NOT_HAVE_ACCESS'),
      );
    } else if (response?.success) {
      this.toastr.success(
        this.translate.instant('ADMIN.ACCESS_REVOKED', {
          username: this.targetUser,
        }),
      );
      this.selectedService = '';
      await this.onServiceChange();
    } else {
      this.toastr.error(this.translate.instant('ADMIN.ACCESS_REVOKE_FAILED'));
    }
  }
}
