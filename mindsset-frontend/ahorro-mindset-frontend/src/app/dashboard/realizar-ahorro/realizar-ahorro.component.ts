import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { PlanAhorro } from '../models/dashboard.models';

const MESES_ES: Record<string, string> = {
  JANUARY: 'ENERO', FEBRUARY: 'FEBRERO', MARCH: 'MARZO', APRIL: 'ABRIL',
  MAY: 'MAYO', JUNE: 'JUNIO', JULY: 'JULIO', AUGUST: 'AGOSTO',
  SEPTEMBER: 'SEPTIEMBRE', OCTOBER: 'OCTUBRE', NOVEMBER: 'NOVIEMBRE', DECEMBER: 'DICIEMBRE'
};

@Component({
  selector: 'app-realizar-ahorro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './realizar-ahorro.component.html',
  styleUrl: './realizar-ahorro.component.scss'
})
export class RealizarAhorroComponent implements OnInit {

  private fb          = inject(FormBuilder);
  private dashService = inject(DashboardService);
  private authService = inject(AuthService);

  user           = this.authService.getCurrentUser();
  planes         = signal<PlanAhorro[]>([]);
  isLoading      = signal(true);
  showModal      = signal(false);
  isSaving       = signal(false);
  planSeleccionado = signal<PlanAhorro | null>(null);
  errorMsg       = signal('');
  successMsg     = signal('');

  readonly monedas: Record<string, string> = {
    PEN: 'S/.', USD: '$', EUR: '€'
  };
  form = this.fb.group({
    fecha: [new Date().toISOString().split('T')[0], Validators.required],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  get fecha() { return this.form.get('fecha')!; }
  get monto() { return this.form.get('monto')!; }

  initiales = computed(() => {
    const n = this.user?.nombre?.[0]    ?? '';
    const a = this.user?.apellidos?.[0] ?? '';
    return (n + a).toUpperCase();
  });

  simbolo(moneda: string) { return this.monedas[moneda] ?? 'S/.'; }
  mesEs(mes: string)       { return MESES_ES[mes] ?? mes; }

  porcentaje(plan: PlanAhorro) {
    if (!plan.metaMensual) return 0;
    return Math.min(100, Math.round((plan.montoRecibido / plan.metaMensual) * 100));
  }

  ngOnInit() { this.cargarPlanes(); }

  cargarPlanes() {
    this.isLoading.set(true);
    this.dashService.getMisPlanes().subscribe({
      next: res => { this.planes.set(res.success ? res.data : []); this.isLoading.set(false); },
      error: ()  => { this.planes.set([]); this.isLoading.set(false); }
    });
  }

  seleccionarPlan(plan: PlanAhorro) {
    if (plan.metaAlcanzada) return;
    this.planSeleccionado.set(plan);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.form.reset({
      fecha: new Date().toISOString().split('T')[0],
      monto: null
    });
    this.showModal.set(true);
  }

  cerrarModal() { this.showModal.set(false); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const plan = this.planSeleccionado();
    if (!plan) return;

    this.isSaving.set(true);
    this.errorMsg.set('');

    const { fecha, monto } = this.form.value;

    this.dashService.registrarAhorro(plan.id, fecha!, monto!).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (res.success) {
          this.successMsg.set(`¡Ahorro de ${this.simbolo(plan.tipoMoneda)} ${monto} registrado!`);
          this.showModal.set(false);
          this.cargarPlanes();
        }
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al registrar el ahorro');
      }
    });
  }

  logout() { this.authService.logout(); }
}
