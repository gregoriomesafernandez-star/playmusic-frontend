import { Component, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-artist-detail',
  imports: [RouterLink, ConfirmModal],
  templateUrl: './artist-detail.html',
  styleUrl: './artist-detail.css',
})
export class ArtistDetail {

  @ViewChild(ConfirmModal) confirmModal!: ConfirmModal;

  selectedAlbumId: string | null = null;

  // Obtener artista
  name = signal('');
  description = signal('');
  image = signal('');
  ArtistId = signal('');

  //Obtener albums de artista
  albums = signal<any[]>([]);

  //Constructor
  constructor(
    private _artistService: ArtistService,
    private _albumService: AlbumService,
    private _route: ActivatedRoute,
    public authService: AuthService
  ){}

  //Funciones
  ngOnInit(): void {
    
    this._route.params.subscribe(params => {

      const artistId = params['id'];

      this.getArtist(artistId);
      this.getAlbums(artistId);

    });

  }

  //Obtener artista
  getArtist(id: string){

    this._artistService.getArtist(id).subscribe({

        next: (response) => {

          console.log('Artista obtenido:', response);

          // Rellenamos los inputs
          this.ArtistId.set(response.artist._id);
          this.name.set(response.artist.name);
          this.description.set(response.artist.description);
          this.image.set(response.artist.image);


        },

        error: (error) => {
          console.error('Error al obtener el artista:', error);
        }

      });

  }

  //Obtener albums de artista
  getAlbums(id: string){

    this._albumService.getAlbums(id).subscribe({

        next: (response) => {

          this.albums.set(response.albums);

        },

        error: (error) => {
          console.error('Error al obtener los albums:', error);
        }

      });

  }

  // Abrir el modal de confirmación
  onDeleteAlbum(id: string) {
    this.selectedAlbumId = id;
    this.confirmModal.open();
  }

  // Eliminar álbum de artista después de confirmar
  confirmDeleteAlbum() {

    if (!this.selectedAlbumId) {
      return;
    }

    const id = this.selectedAlbumId;

    this._albumService.deleteAlbum(id).subscribe({

        next: (response) => {

            console.log(response.message);

            this._route.params.subscribe(params => {

              const artistId = params['id'];

              // Volvemos a cargar albums de artista
              this.getAlbums(artistId);

            });
        },

        error: (error) => {

          console.error('Error al eliminar artista:', error);

        }

    });

  }

  back() {
    window.history.back();
  }

}
