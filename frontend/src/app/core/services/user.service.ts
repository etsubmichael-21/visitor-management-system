import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserCreate, UserUpdate } from '../models/user.model';
import { PagedResponse, PageRequest } from '../models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getAll(request?: PageRequest): Observable<PagedResponse<User>> {
    return this.http.get<PagedResponse<User>>(this.apiUrl, { params: request as any });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: UserCreate): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: number, user: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activate(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
