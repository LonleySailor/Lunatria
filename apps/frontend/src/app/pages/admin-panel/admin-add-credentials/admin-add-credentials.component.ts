import { Component } from '@angular/core';
import { AdminPanelService } from '../admin-panel.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-add-credentials',
  templateUrl: './admin-add-credentials.component.html',
  styleUrls: ['./admin-add-credentials.component.css'],
  imports: [FormsModule, CommonModule]
})
export class AdminAddCredentialsComponent {
  selectedService: string = '';
  credentials: any = {
    username: '',
    password: '',
    email: '',
    targetUser: ''
  };

  constructor(
    private adminService: AdminPanelService,
    private toastr: ToastrService
  ) { }

  onServiceChange() {
    this.credentials = {
      username: '',
      password: '',
      email: '',
      targetUser: ''
    };
  }

  serviceRequiresEmail(service: string): boolean {
    return ['nextcloud'].includes(service); // Add services here if they require email
  }

  async onSubmit() {
    const payload = {
      service: this.selectedService,
      username: this.credentials.username,
      password: this.credentials.password,
      email: this.credentials.email,
      targetUser: this.credentials.targetUser

    };

    const response = await this.adminService.addCredentials(payload)

    if (response.responseCode === "610") {
      this.toastr.error('Target user not found.');
    } if (response.responseCode === "801") {
      this.toastr.error('Service not found.');
    }
    else {
      this.toastr.success('Credentials added successfully.');
      this.onServiceChange();
    }
  }

}



