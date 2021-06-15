import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Employee } from '../modal/employee.modal';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  public baseUrl = 'http://localhost:3000/posts';
  constructor(private http: HttpClient) {}

  public fetchAllEmployees$(
    pageIndex: number,
    pageSize: number,
    match?: string
  ): Observable<Employee> {
    let params = {};
    if (match !== '') {
      params = { name: match };
    }

    return this.http.get(this.baseUrl, { params }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((err) => {
        console.log(err);
        return Observable.throw(err);
        // Handle errors here
      })
    );
  }

  public addEmployee(data: Employee): Observable<any> {
    return this.http.post('http://localhost:3000/posts', data).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((err) => {
        console.log(err);
        return throwError(err);
        // Handle errors here
      })
    );
  }

  public deleteEmployee(id: number): Observable<Employee> {
    return this.http.delete('http://localhost:3000/posts/' + id).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  public updateEmployee(data: Employee): Observable<Employee> {
    return this.http.put('http://localhost:3000/posts/' + data.id, data).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}
