#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyLambdaS3Stack } from '../lib/my-lambda-s3-app-stack';

const app = new cdk.App();
new MyLambdaS3Stack(app, 'MyLambdaS3Stack', {
  /* 環境を明示的に指定することもできます
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  }
  */
});