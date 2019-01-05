import { Movie } from './../../models/movie.model';
import { SqliteHelperProvider } from './../sqlite-helper/sqlite-helper.provider';
import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class MovieProvider {

  private db: SQLiteObject;
  private isFirstCall: boolean = true;

  constructor(
    public sqliteHelperProvider: SqliteHelperProvider
  ) {}

  private getDB(): Promise<SQLiteObject> {

    if(this.isFirstCall) {

      this.isFirstCall = false;

      return this.sqliteHelperProvider.getDB('dynamicbox.db')
        .then((db: SQLiteObject) => {

          this.db = db;

          this.db.executeSql('CREATE TABLE IF NOT EXISTS movie (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)', [])
            .then(success => console.log('Movie table created successfully!', success))
            .catch((error: Error) => console.log('Error creating movie table!', error));

          return this.db;

        });

    }

    return this.sqliteHelperProvider.getDB();

  }

  getAll(orderBy?: string): Promise<Movie[]> {

    return this.getDB()
      .then((db: SQLiteObject) => {
        return <Promise<Movie[]>>this.db.executeSql(`SELECT * FROM movie ORDER BY id ${orderBy || 'DESC'}`, [])
          .then(resultSet => {

            let list: Movie[] = [];

            for(let i = 0; i < resultSet.rows.lenght; i++) {

              //list.push(resultSet.rows.item[i]);
              list.push(resultSet.rows.item(i));

            }

            return list;

          }).catch((error: Error) => console.log('Error executing method getAll!', error));
      });

  }

  create(movie: Movie): Promise<Movie> {

    return this.db.executeSql('INSERT INTO movie (title) VALUES (?)', [movie.title])
      .then(resulSet => {
        movie.id = resulSet.insertId;
        return movie;
      }).catch((error: Error) => {
        console.log(`Error creating '${movie.title}' movie`, error);

        let errorMsg: string = '...';
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });

  }

  update(movie: Movie): Promise<boolean> {
    return this.db.executeSql('UPDATE movie SET title=? WHERE id=?', [movie.title, movie.id])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        console.log(`Error updating ${movie.title} movie!`, error)
        let errorMsg: string = '...';
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });

  }

  delete(id: number): Promise<boolean> {

    return this.db.executeSql('DELETE FROM movie WHERE id=?', [id])
    .then(resultSet => resultSet.rowsAffected > 0)
    .catch((error: Error) => {
      console.log(`Error deleting movie with id ${id}!`, error)
      let errorMsg: string = '...';
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });

  }

  getById(id: number): Promise<Movie> {
    return this.db.executeSql('SELECT * FROM movie WHERE id=?', [id])
      .then(resultSet => resultSet.rows.item(0))
      //.then(resultSet => resultSet.rows.item[0])
      .catch((error: Error) => {
        console.log(`Error fetching movie with id ${id}!`, error)
        let errorMsg: string = '...';
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });

  }

}
