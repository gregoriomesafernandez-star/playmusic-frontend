import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {

  // Controla si la ventana está abierta
  isOpen = signal(false);

  // Título y mensaje configurables
  title = input('¿Estás seguro?');
  message = input('Esta acción no se puede deshacer.');

  // Eventos que recibe el componente padre
  confirmed = output<void>();
  cancelled = output<void>();

  // Abrir ventana
  open() {
    this.isOpen.set(true);
  }

  // Confirmar eliminación
  onConfirm() {
    this.isOpen.set(false);
    this.confirmed.emit();
  }

  // Cancelar eliminación
  onCancel() {
    this.isOpen.set(false);
    this.cancelled.emit();
  }
}