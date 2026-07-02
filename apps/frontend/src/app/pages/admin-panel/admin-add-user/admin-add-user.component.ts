import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminPanelService } from '../admin-panel.service';
import { ToastrService } from 'ngx-toastr';
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
  userType: string;
}

type UserMode = 'create' | 'delete';

@Component({
  selector: 'app-admin-add-user',
  templateUrl: './admin-add-user.component.html',
  styleUrls: ['./admin-add-user.component.css'],
  imports: [FormsModule, CommonModule, TranslateModule, ConfirmDialogComponent],
})
export class AdminAddUserComponent implements OnInit {
  mode: UserMode = 'create';
  username = '';
  password = '';
  confirmPassword = '';
  email = '';
  usertype = 'user';
  services: SsoService[] = [];
  selectedServices: Record<string, boolean> = {};
  users: SelectableUser[] = [];
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
      for (const service of this.services) {
        this.selectedServices[service.name] = false;
      }
    } catch {
      this.toastr.error(this.translate.instant('ADMIN.SERVICES_LOAD_FAILED'));
    }
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  get selectedUser(): SelectableUser | undefined {
    return this.users.find((u) => u.username === this.targetUser);
  }

  roleLabelKey(userType: string): string {
    return userType === 'admin'
      ? 'ADMIN.USER_TYPE_ADMIN'
      : 'ADMIN.USER_TYPE_USER';
  }

  async setMode(mode: UserMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.targetUser = '';
    this.resetForm();
    if (mode === 'delete') {
      await this.loadUsers();
    }
  }

  private async loadUsers() {
    try {
      this.users = (await this.adminService.getUsers()) ?? [];
    } catch {
      this.toastr.error(this.translate.instant('ADMIN.USERS_LOAD_FAILED'));
    }
  }

  onSubmit() {
    if (this.mode === 'create' && !this.passwordsMatch()) {
      this.toastr.error(this.translate.instant('ADMIN.PASSWORDS_DONT_MATCH'));
      return;
    }
    this.confirmOpen = true;
  }

  onCancelConfirm() {
    this.confirmOpen = false;
  }

  onConfirm() {
    if (this.mode === 'create') {
      this.onConfirmCreate();
    } else {
      this.onConfirmDelete();
    }
  }

  async onConfirmCreate() {
    this.confirmOpen = false;

    const selectedServices = Object.keys(this.selectedServices).filter(
      (service) => this.selectedServices[service],
    );

    const response = await this.adminService.createUser({
      username: this.username,
      password: this.password,
      email: this.email,
      usertype: this.usertype,
      allowedServices: selectedServices,
    });

    if (response.userName === this.username) {
      this.toastr.success(
        this.translate.instant('ADMIN.USER_CREATED', {
          username: response.userName,
        }),
      );
      this.resetForm();
      return;
    }

    if (response.responseCode === RESPONSE_CODES.AUTH.USERNAME_ALREADY_USED) {
      this.toastr.error(this.translate.instant('ADMIN.USERNAME_ALREADY_USED'));
    } else {
      this.toastr.error(this.translate.instant('ADMIN.USER_CREATE_FAILED'));
    }
  }

  async onConfirmDelete() {
    this.confirmOpen = false;

    const response = await this.adminService.deleteUser({
      targetUser: this.targetUser,
    });

    if (response?.responseCode === RESPONSE_CODES.AUTH.USER_NOT_FOUND) {
      this.toastr.error(this.translate.instant('ADMIN.TARGET_USER_NOT_FOUND'));
    } else if (
      response?.responseCode === RESPONSE_CODES.AUTH.CANNOT_DELETE_SELF
    ) {
      this.toastr.error(this.translate.instant('ADMIN.CANNOT_DELETE_SELF'));
    } else if (
      response?.responseCode ===
      RESPONSE_CODES.CREDENTIALS.JELLYFIN_USER_DELETION_FAILED
    ) {
      this.toastr.error(this.translate.instant('ADMIN.JELLYFIN_DELETION_FAILED'));
    } else if (response?.success) {
      this.toastr.success(
        this.translate.instant('ADMIN.USER_DELETED', {
          username: this.targetUser,
        }),
      );
      this.targetUser = '';
      await this.loadUsers();
    } else {
      this.toastr.error(this.translate.instant('ADMIN.USER_DELETE_FAILED'));
    }
  }

  private resetForm() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.email = '';
    this.usertype = 'user';
    for (const service of this.services) {
      this.selectedServices[service.name] = false;
    }
  }
}
