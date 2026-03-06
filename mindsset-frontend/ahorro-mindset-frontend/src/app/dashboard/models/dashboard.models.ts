export interface PlanAhorro {
  id: number;
  metaMensual: number;
  tipoMoneda: 'PEN' | 'USD' | 'EUR';
  mes: string;
  montoRecibido: number;
  metaRestante: number;
  metaAlcanzada: boolean;
  usuarioId: number;
}

export interface Ahorro {
  id: number;
  fecha: string;
  monto: number;
  planAhorroId: number;
}

export interface AhorroSemana {
  dia: string;      
  fecha: string;
  monto: number | null;
  esHoy: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}