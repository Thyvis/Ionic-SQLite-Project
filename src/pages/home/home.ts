import { MovieProvider } from './../../providers/movie/movie.provider';
import { Movie } from './../../models/movie.model';
import { Component } from '@angular/core';
import { NavController, AlertController, ItemSliding, AlertOptions, Loading, LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  movies: Movie[] = [];

  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController,
    public movieProvider: MovieProvider,
    public navCtrl: NavController) {

  }

  ionViewDidLoad() {
    this.movieProvider.getAll()
      .then((movies: Movie[]) => {
        this.movies = movies;
      });
  }

  private showAlert(options: {itemSliding?: ItemSliding, title: string, type: string, movie?: Movie}): void {

    let alertOptions: AlertOptions = {
      title: options.title,
      inputs: [
        {
          name: 'title',
          placeholder: 'Movie title'
        }
      ],
      buttons: [
        'Cancel',
        {
          text: 'Save',
          handler: (data) => {
            let loading: Loading = this.showLoading(`Saving ${data.title} movie...`);
            let contextMovie: Movie;

            switch(options.type) {
              case 'create':
                contextMovie = new Movie(data.title);
                break;
              case 'update':
                options.movie.title = data.title;
                contextMovie = options.movie;
                break;
            }

            this.movieProvider[options.type](contextMovie)
              .then((result: any) => {
                if(options.type === 'create') this.movies.unshift(result);

                loading.dismiss();

                if(options.itemSliding) options.itemSliding.close();

              });
          }
        }
      ]
    };

    if(options.type === 'update') {

      alertOptions.inputs[0]['value'] = options.movie.title;

    }

    this.alertController.create(alertOptions).present();

  }

  private showLoading(message?: string): Loading {

    let loading: Loading = this.loadingController.create({
      content: message || 'Please wait...'
    });

    loading.present();

    return loading;

  }

  onSave(type: string, item?: ItemSliding, movie?: Movie): void {

    console.log('type: ', type, 'item: ', item, 'movie: ', movie);


    let title: string = type.charAt(0).toUpperCase() + type.substr(1);

    this.showAlert({
      itemSliding: item,
      title: `${title} movie`,
      type: type,
      movie: movie
    });
  }

  onDelete(movie: Movie): void {

    this.alertController.create({
      title: `Do you want to delete ${movie.title} movie?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loading: Loading = this.showLoading(`Deleting '${movie.title}'...`);

            this.movieProvider.delete(movie.id)
              .then((deleted: boolean) => {
                if(deleted) {
                  this.movies.splice(this.movies.indexOf(movie), 1);
                }
                loading.dismiss();
              });
          }
        },
        'No'
      ]
    }).present();

  }

}
