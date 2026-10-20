import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { SongService } from '../../services/song.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-album-detail',
  imports: [RouterLink],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css',
})
export class AlbumDetail {

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

  //Eliminar cancion de album
  onDeleteSong(id: string){

    this._songService.deleteSong(id).subscribe({

        next: (response) => {

            console.log(response.message);

            this._route.params.subscribe(params => {

              const albumId = params['id'];

              // Volvemos a cargar canciones de album
              this.getSongs(albumId);

            });
        },

        error: (error) => {

          console.error('Error al eliminar cancion:', error);

        }

    });

  }

}
