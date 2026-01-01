import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // add this line to import the service


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements AfterViewInit , OnInit{
  title = 'lunatria-website';
  constructor(private translate: TranslateService) {}
  private toastr = inject(ToastrService);

  ngAfterViewInit(): void {
    // Trigger container creation
    this.toastr.clear(); // Clears the empty toast
  }
  ngOnInit() {
    // Detect the user's language or default to English
    const lang = navigator.language.split('-')[0]; // Get 'pl' or 'en'
    this.translate.setDefaultLang('en'); // Set default language
    this.translate.use(lang); // Set language based on browser settings
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }
}