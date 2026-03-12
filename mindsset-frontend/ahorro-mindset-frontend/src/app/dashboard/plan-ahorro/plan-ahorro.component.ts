import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';
import { PlanAhorro } from '../models/dashboard.models';
import XlsxStyle from 'xlsx-js-style';

type CurrencyType = 'PEN' | 'USD' | 'EUR';

const MESES = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'
];

const MESES_ES: Record<string, string> = {
  JANUARY: 'ENERO', FEBRUARY: 'FEBRERO', MARCH: 'MARZO',
  APRIL: 'ABRIL', MAY: 'MAYO', JUNE: 'JUNIO',
  JULY: 'JULIO', AUGUST: 'AGOSTO', SEPTEMBER: 'SEPTIEMBRE',
  OCTOBER: 'OCTUBRE', NOVEMBER: 'NOVIEMBRE', DECEMBER: 'DICIEMBRE'
};

// ══════════════════════════════════════════════════════════
// PALETA DE COLORES
// ══════════════════════════════════════════════════════════
const C = {
  verde:      '22C55E',
  verdeDark:  '14532D',
  verdeMid:   '166534',
  verdeLight: 'DCFCE7',
  headerBg:   '0F2818',
  totalBg:    '052E16',
  rowAlt:     'F0FDF4',
  blanco:     'FFFFFF',
  grisText:   '64748B',
  negro:      '111827',
  amarillo:   'B45309',
  amarilloBg: 'FEF3C7',
};

// ── Bordes ──────────────────────────────────────────────
const bVerde = { style: 'thin', color: { rgb: C.verde } };
const bGris  = { style: 'thin', color: { rgb: 'E2E8F0' } };
const bordeVerde = { top: bVerde, bottom: bVerde, left: bVerde, right: bVerde };
const bordeGris  = { top: bGris,  bottom: bGris,  left: bGris,  right: bGris  };

// ── Fábrica de estilos ──────────────────────────────────
function st(font: any = {}, fill: any = null, border: any = bordeGris, align: any = {}): any {
  return {
    font:      { name: 'Calibri', sz: 10, color: { rgb: C.negro }, ...font },
    fill:      fill ?? { patternType: 'none' },
    border,
    alignment: { vertical: 'center', wrapText: false, ...align },
  };
}

const ST = {
  titulo:    st({ sz: 14, bold: true, color: { rgb: C.verde } },   { patternType: 'solid', fgColor: { rgb: C.headerBg } }, bordeVerde, { horizontal: 'left' }),
  subtitulo: st({ sz: 9, italic: true, color: { rgb: 'A0AEC0' } }, { patternType: 'solid', fgColor: { rgb: C.headerBg } }, bordeVerde, { horizontal: 'left' }),
  header:    st({ sz: 10, bold: true, color: { rgb: C.blanco } },  { patternType: 'solid', fgColor: { rgb: C.headerBg } }, bordeVerde, { horizontal: 'center' }),
  dato:      st({ sz: 10 }, null, bordeGris, { horizontal: 'left' }),
  datoAlt:   st({ sz: 10 }, { patternType: 'solid', fgColor: { rgb: C.rowAlt } }, bordeGris, { horizontal: 'left' }),
  monto:     st({ sz: 10, bold: true, color: { rgb: C.verdeMid } }, null, bordeGris, { horizontal: 'right' }),
  montoAlt:  st({ sz: 10, bold: true, color: { rgb: C.verdeMid } }, { patternType: 'solid', fgColor: { rgb: C.rowAlt } }, bordeGris, { horizontal: 'right' }),
  pct:       st({ sz: 10, color: { rgb: C.verdeMid } }, null, bordeGris, { horizontal: 'center' }),
  pctAlt:    st({ sz: 10, color: { rgb: C.verdeMid } }, { patternType: 'solid', fgColor: { rgb: C.rowAlt } }, bordeGris, { horizontal: 'center' }),
  totalLbl:  st({ sz: 10, bold: true, color: { rgb: C.blanco } }, { patternType: 'solid', fgColor: { rgb: C.totalBg } }, bordeVerde, { horizontal: 'right' }),
  totalVal:  st({ sz: 11, bold: true, color: { rgb: C.verde } },  { patternType: 'solid', fgColor: { rgb: C.totalBg } }, bordeVerde, { horizontal: 'right' }),
  ok:        st({ sz: 9, bold: true, color: { rgb: C.verdeMid } }, { patternType: 'solid', fgColor: { rgb: C.verdeLight } }, bordeGris, { horizontal: 'center' }),
  enc:       st({ sz: 9, bold: true, color: { rgb: C.amarillo } }, { patternType: 'solid', fgColor: { rgb: C.amarilloBg } }, bordeGris, { horizontal: 'center' }),
  vacio:     st({}, { patternType: 'solid', fgColor: { rgb: C.headerBg } }, bordeVerde),
};

function cel(v: any, estilo: any, fmt?: string): any {
  const cell: any = { v, s: estilo, t: typeof v === 'number' ? 'n' : 's' };
  if (fmt) cell.z = fmt;
  return cell;
}

function filaVacia(n: number): any[] {
  return Array(n).fill(cel('', ST.vacio));
}

@Component({
  selector: 'app-plan-ahorro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './plan-ahorro.component.html',
  styleUrl: './plan-ahorro.component.scss'
})
export class PlanAhorroComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private dashService = inject(DashboardService);
  private authService = inject(AuthService);

  user         = this.authService.getCurrentUser();
  planes       = signal<PlanAhorro[]>([]);
  isLoading    = signal(true);
  showModal    = signal(false);
  isSaving     = signal(false);
  isGenerating = signal(false);
  errorMsg     = signal('');
  successMsg   = signal('');

  readonly meses   = MESES;
  readonly mesesEs = MESES_ES;
  readonly monedas: { value: CurrencyType; label: string; symbol: string }[] = [
    { value: 'PEN', label: 'Soles',   symbol: 'S/.' },
    { value: 'USD', label: 'Dólares', symbol: '$'   },
    { value: 'EUR', label: 'Euros',   symbol: '€'   },
  ];

  form = this.fb.group({
    metaMensual: [null as number | null, [Validators.required, Validators.min(1)]],
    tipoMoneda:  ['PEN' as CurrencyType, Validators.required],
    mes:         [MESES[new Date().getMonth()], Validators.required],
  });

  get metaMensual() { return this.form.get('metaMensual')!; }
  get tipoMoneda()  { return this.form.get('tipoMoneda')!;  }
  get mes()         { return this.form.get('mes')!;          }

  simboloMoneda = computed(() =>
    this.monedas.find(x => x.value === this.tipoMoneda.value)?.symbol ?? 'S/.'
  );

  initiales = computed(() =>
    ((this.user?.nombre?.[0] ?? '') + (this.user?.apellidos?.[0] ?? '')).toUpperCase()
  );

  ngOnInit() { this.cargarPlanes(); }

  cargarPlanes() {
    this.isLoading.set(true);
    this.dashService.getMisPlanes().subscribe({
      next: res => { this.planes.set(res.success ? res.data : []); this.isLoading.set(false); },
      error: ()  => { this.planes.set([]); this.isLoading.set(false); }
    });
  }

  abrirModal() {
    this.errorMsg.set(''); this.successMsg.set('');
    this.form.reset({ metaMensual: null, tipoMoneda: 'PEN', mes: MESES[new Date().getMonth()] });
    this.showModal.set(true);
  }

  cerrarModal() { this.showModal.set(false); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true); this.errorMsg.set('');
    const { metaMensual, tipoMoneda, mes } = this.form.value;
    this.dashService.crearPlan({ metaMensual: metaMensual!, tipoMoneda: tipoMoneda!, mes: mes! }).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (res.success) {
          this.successMsg.set('Plan creado exitosamente');
          this.showModal.set(false);
          this.cargarPlanes();
        }
      },
      error: err => { this.isSaving.set(false); this.errorMsg.set(err?.error?.message ?? 'Error al crear el plan'); }
    });
  }

  // ══════════════════════════════════════════════════════
  // REPORTE EXCEL CON DISEÑO
  // ══════════════════════════════════════════════════════
  generarReporte() {
    const planes = this.planes();
    if (planes.length === 0) return;
    this.isGenerating.set(true);

    const requests = planes.map(plan =>
      new Promise<{ plan: PlanAhorro; ahorros: any[] }>(resolve => {
        this.dashService.getAhorrosPorPlan(plan.id).subscribe({
          next: res => resolve({ plan, ahorros: res.success ? res.data : [] }),
          error: ()  => resolve({ plan, ahorros: [] })
        });
      })
    );

    Promise.all(requests).then(resultados => {
      const wb      = XlsxStyle.utils.book_new();
      const hoy     = new Date().toLocaleDateString('es-PE');
      const usuario = `${this.user?.nombre ?? ''} ${this.user?.apellidos ?? ''}`.trim();
      const N       = 8; // columnas hoja resumen

      // ───────────────────────────────────────────────
      // HOJA 1 — Resumen de todos los planes
      // ───────────────────────────────────────────────
      const r: any[][] = [];

      r.push([ cel(`💰  REPORTE DE AHORROS  —  ${usuario.toUpperCase()}`, ST.titulo), ...Array(N-1).fill(cel('', ST.titulo)) ]);
      r.push([ cel(`Generado el: ${hoy}   ·   ${planes.length} plan(es)`, ST.subtitulo), ...Array(N-1).fill(cel('', ST.subtitulo)) ]);
      r.push(filaVacia(N));
      r.push([
        cel('#',            ST.header), cel('MES',          ST.header),
        cel('MONEDA',       ST.header), cel('META MENSUAL', ST.header),
        cel('RECAUDADO',    ST.header), cel('FALTANTE',     ST.header),
        cel('PROGRESO',     ST.header), cel('ESTADO',       ST.header),
      ]);

      resultados.forEach(({ plan }, i) => {
        const alt = i % 2 === 1;
        const faltante = Math.max(0, plan.metaMensual - plan.montoRecibido);
        const progreso = plan.metaMensual > 0 ? plan.montoRecibido / plan.metaMensual : 0;
        r.push([
          cel(i + 1,                                             alt ? ST.datoAlt : ST.dato),
          cel(this.mesEs(plan.mes),                              alt ? ST.datoAlt : ST.dato),
          cel(plan.tipoMoneda,                                   alt ? ST.datoAlt : ST.dato),
          cel(plan.metaMensual,   alt ? ST.montoAlt : ST.monto,  '#,##0.00'),
          cel(plan.montoRecibido, alt ? ST.montoAlt : ST.monto,  '#,##0.00'),
          cel(faltante,           alt ? ST.montoAlt : ST.monto,  '#,##0.00'),
          cel(progreso,           alt ? ST.pctAlt   : ST.pct,    '0.0%'),
          cel(plan.metaAlcanzada ? 'COMPLETADO' : 'EN CURSO', plan.metaAlcanzada ? ST.ok : ST.enc),
        ]);
      });

      const sumMeta = resultados.reduce((s, r) => s + r.plan.metaMensual, 0);
      const sumRec  = resultados.reduce((s, r) => s + r.plan.montoRecibido, 0);
      const sumFalt = resultados.reduce((s, r) => s + Math.max(0, r.plan.metaMensual - r.plan.montoRecibido), 0);

      r.push(filaVacia(N));
      r.push([
        cel('', ST.totalLbl), cel('TOTALES', ST.totalLbl), cel('', ST.totalLbl),
        cel(sumMeta,  ST.totalVal, '#,##0.00'),
        cel(sumRec,   ST.totalVal, '#,##0.00'),
        cel(sumFalt,  ST.totalVal, '#,##0.00'),
        cel('', ST.totalLbl), cel('', ST.totalLbl),
      ]);

      const ws1 = XlsxStyle.utils.aoa_to_sheet(r);
      ws1['!cols']   = [{ wch:5 },{ wch:14 },{ wch:10 },{ wch:18 },{ wch:18 },{ wch:16 },{ wch:12 },{ wch:14 }];
      ws1['!rows']   = [{ hpt:34 },{ hpt:20 },{ hpt:8 },{ hpt:26 }];
      ws1['!merges'] = [
        { s:{ r:0,c:0 }, e:{ r:0,c:N-1 } },
        { s:{ r:1,c:0 }, e:{ r:1,c:N-1 } },
      ];
      XlsxStyle.utils.book_append_sheet(wb, ws1, 'Resumen');

      // ───────────────────────────────────────────────
      // HOJAS por plan — detalle de días ahorrados
      // ───────────────────────────────────────────────
      resultados.forEach(({ plan, ahorros }, idx) => {
        const hoja    = `${String(MESES_ES[plan.mes] ?? plan.mes).substring(0,6)}_${idx+1}`;
        const sim     = this.simbolo(plan.tipoMoneda);
        const M       = 4; // columnas
        const p: any[][] = [];

        p.push([ cel(`📅  PLAN DE AHORRO  —  ${this.mesEs(plan.mes)} ${new Date().getFullYear()}`, ST.titulo), ...Array(M-1).fill(cel('', ST.titulo)) ]);
        p.push([ cel(`Meta: ${sim} ${plan.metaMensual.toFixed(2)}   ·   Recaudado: ${sim} ${plan.montoRecibido.toFixed(2)}   ·   ${plan.tipoMoneda}`, ST.subtitulo), ...Array(M-1).fill(cel('', ST.subtitulo)) ]);
        p.push(filaVacia(M));
        p.push([ cel('#', ST.header), cel('FECHA', ST.header), cel('DÍA', ST.header), cel('MONTO AHORRADO', ST.header) ]);

        if (ahorros.length === 0) {
          p.push([ cel('', ST.dato), cel('Sin ahorros registrados', ST.dato), cel('', ST.dato), cel('', ST.dato) ]);
        } else {
          [...ahorros]
            .sort((a, b) => a.fecha.localeCompare(b.fecha))
            .forEach((ahorro, i) => {
              const alt  = i % 2 === 1;
              const f    = new Date(ahorro.fecha + 'T12:00:00');
              const dia  = f.toLocaleDateString('es-PE', { weekday: 'long' });
              const fStr = f.toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' });
              p.push([
                cel(i + 1,                                              alt ? ST.datoAlt : ST.dato),
                cel(fStr,                                               alt ? ST.datoAlt : ST.dato),
                cel(dia.charAt(0).toUpperCase() + dia.slice(1),         alt ? ST.datoAlt : ST.dato),
                cel(ahorro.monto, alt ? ST.montoAlt : ST.monto,         '#,##0.00'),
              ]);
            });

          const total = ahorros.reduce((s: number, a: any) => s + a.monto, 0);
          p.push(filaVacia(M));
          p.push([ cel('', ST.totalLbl), cel('', ST.totalLbl), cel('TOTAL AHORRADO', ST.totalLbl), cel(total, ST.totalVal, '#,##0.00') ]);
        }

        const ws = XlsxStyle.utils.aoa_to_sheet(p);
        ws['!cols']   = [{ wch:5 },{ wch:14 },{ wch:18 },{ wch:20 }];
        ws['!rows']   = [{ hpt:30 },{ hpt:18 },{ hpt:8 },{ hpt:24 }];
        ws['!merges'] = [
          { s:{ r:0,c:0 }, e:{ r:0,c:M-1 } },
          { s:{ r:1,c:0 }, e:{ r:1,c:M-1 } },
        ];
        XlsxStyle.utils.book_append_sheet(wb, ws, hoja);
      });

      XlsxStyle.writeFile(wb, `AhorroMindSet_Reporte_${new Date().toISOString().split('T')[0]}.xlsx`);
      this.isGenerating.set(false);
    });
  }

  porcentaje(plan: PlanAhorro): number {
    if (!plan.metaMensual) return 0;
    return Math.min(100, Math.round((plan.montoRecibido / plan.metaMensual) * 100));
  }

  mesEs(mes: string): string { return MESES_ES[mes] ?? mes; }

  simbolo(moneda: string): string {
    return this.monedas.find(m => m.value === moneda)?.symbol ?? 'S/.';
  }

  logout() { this.authService.logout(); }
}






