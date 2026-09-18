import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface StaffMember {
  name: string;
  shortName: string;
  role: string;
  schedule: string;
  initials: string;
}

@Component({
  selector: 'app-staff-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-selector.component.html',
  styleUrls: ['./staff-selector.component.css']
})
export class StaffSelectorComponent {
  @Input() staff: StaffMember[] = [];
  @Input() selectedStaff!: StaffMember;
  @Output() staffSelected = new EventEmitter<StaffMember>();
  @Output() changeStaff = new EventEmitter<void>();

  selectMember(member: StaffMember): void {
    this.staffSelected.emit(member);
  }

  onChangeStaff(): void {
    this.changeStaff.emit();
  }
}
