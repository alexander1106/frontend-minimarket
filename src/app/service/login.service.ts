import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class LoginService  {
    private roles: string[] = [];

setRoles(roles: string[]) {
    this.roles = roles;
    localStorage.setItem('roles', JSON.stringify(roles));
  }
 public setRol(rol: string) {
    localStorage.setItem('rol', rol);
  }

  public hasRole(role: string): boolean {
    const rolGuardado = this.getRol();
    return rolGuardado === role;
  }
  public getRol(): string | null {
    return localStorage.getItem('rol');
  }
  public hasAnyRole(roles: string[]): boolean {
    const rolGuardado = this.getRol();
    return roles.includes(rolGuardado!);
  }

  public logout() {
    const recordado = localStorage.getItem('usuarioRecordado');
    localStorage.clear();
    if (recordado) localStorage.setItem('usuarioRecordado', recordado);
  }

  public usuarioRecordado(): string {
    return localStorage.getItem('usuarioRecordado') || '';
  }

  public recordarSesion(recordar: boolean, username: string): void {
    if (recordar) {
      localStorage.setItem('usuarioRecordado', username);
      localStorage.removeItem('sesionTemporal');
      document.cookie = 'sesionActiva=; Max-Age=0; path=/';
    } else {
      localStorage.removeItem('usuarioRecordado');
      localStorage.setItem('sesionTemporal', '1');
      document.cookie = 'sesionActiva=1; path=/; SameSite=Lax';
    }
  }

  public cerrarSesionTemporalSiCorresponde(): void {
    if (localStorage.getItem('sesionTemporal') !== '1') return;
    if (/(?:^|;\s*)sesionActiva=1/.test(document.cookie)) return;
    this.logout();
  }
  getRoles(): string[] {
    if (this.roles.length > 0) {
      return this.roles;
    }
    const stored = localStorage.getItem('roles');
    return stored ? JSON.parse(stored) : [];
  }

  public loginStatusSubjec = new Subject<boolean>();

  constructor(private httpClient:HttpClient) { }

  public generarToken(loginData: any) {
    return this.httpClient.post(`${baseUrl}/login`, loginData);
  }

  public loginUser(token:any){
    localStorage.removeItem('modulos');
    localStorage.setItem('token', token);
  }

  public isLoggedIn(): boolean {
    return this.tokenVigente();
  }

  /** ¿Hay token y su fecha de vencimiento (exp) aún no pasó? Si el token no trae exp se asume vigente. */
  public tokenVigente(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return !payload.exp || payload.exp * 1000 > Date.now();
    } catch {
      return true; // no es un JWT legible: que decida el servidor
    }
  }
  public getToken(){
    return localStorage.getItem('token');

  }
public getEmpresa() {
  const empresaStr = localStorage.getItem('empresa');
  if (empresaStr != null) {
    return JSON.parse(empresaStr);
  }
  return null;
}

  public setUser(user:any){
     localStorage.setItem('user',JSON.stringify(user));
  }

  public getUser(){
    let userStr=localStorage.getItem('user');
    if(userStr!=null){
      return JSON.parse(userStr);
    }else{
      this.logout();
      return null;
    }
  }
  public getUserRole(): string | null {
    const user = this.getUser();
    console.log("Usuario cargado:", user);
    if (user && user.rol && user.rol.nombre) {
      return user.rol.nombre;
    }
    console.warn("No se encontró un rol válido");
    return null;
  }

  public getCurrentUser(){
    return this.httpClient.get(`${baseUrl}/usuario-actual`);
  }
  enviarEmail(email: string): Observable<any> {
    return this.httpClient.post(`${baseUrl}/enviar-link-recuperacion`, { email }, { responseType: 'text' });
  }

  resetPassword(token: string, nuevaClave: string): Observable<any> {
    return this.httpClient.post(`${baseUrl}/reset-password`, { token, nuevaClave }, { responseType: 'text' });
  }
  // Módulos (secciones del menú) permitidos para el rol, según la tabla roles-módulos del backend
  cargarModulosPermitidos(): Observable<string[]> {
    return this.httpClient.get<any[]>(`${baseUrl}/mis-modulos`).pipe(
      map(lista => (lista || [])
        .map(m => typeof m === 'string' ? m : m?.nombre)
        .filter(Boolean)
        .map(String)),
      tap(nombres => localStorage.setItem('modulos', JSON.stringify(nombres)))
    );
  }

  /** ¿Puede escribir en un módulo? Usa los módulos del login; si no hay, los roles de respaldo. SUPERADMIN nunca. */
  public puedeEscribirModulo(modulo: string, rolesRespaldo: string[]): boolean {
    if (this.hasRole('SUPERADMIN')) return false;
    const modulos = this.getModulosPermitidos();
    return modulos ? modulos.includes(modulo) : this.hasAnyRole(rolesRespaldo);
  }

  getModulosPermitidos(): string[] | null {
    try {
      const raw = localStorage.getItem('modulos');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  public setUsername(username: string) {
  localStorage.setItem('username', username);
}

public getUsername(): string | null {
  return localStorage.getItem('username');
}

}
