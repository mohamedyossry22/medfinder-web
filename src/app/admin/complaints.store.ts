import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';

/** عدد الشكاوى الجديدة (البادج في القايمة الجانبية) */
@Injectable({ providedIn: 'root' })
export class ComplaintsStore {
  private api = inject(ApiService);
  readonly newCount = signal(0);

  refresh() {
    this.api.complaintsNewCount().subscribe({ next: r => this.newCount.set(r.newCount), error: () => { /* البادج مش حرج */ } });
  }
}
