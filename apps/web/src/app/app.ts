import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemePicker } from './shared/theme-picker';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemePicker],
  templateUrl: './app.html',
})
export class App {}
