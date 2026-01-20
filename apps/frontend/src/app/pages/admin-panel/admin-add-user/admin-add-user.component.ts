import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminPanelService } from '../admin-panel.service';
import { ToastrService } from 'ngx-toastr';
import { RESPONSE_CODES } from '../../../config/response-codes.const';

@Component({
  selector: 'app-admin-add-user',
  templateUrl: './admin-add-user.component.html',
  styleUrls: ['./admin-add-user.component.css'],
  imports: [FormsModule],
})
export class AdminAddUserComponent {
  username = '';
  password = '';
  email = '';
  usertype = '';
  allowedServices = {
    jellyfin: false,
    nextcloud: false,
    radarr: false,
    sonarr: false
  };
  availableServices = ['jellyfin', 'radarr', 'sonarr', 'nextcloud'];

  constructor(
    private adminService: AdminPanelService,
    private toastr: ToastrService
  ) { }

  async onSubmit() {
    const selectedServices = Object.keys(this.allowedServices).filter(service => this.allowedServices[service as keyof typeof this.allowedServices]);
    const formData = {
      username: this.username,
      password: this.password,
      email: this.email,
      usertype: this.usertype,
      allowedServices: selectedServices
    };
    const response = await this.adminService.createUser(formData)
    if (response.userName === this.username) {

      this.toastr.success(`User "${response.userName}" created successfully`);
      return;
    }
    if (response.responseCode === RESPONSE_CODES.AUTH.USERNAME_ALREADY_USED) {
      this.toastr.error('Username already exists');
    }
  }
}

