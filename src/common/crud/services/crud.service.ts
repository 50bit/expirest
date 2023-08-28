import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class CrudService {
  Model: any;
  constructor(model: any) {
    this.Model = model;
  }

  async aggregate(pipeline: any) {
    return await this.Model.aggregate(pipeline);
  }
  async findAllByLang(query: any, options: any, sortAttr?: any) {
    let skip = options.skip ? options.skip : 0;
    let limit = options.limit ? options.limit : 0;
    let sort = sortAttr.sort == 'desc' ? -1 : 1;
    if (sortAttr.sort) {
      delete sortAttr.sort;
    }
    const paginationPipeline = [
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      { $sort: { createdAt: sort } },
    ];
    const excludeUnActive = {
      $match: {
        isActive: { $ne: false },
      },
    };
    query.push(excludeUnActive);
    if (limit == 0) paginationPipeline.splice(1, 1);
    const items = await this.Model.aggregate([...query, ...paginationPipeline]);
    const totalDocs = await this.Model.aggregate([...query]);

    return {
      docs: items,
      totalDocs: totalDocs.length,
    };
  }

  async findAll(query: any, options: any) {
    let { skip, limit } = options;
    let sort = 'desc';
    if (query.sort) {
      sort = query.sort;
      delete query.sort;
    }

    skip = skip ? Number(skip) : 0;
    limit = limit ? Number(limit) : 0;
    try {
      let items = await this.Model.find({
        ...query,
        ...{ isActive: { $ne: false } },
      })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: sort === 'desc' ? -1 : 1 });

      let totalDocs = await this.Model.find(query).count();

      // this.Model.modelName

      return { docs: items, totalDocs };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async find(query: any) {
    let sort = 'asc';
    if (query.sort) {
      sort = query.sort;
      delete query.sort;
    }
    return await this.Model.find({
      ...query,
      ...{ isActive: { $ne: false } },
    }).sort({ _id: sort === 'asc' ? 1 : -1 });
  }

  async insertMany(body: any) {
    try {
      return await this.Model.insertMany(body);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  async create(body: any) {
    try {
      return (await this.Model.create(body));
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  async findById(id: string) {
    try {
      return await this.Model.findById(id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  async findOne(query: any) {
    try {
      return await this.Model.findOne({
        ...query,
        ...{ isActive: { $ne: false } },
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  async updateById(id: string, body: any) {
    try {
      const result = await this.Model.updateOne({ _id: id }, {"$set":body});
      if (result) {
        return await this.Model.findById(id);
      } else {
        return result;
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  async update(conditions: any, body: any) {
    try {
      return await this.Model.updateOne(conditions, {"$set":body});
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  async delete(id: string) {
    try {
      return await this.Model.deleteOne({ _id: id });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }
  async deActivate(id: string) {
    try {
      return await this.Model.updateOne({ _id: id }, { isActive: false });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  async deleteOne(conditions: string) {
    try {
      return await this.Model.deleteOne(conditions);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }
}