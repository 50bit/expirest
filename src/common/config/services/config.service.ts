import { parse, DotenvParseOutput } from 'dotenv';
import { readFileSync } from 'fs';
import * as Joi from 'joi';
export class ConfigService {
  private readonly envConfig: DotenvParseOutput;

  constructor(filePath: string) {

    if(filePath.includes('undefined')){
      this.envConfig = this.validateInput({
        MONGODB_URI: 'mongodb://localhost/expirest',
        DATABASE_USERNAME: '',
        DATABASE_PASSWORD: '',
        DATABASE_NAME: 'expirest',
        JWT_SECRET: 'JzVBOnK5yc',
        TIMEOUT: '1000000',
        PORT: '3000',
        isDev: 'true',
        JWT_EXPIRATION_TIME: '365d',
        MAIL_USER: 'expirest.eg@gmail.com',
        MAIL_PASS: 'mmsrftphijrlgfgf'
      });
    }else{
      const parsedConfig = parse(readFileSync(filePath));
      this.envConfig = this.validateInput(parsedConfig);
    }
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(parsedConfig: DotenvParseOutput) {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(...['development', 'production', 'test', 'provision'])
        .default('development'),
      PORT: Joi.number()
    });

    const validationOptions: Joi.ValidationOptions = { allowUnknown: true };

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(
      parsedConfig,
      validationOptions,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  /**
   * Generic getter
   */
  get(key: string) {
    return this.envConfig[key];
  }

  /**
   * Getters for each environment variable
   */
  public get isDev() {
    return this.envConfig.NODE_ENV === 'development';
  }

  public get isProd() {
    return this.envConfig.NODE_ENV === 'production';
  }

  public get isTest() {
    return this.envConfig.NODE_ENV === 'test';
  }

  public get mongodbURI() {
    return this.envConfig.MONGODB_URI;
  }

  public get mongodbName() {
    return this.envConfig.MONGODB_URI;
  }

  public get databaseType() {
    return this.envConfig.DATABASE_TYPE;
  }

  public get databaseHost() {
    return this.envConfig.DATABASE_HOST;
  }

  public get databasePort() {
    return Number(this.envConfig.DATABASE_PORT);
  }

  public get databaseUsername() {
    return this.envConfig.DATABASE_USERNAME;
  }

  public get databasePassword() {
    return this.envConfig.DATABASE_PASSWORD;
  }

  public get databaseName() {
    return this.envConfig.DATABASE_NAME;
  }

  public get jwtSecret() {
    return this.envConfig.JWT_SECRET;
  }

  public get timeout() {
    return this.envConfig.TIMEOUT;
  }
}