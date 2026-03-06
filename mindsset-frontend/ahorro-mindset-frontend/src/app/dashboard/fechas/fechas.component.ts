import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Ahorro, PlanAhorro } from '../models/dashboard.models';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';

const MESES_ES: Record<string, string> = {
  JANUARY: 'ENERO', FEBRUARY: 'FEBRERO', MARCH: 'MARZO', APRIL: 'ABRIL',
  MAY: 'MAYO', JUNE: 'JUNIO', JULY: 'JULIO', AUGUST: 'AGOSTO',
  SEPTEMBER: 'SEPTIEMBRE', OCTOBER: 'OCTUBRE', NOVEMBER: 'NOVIEMBRE', DECEMBER: 'DICIEMBRE'
};

const MESES_DISPLAY: string[] = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

interface DiaCalendario {
  fecha: Date;
  diaNum: number;
  esDelMes: boolean;
  esHoy: boolean;
  ahorros: Ahorro[];
  total: number;
}

@Component({
  selector: 'app-fechas',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './fechas.component.html',
  styleUrl: './fechas.component.scss'
})
export class FechasComponent implements OnInit{

  private dashService = inject(DashboardService);
  private authService = inject(AuthService);

  user = this.authService.getCurrentUser();

  // ── Estado de selección de plan ──────────────────────────
  planes            = signal<PlanAhorro[]>([]);
  planSeleccionado  = signal<PlanAhorro | null>(null);
  isLoadingPlanes   = signal(true);

  // ── Estado del calendario ────────────────────────────────
  ahorros           = signal<Ahorro[]>([]);
  isLoadingAhorros  = signal(false);
  mesActual         = signal(new Date().getMonth());     // 0-11
  anioActual        = signal(new Date().getFullYear());

  // ── Computed: título del mes ──────────────────────────────
  tituloMes = computed(() =>
    `${MESES_DISPLAY[this.mesActual()]} ${this.anioActual()}`
  );

  // ── Computed: días del calendario (6 semanas × 7 días) ───
  diasCalendario = computed((): DiaCalendario[] => {
    const mes  = this.mesActual();
    const anio = this.anioActual();
    const hoy  = new Date();
    const ahorrosData = this.ahorros();

    // Primer día de la semana del mes (0=Dom)
    const primerDia = new Date(anio, mes, 1).getDay();
    // Total de días en el mes
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    const dias: DiaCalendario[] = [];

    // Días del mes anterior para rellenar
    const diasMesAnterior = new Date(anio, mes, 0).getDate();
    for (let i = primerDia - 1; i >= 0; i--) {
      const fecha = new Date(anio, mes - 1, diasMesAnterior - i);
      dias.push({ fecha, diaNum: diasMesAnterior - i, esDelMes: false, esHoy: false, ahorros: [], total: 0 });
    }

    // Días del mes actual
    for (let d = 1; d <= totalDias; d++) {
      const fecha     = new Date(anio, mes, d);
      const fechaISO  = this.toISO(fecha);
      const esHoy     = this.toISO(hoy) === fechaISO;
      const ahorrosDia = ahorrosData.filter(a => a.fecha === fechaISO);
      const total      = ahorrosDia.reduce((sum, a) => sum + a.monto, 0);
      dias.push({ fecha, diaNum: d, esDelMes: true, esHoy, ahorros: ahorrosDia, total });
    }

    // Días del mes siguiente para completar la cuadrícula
    const restantes = 42 - dias.length;
    for (let d = 1; d <= restantes; d++) {
      const fecha = new Date(anio, mes + 1, d);
      dias.push({ fecha, diaNum: d, esDelMes: false, esHoy: false, ahorros: [], total: 0 });
    }

    return dias;
  });

  // ── Computed: total del mes ───────────────────────────────
  totalMes = computed(() =>
    this.ahorros()
      .filter(a => {
        const d = new Date(a.fecha);
        return d.getMonth() === this.mesActual() && d.getFullYear() === this.anioActual();
      })
      .reduce((sum, a) => sum + a.monto, 0)
  );

  simbolo = computed(() => {
    const plan = this.planSeleccionado();
    const map: Record<string, string> = { PEN: 'S/.', USD: '$', EUR: '€' };
    return map[plan?.tipoMoneda ?? 'PEN'] ?? 'S/.';
  });

  initiales = computed(() => {
    const n = this.user?.nombre?.[0]    ?? '';
    const a = this.user?.apellidos?.[0] ?? '';
    return (n + a).toUpperCase();
  });

  mesEs(mes: string) { return MESES_ES[mes] ?? mes; }

  readonly diasSemana = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit() { this.cargarPlanes(); }

  cargarPlanes() {
    this.isLoadingPlanes.set(true);
    this.dashService.getMisPlanes().subscribe({
      next: res => {
        this.planes.set(res.success ? res.data : []);
        this.isLoadingPlanes.set(false);
      },
      error: () => { this.planes.set([]); this.isLoadingPlanes.set(false); }
    });
  }

  seleccionarPlan(plan: PlanAhorro) {
    this.planSeleccionado.set(plan);
    // Sincronizar el calendario con el mes del plan
    const mesIndex = Object.keys(MESES_ES).indexOf(plan.mes);
    if (mesIndex >= 0) {
      this.mesActual.set(mesIndex);
    }
    this.cargarAhorros(plan.id);
  }

  cargarAhorros(planId: number) {
    this.isLoadingAhorros.set(true);
    this.dashService.getAhorrosPorPlan(planId).subscribe({
      next: res => { this.ahorros.set(res.success ? res.data : []); this.isLoadingAhorros.set(false); },
      error: () => { this.ahorros.set([]); this.isLoadingAhorros.set(false); }
    });
  }

  // ── Navegación de mes ─────────────────────────────────────
  mesAnterior() {
    if (this.mesActual() === 0) {
      this.mesActual.set(11);
      this.anioActual.update(a => a - 1);
    } else {
      this.mesActual.update(m => m - 1);
    }
  }

  mesSiguiente() {
    if (this.mesActual() === 11) {
      this.mesActual.set(0);
      this.anioActual.update(a => a + 1);
    } else {
      this.mesActual.update(m => m + 1);
    }
  }

  irHoy() {
    const hoy = new Date();
    this.mesActual.set(hoy.getMonth());
    this.anioActual.set(hoy.getFullYear());
  }

  volverAPlanes() { this.planSeleccionado.set(null); }

  logout() { this.authService.logout(); }

  min100(val: number) { return Math.min(100, Math.round(val)); }

  private toISO(d: Date): string {
    return d.toISOString().split('T')[0];
  }

}
