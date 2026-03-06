import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        canActivate: [publicGuard],
        children: [
            {
                path: 'login',
                loadComponent: () => 
                    import('./auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => 
                    import('./auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'dashboard/realizar-ahorro',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./dashboard/realizar-ahorro/realizar-ahorro.component').then(m => m.RealizarAhorroComponent)
    },
    {
        path: 'dashboard/fechas',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./dashboard/fechas/fechas.component').then(m => m.FechasComponent)
    },
    {
        path: 'dashboard/plan-ahorro',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./dashboard/plan-ahorro/plan-ahorro.component').then(m => m.PlanAhorroComponent)
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
