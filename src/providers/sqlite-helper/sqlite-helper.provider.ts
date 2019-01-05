import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';

@Injectable()
export class SqliteHelperProvider {

  private db: SQLiteObject;

  constructor(
    //É uma boca prática sempre usar plataforma para iniciar o Cordova
    public platform: Platform,
    private sqlite: SQLite
  ) {

  }

  private createDatabase(dbName?: string): Promise<SQLiteObject> {

    return this.platform.ready()
      .then((readySource: string) => {
        return this.sqlite.create({
          name: dbName || 'dynamicbox.db',
          location: 'default'
        })
      }).then((db: SQLiteObject) => {
        this.db = db;
        return this.db;
      }).catch((error: Error) => {
        console.log('Error on open or create database: ', error)
        return Promise.reject(error.message || error);
      });

  }

  getDB(dbName?: string, newOpen?: boolean): Promise<SQLiteObject> {

    if(newOpen) return this.createDatabase(dbName);

    return(this.db) ? Promise.resolve(this.db) : this.createDatabase(dbName);

  }

}
