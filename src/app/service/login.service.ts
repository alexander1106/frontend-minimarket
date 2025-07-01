<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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

  // Verifica si el usuario tiene un rol
  public hasRole(role: string): boolean {
    const rolGuardado = this.getRol();
    return rolGuardado === role;
  }
 // Obtiene el rol
  public getRol(): string | null {
    return localStorage.getItem('rol');
  }
 // Verifica si el usuario tiene alguno de los roles permitidos
  public hasAnyRole(roles: string[]): boolean {
    const rolGuardado = this.getRol();
    return roles.includes(rolGuardado!);
  }

  // Logout
  public logout() {
    localStorage.clear();
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
    localStorage.setItem('token', token);
  }


  public isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  //obtenemos el token
  public getToken(){
    return localStorage.getItem('token');

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
    if (user && user.rol && user.rol.nombreRol) {
      console.log("Rol detectado:", user.rol.nombreRol);
      return user.rol.nombreRol;
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
  public setUsername(username: string) {
  localStorage.setItem('username', username);
}

public getUsername(): string | null {
  return localStorage.getItem('username');
}

}
=======
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class LoginService  {

  public loginStatusSubjec = new Subject<boolean>();

  constructor(private httpClient:HttpClient) { }

  public generarToken(loginData: any) {
    return this.httpClient.post(`${baseUrl}/login`, loginData);
  }

  public loginUser(token:any){
    localStorage.setItem('token', token);
  }
  public isLoggedIn(){
    let tokenStr= localStorage.getItem('token');
    if(tokenStr==undefined || tokenStr=='' ||tokenStr==null){
      return false;
    }else{
      return true;
    }
  }

  //cerramos sesion
  public logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;

  }

  //obtenemos el token
  public getToken(){
    return localStorage.getItem('token');

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
    if (user && user.rol && user.rol.nombreRol) {
      console.log("Rol detectado:", user.rol.nombreRol);
      return user.rol.nombreRol;
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

}
>>>>>>> 058cbc6a4c9021a15fe40018b006294083b61c7c
