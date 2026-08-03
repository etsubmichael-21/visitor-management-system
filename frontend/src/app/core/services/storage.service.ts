import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch {}
  }

  getObject<T>(key: string): T | null {
    const json = this.get(key);
    if (!json) return null;
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  setObject(key: string, value: unknown): void {
    this.set(key, JSON.stringify(value));
  }
}
