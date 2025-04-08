// src/lambda/index.js
// AWS SDK v3の形式で必要なクライアントだけをインポート
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');

// S3クライアントの初期化
const s3Client = new S3Client();

exports.handler = async function(event, context) {
  console.log("イベントを受信しました:", JSON.stringify(event, null, 2));
  
  // 環境変数からバケット名を取得
  const bucketName = process.env.BUCKET_NAME;
  
  try {
    // 1. バケット内のオブジェクトをリストアップ
    const listParams = {
      Bucket: bucketName,
      MaxKeys: 10
    };
    
    const listedObjectsCommand = new ListObjectsV2Command(listParams);
    const listedObjects = await s3Client.send(listedObjectsCommand);
    console.log('バケット内のオブジェクト:', JSON.stringify(listedObjects.Contents || [], null, 2));
    
    // 2. サンプルテキストファイルをアップロード
    const currentTime = new Date().toISOString();
    const uploadParams = {
      Bucket: bucketName,
      Key: `sample-${currentTime}.txt`,
      Body: `これはLambda関数によって生成されたファイルです。\n作成時刻: ${currentTime}\nイベント: ${JSON.stringify(event)}`,
      ContentType: 'text/plain; charset=utf-8'
    };
    
    const putCommand = new PutObjectCommand(uploadParams);
    const uploadResult = await s3Client.send(putCommand);
    console.log('アップロード結果:', uploadResult);
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "S3操作が成功しました",
        bucketName: bucketName,
        listedObjects: listedObjects.Contents || [],
        uploadedFile: uploadParams.Key
      })
    };
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "S3操作中にエラーが発生しました",
        error: error.message
      })
    };
  }
};