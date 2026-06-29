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

@Component({
  selector: 'app-admin-add-user',
  templateUrl: './admin-add-user.component.html',
  styleUrls: ['./admin-add-user.component.css'],
  imports: [FormsModule, CommonModule, TranslateModule, ConfirmDialogComponent],
})
export class AdminAddUserComponent implements OnInit {
  username = '';
  password = '';
  confirmPassword = '';
  email = '';
  usertype = 'user';
  services: SsoService[] = [];
  selectedServices: Record<string, boolean> = {};
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

  onSubmit() {
    if (!this.passwordsMatch()) {
      this.toastr.error(this.translate.instant('ADMIN.PASSWORDS_DONT_MATCH'));
      return;
    }
    this.confirmOpen = true;
  }

  onCancelConfirm() {
    this.confirmOpen = false;
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
