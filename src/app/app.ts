import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from './services/user.service';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { PlayerService } from './services/player.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink, RouterOutlet, LucideAngularModule, RouterLinkActive],
  templateUrl: './app.html'
})
export class App implements OnInit {


  // Variables
  title = signal('PlayMUSIC');

  errorMessage = signal('');
  success_message = signal('');
  menuOpen = signal(false);

  // REPRODUCTOR
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);

  // LOGIN
  email = "";
  password = "";

  // REGISTRO
  name = "";
  surname = "";
  registerEmail = "";
  registerPassword = "";

  constructor(
    private _userService: UserService,
    public authService: AuthService,
    public _playerService: PlayerService
  ) {}

  ngOnInit(){

    //Peristimos idenidad y token
    this.authService.identity.set(
      this._userService.getIdentity()
    );

    this.authService.token.set(
      this._userService.getToken()
    );

  }

  // Reproducir o pausar la canción
  togglePlay() {

    const audio = this.audioPlayer.nativeElement;

    if (audio.paused) {

      audio.play().then(() => {
        this.isPlaying.set(true);
      }).catch(error => {
        console.error('Error al reproducir el audio:', error);
      });

    } else {

      audio.pause();
      this.isPlaying.set(false);

    }

  }

  // Actualizar el tiempo y la duración del audio
  updateProgress() {
    const audio = this.audioPlayer.nativeElement;

    this.currentTime.set(audio.currentTime);

    this.duration.set(
      Number.isFinite(audio.duration) ? audio.duration : 0
    );

  }

  // Cambiar la posición de reproducción
  seek(event: Event) {
    const audio = this.audioPlayer.nativeElement;
    const input = event.target as HTMLInputElement;

    audio.currentTime = Number(input.value);
    this.currentTime.set(audio.currentTime);
  }

  // Convertir segundos a formato mm:ss
  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Repetir la canción actual o pasar a la siguiente
  handleSongEnded() {
    const audio = this.audioPlayer.nativeElement;

    if (this._playerService.repeatSong()) {
      
      audio.currentTime = 0;

      audio.play().catch(error => {
        console.error('Error al repetir la canción:', error);
      });
      
    } else {
      this._playerService.nextSong();
    }
  }

  //Volumen
  changeVolume(event: Event) {
    const input = event.target as HTMLInputElement;
    const newVolume = Number(input.value);

    this.volume.set(newVolume);
    this.audioPlayer.nativeElement.volume = newVolume;
  }
  
  //Login
  onLogin(loginForm: NgForm) {

    //Borramos mensaje de error si lo hay
    this.errorMessage.set('');

    //Peticion al backend con servicio
    this._userService.login(this.email, this.password)
      .subscribe({
        next: (response) => {

          console.log('Respuesta del servidor:', response);

          //Guardamos respuesta de usuario y token en variables signal de servicio
          this.authService.identity.set(response.user);
          this.authService.token.set(response.token);

          // Guardamos en localStorage
          localStorage.setItem('identity', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);

          //Reseteamos login
          loginForm.resetForm();

        },

        error: (error) => {
          console.error('Error en el login:', error);
          this.errorMessage.set('El correo o la contraseña no son correctos');
        }
      });
  }

  //Cerrar sesión
  logout() {
    localStorage.removeItem('identity');
    localStorage.removeItem('token');

    this.authService.identity.set(null);
    this.authService.token.set(null);

    //Limpiamos mensaje success de registro
    this.success_message.set('');
  }

  //Registro de usuario
  onRegister(registerForm: NgForm) {

    this._userService.register(
      this.name,
      this.surname,
      this.registerEmail,
      this.registerPassword
    ).subscribe({
      next: (response) => {
        console.log('Registro correcto:', response);

        this.success_message.set('Se ha creado el usuario correctamente. Identíficate con '+ response.email);

        //Reseteamos registro
        registerForm.resetForm();

      },

      error: (error) => {
        console.error('Error en el registro:', error);
      }
    });

  }
}
