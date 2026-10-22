import { Injectable, signal } from '@angular/core';
import { Song } from '../models/song';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  // Reproduciendo
  isPlaying = signal(false);

  // Canción que se está reproduciendo
  currentSong = signal<Song | null>(null);

  // Lista de reproducción activa
  playlist = signal<Song[]>([]);

  // Posición de la canción actual dentro de la lista
  currentIndex = signal(-1);

  // Indica si el modo aleatorio está activado
  shuffle = signal(false);

  // Indica si se repite la canción actual
  repeatSong = signal(false);

  // Reproducir una canción dentro de una lista
  playSong(song: Song, songs: Song[]) {

    // Guardamos la lista de reproducción
    this.playlist.set(songs);

    // Buscamos la posición de la canción seleccionada
    const index = songs.findIndex(item => item._id === song._id);

    // Si la encontramos, la reproducimos
    if (index !== -1) {

      // Guardamos su posición
      this.currentIndex.set(index);

      // Guardamos la canción actual
      this.currentSong.set(song);
    }
  }

  // Reproducir la siguiente canción
  nextSong() {

    const songs = this.playlist();

    // Si no hay canciones, no hacemos nada
    if (songs.length === 0) {
      return;
    }

    // Modo aleatorio
    if (this.shuffle()) {

      // Si solo hay una canción, no hay otra a la que avanzar
      if (songs.length === 1) {
        return;
      }

      let randomIndex: number;

      // Elegimos una canción diferente de la actual
      do {
        randomIndex = Math.floor(Math.random() * songs.length);
      } while (randomIndex === this.currentIndex());

      this.currentIndex.set(randomIndex);
      this.currentSong.set(songs[randomIndex]);

      return;
    }

    // Modo normal
    const nextIndex = this.currentIndex() + 1;

    if (nextIndex < songs.length) {
      this.currentIndex.set(nextIndex);
      this.currentSong.set(songs[nextIndex]);
    }
  }

  // Reproducir la canción anterior
  previousSong() {

    // Obtenemos la lista actual
    const songs = this.playlist();

    // Calculamos el índice de la canción anterior
    const previousIndex = this.currentIndex() - 1;

    // Comprobamos que exista una canción anterior
    if (previousIndex >= 0) {

      // Actualizamos el índice
      this.currentIndex.set(previousIndex);

      // Seleccionamos la canción anterior
      this.currentSong.set(songs[previousIndex]);
    }
  }

  // Activar o desactivar el modo aleatorio
  toggleShuffle() {
    this.shuffle.update(value => !value);
  }

  // Activar o desactivar la repetición de la canción actual
  toggleRepeatSong() {
    this.repeatSong.update(value => !value);
  }

  // Eliminar una canción de la lista de reproducción
  removeSong(songId: string): boolean {

    const songs = this.playlist();
    const currentSong = this.currentSong();

    // Comprobamos si la canción eliminada es la actual
    const isCurrentSong = currentSong?._id === songId;

    // Eliminamos la canción de la playlist
    const updatedPlaylist = songs.filter(song => song._id !== songId);

    this.playlist.set(updatedPlaylist);

    // Si no es la canción actual, actualizamos el índice
    if (!isCurrentSong) {

      const currentIndex = updatedPlaylist.findIndex(
        song => song._id === currentSong?._id
      );

      this.currentIndex.set(currentIndex);

      return false;
    }

    // Si era la canción actual, limpiamos el reproductor
    this.isPlaying.set(false);
    this.currentSong.set(null);
    this.currentIndex.set(-1);

    // Indicamos que hay que detener el audio
    return true;
  }

}