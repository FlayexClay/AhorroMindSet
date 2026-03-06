import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';
import { PlanAhorro } from '../models/dashboard.models';

type CurrencyType = 'PEN' | 'USD' | 'EUR';

const MESES = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'
];
const MESES_ES: Record<string, string> = {
  JANUARY:'ENERO', FEBRUARY:'FEBRERO', MARCH:'MARZO', APRIL:'ABRIL',
  MAY:'MAYO', JUNE:'JUNIO', JULY:'JULIO', AUGUST:'AGOSTO',
  SEPTEMBER:'SEPTIEMBRE', OCTOBER:'OCTUBRE', NOVEMBER:'NOVIEMBRE', DECEMBER:'DICIEMBRE'
};

@Component({
  selector: 'app-plan-ahorro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './plan-ahorro.component.html',
  styleUrl: './plan-ahorro.component.scss'
})
export class PlanAhorroComponent implements OnInit{
  private fb          = inject(FormBuilder);
  private dashService = inject(DashboardService);
  private authService = inject(AuthService);

  user       = this.authService.getCurrentUser();
  planes     = signal<PlanAhorro[]>([]);
  isLoading  = signal(true);
  showModal  = signal(false);
  isSaving   = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');

  readonly meses   = MESES;
  readonly mesesEs = MESES_ES;
  readonly monedas = [
    { value: 'PEN' as CurrencyType, label: 'Soles',   symbol: 'S/.' },
    { value: 'USD' as CurrencyType, label: 'Dólares', symbol: '$'   },
    { value: 'EUR' as CurrencyType, label: 'Euros',   symbol: '€'   },
  ];

  form = this.fb.group({
    metaMensual: [null as number | null, [Validators.required, Validators.min(1)]],
    tipoMoneda:  ['PEN' as CurrencyType, Validators.required],
    mes:         [MESES[new Date().getMonth()], Validators.required],
  });

  get metaMensual() { return this.form.get('metaMensual')!; }
  get tipoMoneda()  { return this.form.get('tipoMoneda')!;  }
  get mes()         { return this.form.get('mes')!;         }

  simboloMoneda = computed(() =>
    this.monedas.find(x => x.value === this.tipoMoneda.value)?.symbol ?? 'S/.'
  );

  initiales = computed(() => {
    const n = this.user?.nombre?.[0] ?? '';
    const a = this.user?.apellidos?.[0] ?? '';
    return (n + a).toUpperCase();
  });

  ngOnInit() { this.cargarPlanes(); }

  cargarPlanes() {
    this.isLoading.set(true);
    this.dashService.getMisPlanes().subscribe({
      next: res => { this.planes.set(res.success ? res.data : []); this.isLoading.set(false); },
      error: ()  => { this.planes.set([]); this.isLoading.set(false); }
    });
  }

  abrirModal() {
    this.errorMsg.set('');
    this.successMsg.set('');
    this.form.reset({ metaMensual: null, tipoMoneda: 'PEN', mes: MESES[new Date().getMonth()] });
    this.showModal.set(true);
  }

  cerrarModal() { this.showModal.set(false); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.errorMsg.set('');
    const { metaMensual, tipoMoneda, mes } = this.form.value;
    this.dashService.crearPlan({ metaMensual: metaMensual!, tipoMoneda: tipoMoneda!, mes: mes! }).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (res.success) { this.successMsg.set('Plan creado exitosamente'); this.showModal.set(false); this.cargarPlanes(); }
      },
      error: err => { this.isSaving.set(false); this.errorMsg.set(err?.error?.message ?? 'Error al crear el plan'); }
    });
  }

  porcentaje(plan: PlanAhorro) { return Math.min(100, Math.round((plan.montoRecibido / plan.metaMensual) * 100)); }
  mesEs(mes: string)            { return MESES_ES[mes] ?? mes; }
  simbolo(moneda: string)       { return this.monedas.find(m => m.value === moneda)?.symbol ?? 'S/.'; }
  logout()                      { this.authService.logout(); }
}
