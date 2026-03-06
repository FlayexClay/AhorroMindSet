import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ahorro, ApiResponse, PlanAhorro } from "../models/dashboard.models";

@Injectable({ providedIn: 'root'})
export class DashboardService {
    private http = inject(HttpClient);
    private base = environment.apiUrl;

    getMisPlanes(): Observable<ApiResponse<PlanAhorro[]>> {
        return this.http.get<ApiResponse<PlanAhorro[]>>(`${this.base}/planes`);
    }

    getMisPlan(id: number): Observable<ApiResponse<PlanAhorro>> {
        return this.http.get<ApiResponse<PlanAhorro>>(`${this.base}/planes/${id}`);
    }

    getAhorrosPorPlan(planId: number): Observable<ApiResponse<Ahorro[]>> {
    return this.http.get<ApiResponse<Ahorro[]>>(`${this.base}/planes/${planId}/ahorros`);
    }

    crearPlan(data: { metaMensual: number; tipoMoneda: string; mes: string }): Observable<ApiResponse<PlanAhorro>> {
    return this.http.post<ApiResponse<PlanAhorro>>(`${this.base}/planes`, data);
    }
    registrarAhorro(planId: number, fecha: string, monto: number): Observable<ApiResponse<Ahorro>> {
        return this.http.post<ApiResponse<Ahorro>>(
            `${this.base}/planes/${planId}/ahorros`,
            { fecha, monto }
        );
    }
}
