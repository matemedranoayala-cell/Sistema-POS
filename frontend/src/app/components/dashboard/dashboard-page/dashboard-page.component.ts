import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StaffMember } from '../../staff-selector/staff-selector.component';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';
import { DashboardMetricsComponent } from '../dashboard-metrics/dashboard-metrics.component';
import { AccessControlComponent } from '../access-control/access-control.component';
import { IncomePerformanceComponent } from '../income-performance/income-performance.component';
import { StorePanelComponent } from '../store-panel/store-panel.component';
import { DashboardFooterComponent } from '../dashboard-footer/dashboard-footer.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    QuickActionsComponent,
    DashboardMetricsComponent,
    AccessControlComponent,
    IncomePerformanceComponent,
    StorePanelComponent,
    DashboardFooterComponent
  ],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {
  @Input({ required: true }) staff!: StaffMember;
  @Output() logoutRequested = new EventEmitter<void>();
}
