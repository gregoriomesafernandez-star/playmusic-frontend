import { Component, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { SongService } from '../../services/song.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-album-detail',
  imports: [RouterLink, ConfirmModal],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css',
})
export class AlbumDetail {

  @ViewChild(ConfirmModal) confirmModal!: ConfirmModal;

  selectedSongId: string | null = null;

  // Variables
  success_message = signal('');

  //Obtener album
  title = signal('');
  description = signal('');
  year = signal('');
  image = signal('');
  id = signal('');

  //Obtener canciones de album
  songs = signal<any[]>([]);

  //Constructor
  constructor(
    private _albumService: AlbumService,
    private _songService: SongService,
    private _route: ActivatedRoute,
    public authService: AuthService,
    public _playerService: PlayerService
    
  ){}

  ngOnInit(): void {

    // Obtenemos el ID del album de la URL
    this._route.params.subscribe(params => {

      const albumId = params['id'];

      this.getAlbum(albumId);
      this.getSongs(albumId);
    });

  }

  // Obtener album
  getAlbum(id: string){

    this._albumService.getAlbum(id).subscribe({

        next: (response) => {

          console.log('Album obtenido:', response);

          // Rellenamos los inputs
          this.id.set(response.album._id);
          this.title.set(response.album.title);
          this.description.set(response.album.description);
          this.year.set(response.album.year);
          this.image.set(response.album.image);


        },

        error: (error) => {
          console.error('Error al obtener el album:', error);
        }

      });

  }

  //Obtener canciones de album
  getSongs(id: string){

    this._songService.getSongs(id).subscribe({

        next: (response) => {

          this.songs.set(response.songs);

        },

        error: (error) => {
          console.error('Error al obtener las canciones del album:', error);
        }

      });

  }

  // Abrir el modal de confirmación
  onDeleteSong(id: string) {
    this.selectedSongId = id;
    this.confirmModal.open();
  }

  // Eliminar canción del álbum después de confirmar
  confirmDeleteSong(): void {

    if (!this.selectedSongId) {
      return;
    }

    const id = this.selectedSongId;

    this._songService.deleteSong(id).subscribe({

      next: (response) => {

        console.log(response.message);

        // Eliminar la canción de la playlist del reproductor
        const stopPlayer = this._playerService.removeSong(id);

        // Si era la canción actual, detener el audio
        if (stopPlayer) {
          window.dispatchEvent(
            new CustomEvent('playmusic:stop-audio')
          );
        }

        // Limpiar la canción seleccionada
        this.selectedSongId = null;

        // Actualizar las canciones del álbum
        this.getSongs(this.id());

      },

      error: (error) => {
        console.error('Error al eliminar canción:', error);
      }

    });

  }

  back() {
    window.history.back();
  }

}
