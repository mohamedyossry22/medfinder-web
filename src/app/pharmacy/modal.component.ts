import { AfterViewInit, Component, ElementRef, ViewChild, input, output } from '@angular/core';

/** نافذة حوار بسيطة: بتتقفل بـ Esc أو بالضغط برّه، والتركيز بيروح عليها أول ما تفتح */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
  <div class="ov" (click)="closed.emit()"></div>
  <div class="box" role="dialog" aria-modal="true" [attr.aria-label]="title()" tabindex="-1" #box (keydown.escape)="closed.emit()">
    <div class="hd"><h3>{{ title() }}</h3><button class="x" type="button" aria-label="إغلاق" (click)="closed.emit()">✕</button></div>
    <ng-content></ng-content>
  </div>`,
  styles: [`
    :host { position:fixed; inset:0; z-index:100; display:grid; place-items:center; padding:16px; }
    .ov { position:absolute; inset:0; background:rgba(16,32,28,.5); }
    .box { position:relative; background:var(--surface); color:var(--text); border-radius:var(--radius); border:1px solid var(--line);
      width:100%; max-width:540px; max-height:90vh; overflow:auto; padding:22px; display:flex; flex-direction:column; gap:14px; outline:none; }
    .hd { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .x { border:0; background:transparent; color:var(--muted); font-size:18px; cursor:pointer; min-width:36px; min-height:36px; }
  `]
})
export class ModalComponent implements AfterViewInit {
  title = input('');
  closed = output<void>();
  @ViewChild('box') private box!: ElementRef<HTMLElement>;
  ngAfterViewInit() { this.box.nativeElement.focus(); }
}
