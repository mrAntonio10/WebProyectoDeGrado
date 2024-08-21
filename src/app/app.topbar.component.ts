import { Component } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { LoginService } from './services/login/home.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    constructor(public app: AppMainComponent,
        private userService: LoginService,
        private router: Router,
    ) {}

    logOut() {
        let resourceUrl: String;
        this.userService.logOutUser().subscribe({
            next: resp => {
              if (resp) {
                resourceUrl = resp.data.response;
              }
            },
            complete:() => {
                if(resourceUrl){
                    this.router.navigate([resourceUrl]);
                }
            },
        }
        );
    }

}
