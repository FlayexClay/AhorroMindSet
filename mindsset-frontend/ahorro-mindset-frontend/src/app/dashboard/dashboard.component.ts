import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { DashboardService } from './services/dashboard.service';
import { Router } from '@angular/router';
import { AhorroSemana, PlanAhorro } from './models/dashboard.models';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService   = inject(AuthService);
  private dashService  = inject(DashboardService);
  private router       = inject(Router);

  //--Stats--
  user       = this.authService.getCurrentUser();
  planActivo = signal<PlanAhorro | null>(null);
  semana     = signal<AhorroSemana[]>([]);
  isLoading  = signal(true);
  sidebarExpanded = signal(false);
  errorMsg   = signal('');

  //--Computed--
  initiales = computed(() =>{
    if (!this.user) return 'U';
    const n = this.user.nombre?.[0] ?? '';
    const a = this.user.apellidos?.[0] ?? '';
    return (n + a).toUpperCase();
  });

  montoFaltante = computed(() => {
    const plan = this.planActivo();
    if (!plan) return 0;
    return Math.max(0, plan.metaRestante);
  });

  monedaLabel = computed(() => {
    const moneda = this.planActivo()?.tipoMoneda ?? 'PEN';
    const map: Record<string, string> = {
      PEN: 'PEN SOLES',
      USD: 'USD DÓLARES',
      EUR: 'EUR EUROS'
    };
    return map[moneda] ?? moneda;
  })

  //--LifeCycle--
  ngOnInit(){
    this.cargarDashboard();
  }

  private cargarDashboard(){
    this.isLoading.set(true);

    this.dashService.getMisPlanes().subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          const mesActual = new Date().toLocaleDateString('en-US', {month: 'long'}).toUpperCase();
          const plan = res.data.find(p => p.mes === mesActual) ?? res.data[0];
          this.planActivo.set(plan);
          this.cargarAhorrosSemana(plan.id);
        }else{
          this.semana.set(this.generarSemanaVacia());
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.semana.set(this.generarSemanaVacia());
        this.isLoading.set(false);
      }
    });
  }

  private cargarAhorrosSemana(planId: number){
    this.dashService.getAhorrosPorPlan(planId).subscribe({
      next: (res) => {
        const ahorros = res.success ? res.data : [];
        this.semana.set(this.buildSemana(ahorros));
        this.isLoading.set(false);
      },
      error: () => {
        this.semana.set(this.generarSemanaVacia());
        this.isLoading.set(false);
      }
    });
  }

  private buildSemana(ahorros: { fecha: string; monto: number }[]): AhorroSemana[] {
    const diasEs = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const hoy    = new Date();
    const hoyISO = hoy.toISOString().split('T')[0];

    if (ahorros.length === 0) {
      return this.generarSemanaVacia();
    }

    // Ordenar ahorros por fecha descendente y tomar los últimos 7 únicos días
    const fechasUnicas = [...new Set(ahorros.map(a => a.fecha))]
      .sort((a, b) => b.localeCompare(a))  // más reciente primero
      .slice(0, 7)
      .sort((a, b) => a.localeCompare(b)); // volver a orden ascendente para mostrar

    // Si hay menos de 7 fechas con ahorros, rellenar con los días anteriores al más antiguo
    while (fechasUnicas.length < 7) {
      const masAntigua = new Date(fechasUnicas[0]);
      masAntigua.setDate(masAntigua.getDate() - 1);
      const anteriorISO = masAntigua.toISOString().split('T')[0];
      fechasUnicas.unshift(anteriorISO);
    }

    return fechasUnicas.map(fechaISO => {
      const fecha      = new Date(fechaISO + 'T12:00:00'); // evitar desfase de zona horaria
      const ahorrosDia = ahorros.filter(a => a.fecha === fechaISO);
      const total      = ahorrosDia.reduce((sum, a) => sum + a.monto, 0);

      return {
        dia:   diasEs[fecha.getDay()],
        fecha: fechaISO,
        monto: total > 0 ? total : null,
        esHoy: fechaISO === hoyISO
      };
    });
  }

  private generarSemanaVacia(): AhorroSemana[] {
    const diasEs = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const hoy    = new Date();
    const semana: AhorroSemana[] = [];
    const diaSemana = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7));

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + i);
      const fechaISO = fecha.toISOString().split('T')[0];
      semana.push({
        dia:   diasEs[fecha.getDay()],
        fecha: fechaISO,
        monto: null,
        esHoy: fechaISO === hoy.toISOString().split('T')[0]
      });
    }
    return semana;
  }

  logout() {
    this.authService.logout();
  }

  irARealizarAhorro() {
    this.router.navigate(['/dashboard/realizar-ahorro']);
  }

  irAPlanAhorro() {
    this.router.navigate(['/dashboard/plan-ahorro']);
  }
}
