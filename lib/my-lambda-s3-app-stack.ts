import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3'; // S3モジュールをインポート
import * as iam from 'aws-cdk-lib/aws-iam'; // IAMモジュールをインポート
import * as path from 'path';

export class MyLambdaS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケットの作成
    const testBucket = new s3.Bucket(this, 'TestBucket', {
      // バケット名を指定（オプション）。指定しない場合はCloudFormationによって一意の名前が生成されます
      // bucketName: 'my-test-bucket-name', 
      
      // 様々なバケットプロパティを設定できます
      removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にバケットも削除する
      autoDeleteObjects: true, // バケット削除時に中のオブジェクトも自動削除
      versioned: false, // バージョニングを無効化
      publicReadAccess: false, // パブリックアクセスをブロック
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // すべてのパブリックアクセスをブロック
      
      // バケットライフサイクルルールの例（オプション）
      lifecycleRules: [
        {
          id: 'DeleteAfter30Days',
          expiration: cdk.Duration.days(30),
          enabled: true,
        },
      ],
    });

    // Lambda関数の作成
    const myFunction = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/lambda')),
      environment: {
        BUCKET_NAME: testBucket.bucketName, // 環境変数にバケット名を設定
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Lambda関数にS3バケットへのアクセス権限を付与
    testBucket.grantReadWrite(myFunction);

    // または詳細な権限設定が必要な場合は以下のようにIAMポリシーを明示的に追加することもできます
    /*
    myFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [testBucket.arnForObjects('*')],
    }));
    */

    // スタックの出力値の設定
    new cdk.CfnOutput(this, 'BucketName', {
      value: testBucket.bucketName,
      description: '作成されたS3バケットの名前',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: myFunction.functionName,
      description: '作成されたLambda関数の名前',
    });
  }
}