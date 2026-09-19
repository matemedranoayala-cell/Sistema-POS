import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { DashboardMetricsComponent } from '../dashboard-metrics/dashboard-metrics.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';
import { IncomePerformanceComponent } from '../income-performance/income-performance.component';
import { StorePanelComponent } from '../store-panel/store-panel.component';
import { AccessControlComponent } from '../access-control/access-control.component';
import { DashboardFooterComponent } from '../dashboard-footer/dashboard-footer.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    DashboardMetricsComponent,
    QuickActionsComponent,
    IncomePerformanceComponent,
    StorePanelComponent,
    AccessControlComponent,
    DashboardFooterComponent
  ],
  templateUrl: './dashboard-page.component.html'
  // styleUrl eliminado porque no tienes archivo CSS para esta página
})
export class DashboardPageComponent implements OnInit {
  staff: any = {};

  // Declaramos el emisor de eventos para que el HTML no se rompa
  @Output() logoutRequested = new EventEmitter<void>();

  ngOnInit() {
    const sessionData = localStorage.getItem('kombat-session');
    if (sessionData) {
      this.staff = JSON.parse(sessionData);
    }
  }
}
