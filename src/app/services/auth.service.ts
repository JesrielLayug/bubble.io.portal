import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpClient, HttpResponse, HttpStatusCode, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Response } from '../models/response';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Claim } from '../models/claim';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAthenticationSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAthenticationSubject.asObservable();

  private token: string | null = null;

  constructor(private Httpclient: HttpClient) { 
    this.checkAuthentication();
  }

  async login(email: string, password: string): Promise<{ isSuccess: boolean; message: string }>{
    const user: User = {
      email: email,
      password: password
    }

    try{
      const response: any = await this.Httpclient.post<any>(
        `${environment.apiUrl}/login`,
        user,
        { observe: 'response' }
      ).toPromise();

      if(response?.status == 200){
        const accessToken = response.body?.accessToken;

            if (accessToken) {
                this.setToken(accessToken);
                return { isSuccess: true, message: "Login successful" };
            }
      }
        return {isSuccess: false, message: "Account does not exist"};
    }
    catch(error: any) {
      if (error.status === 401) {
        return { isSuccess: false, message: 'Incorrect email or password' };
      } else {
        console.error('An unexpected error occurred:', error.message);
        throw error;
      }
    }
  }


  register(user: User): Observable<Response> {
    return this.Httpclient.post(`${environment.apiUrl}/register`, user, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return {
            isSuccess: true,
            message: "Successfully register user"
          };
        } else {
          return {
            isSuccess: false,
            message: "Failed to register user"
          };
        }
      }),
      catchError((error) => {
        console.error('Error during registration:', error);

      let errorMessage = 'An error occurred during registration.';
          
      if (error instanceof HttpErrorResponse) {
        if (error.status === 400) {
          errorMessage = 'Bad Request. Please check your input data.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please check your credentials.';
        } else {
          errorMessage = `Server returned status ${error.status}.`;
        }
      }
      return throwError(errorMessage);
      })
    );
  }

  logout(){
    this.token = null;
    localStorage.removeItem('token');
    this.isAthenticationSubject.next(false);
  }

  checkAuthentication() : boolean{
    const storedToken = localStorage.getItem('token');
    if(storedToken){
      this.token = storedToken;
      this.isAthenticationSubject.next(true);
      return true;
    }
    return false;
  }

  setToken(token: string){
    this.token = token;
    localStorage.setItem('token', token);
    this.isAthenticationSubject.next(true);
  }

  getAuthorizationHeader(): HttpHeaders{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`
    })
    return headers;
  }
}

