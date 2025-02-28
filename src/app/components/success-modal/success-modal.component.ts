import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-success-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./success-modal.component.html",
})
export class SuccessModalComponent {
  @Input() show = false
  @Input() message: string = ""
  @Output() close = new EventEmitter<void>()

  closeModal(): void {
    this.close.emit()
  }
}

