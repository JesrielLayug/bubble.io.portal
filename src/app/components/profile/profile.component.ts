import { Component, OnInit } from '@angular/core';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [EditProfileComponent, CommonModule, LoaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{

  profile: Observable<Profile> | null = null;

  constructor(private ProfileService: ProfileService, private router: Router, private ToastService: ToastService){}

  async ngOnInit(): Promise<void> {
      this.profile = await this.ProfileService.get();
  }

  handleEditProfile(): void {
    // Reload the page
    // window.location.reload();

    setTimeout(() => {
      // Show toast after the delay
      this.ToastService.showInfoToast("Successfully updated your profile.");
    }, 1000);
}
}
