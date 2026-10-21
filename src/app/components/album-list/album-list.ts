import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { RouterLink } from '@angular/router';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-album-list',
  imports: [RouterLink, ConfirmModal],
  templateUrl: './album-list.html',
  styleUrl: './album-list.css',
})
export class AlbumList {

  //Variables
  @ViewChild(ConfirmModal) confirmModal!: ConfirmModal;

  selectedAlbumId: string | null = null;

  albums = signal<any[]>([]);

  //Constructor
  constructor(
    private _albumService: AlbumService,
    public authService: AuthService,
    private _userService: UserService
  ){}

  ngOnInit(){

    //Peristimos idenidad y token
    this.authService.identity.set(
      this._userService.getIdentity()
    );

    this.authService.token.set(
      this._userService.getToken()
    );

    this.getAlbums();
  }

  //Obtener albums
  getAlbums(){

    this._albumService.getAlbumsAll().subscribe({

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

  // Eliminar la álbum después de confirmar
  confirmDeleteSong() {

    if (!this.selectedAlbumId) {
      return;
    }

    const id = this.selectedAlbumId;

    this._albumService.deleteAlbum(id).subscribe({

        next: (response) => {

            console.log(response.message);

              // Volvemos a cargar albums de artista
              this.getAlbums();

        },

        error: (error) => {

          console.error('Error al eliminar artista:', error);

        }

    });

  }
}
