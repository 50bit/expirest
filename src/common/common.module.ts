import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GovernoratesSchema } from '../modules/governorate/schemas/governorates.schema';
import { CitiesSchema } from '../modules/city/schemas/cities.schema';
import GOVERNORATES from './data/governorates.json';
import CITIES from './data/cities.json';
import { Logger } from '@nestjs/common';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { DrugsSchema } from '../modules/drug/schemas/drugs.schema';
import { isNaN } from 'lodash';

const logger = new Logger('DB');

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'governorates', schema: GovernoratesSchema },
      { name: 'cities', schema: CitiesSchema },
      { name: 'drugs', schema: DrugsSchema }
    ]),
  ]
})
export class CommonModule {

  constructor(
    @InjectModel('governorates') public readonly governorates: Model<any>,
    @InjectModel('cities') public readonly cities: Model<any>,
    @InjectModel('drugs') public readonly drugs: Model<any>
  ) {
    const constsArray = [
      {
        model: governorates,
        data: GOVERNORATES,
        label: "Governorates"
      },
      {
        model: cities,
        data: CITIES,
        label: "Cities"
      }
    ]

    this.fillDB(constsArray)
    this.addDrugs()
    // console.log(JSON.stringify(aggregationMan(lookupConfig, {})))
  }

  addDrugs() {
    const DRUGS = []
    const csvPath = path.join(__dirname.replace("/dist", "/src"), '/data/Drugs-5-2023Dbase.csv');
    fs.createReadStream(csvPath)
      .pipe(csvParser({ separator: ',' }))
      .on('data', (data) => {
        delete data['']
        data.price = isNaN(parseFloat(data.price)) ? 0.0 : parseFloat(data.price)
        DRUGS.push(data)
      })
      .on('end', () => {
        const constsArray = [
          {
            model: this.drugs,
            data: DRUGS,
            label: "Drugs"
          }
        ]
        this.fillDB(constsArray)
      });
  }

  fillDB(constsArray) {
    for (const el of constsArray) {
      const model = el.model
      const data = el.data
      const label = el.label || ''
      model.find({}).count().then((count) => {
        if (count === 0) {
          model.insertMany(data)
          logger.log(`${label} data inserted successfully`);
        } else {
          logger.log(`${label} collection was already intiallized with ${count} records`);
        }
      })
    }
  }
}
