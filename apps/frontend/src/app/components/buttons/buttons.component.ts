import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.css']
})
export class ButtonsComponent implements OnInit, OnDestroy {
  serviceStatuses: { [key: string]: boolean } = {};
  private intervalId: any;

  constructor(private statusService: StatusService, private ngZone: NgZone) {}

  ngOnInit() {
    this.checkAllServices();

    // Set up refresh interval
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.checkAllServices();
      }, 30000);
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private checkAllServices() {
    this.ngZone.runOutsideAngular(() => {
      this.statusService.getAllServiceStatuses().subscribe({
        next: (statuses) => {
          this.ngZone.run(() => {
            this.serviceStatuses = { ...statuses };
          });
        },
        error: () => {}
      });
    });
  }
}
