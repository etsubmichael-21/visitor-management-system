import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse, PageRequest } from '../models/paged-response.model';

@Injectable({ providedIn: 'root' })
export abstract class BaseService<T> {
  protected abstract basePath: string;
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  getAll(request?: PageRequest): Observable<PagedResponse<T>> {
    let params = new HttpParams();
    if (request) {
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<PagedResponse<T>>(`${this.apiUrl}/${this.basePath}`, { params });
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${this.basePath}/${id}`);
  }

  create(entity: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${this.basePath}`, entity);
  }

  update(id: number, entity: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${this.basePath}/${id}`, entity);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.basePath}/${id}`);
  }
}
