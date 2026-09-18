import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StaffMember } from '../../staff-selector/staff-selector.component';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  templateUrl: './dashboard-header.component.html'
})
export class DashboardHeaderComponent {
  @Input({ required: true }) staff!: StaffMember;
  @Output() logoutRequested = new EventEmitter<void>();
}
