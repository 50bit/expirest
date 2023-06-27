import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GovernoratesSchema } from './schemas/governorates.schema';
import { CitiesSchema } from './schemas/cities.schema';
import GOVERNORATES from './constants/governorates.json';
import CITIES from './constants/cities.json';
import { Logger } from '@nestjs/common';
import { aggregationMan } from './utils/aggregationMan.utils';
const logger = new Logger('DB');

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'governorates', schema: GovernoratesSchema },
      { name: 'cities', schema: CitiesSchema }
    ]),
  ]
})
export class CommonModule {

  constructor(
    @InjectModel('governorates') public readonly governorates: Model<any>,
    @InjectModel('cities') public readonly cities: Model<any>
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
    // console.log(JSON.stringify(aggregationMan(lookupConfig, {})))
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
