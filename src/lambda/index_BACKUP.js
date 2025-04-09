// src/lambda/index.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

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
    
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    console.log('バケット内のオブジェクト:', JSON.stringify(listedObjects.Contents || [], null, 2));
    
    // 2. サンプルテキストファイルをアップロード
    const currentTime = new Date().toISOString();
    const uploadParams = {
      Bucket: bucketName,
      Key: `sample-${currentTime}.txt`,
      Body: `これはLambda関数によって生成されたファイルです。\n作成時刻: ${currentTime}\nイベント: ${JSON.stringify(event)}`,
      ContentType: 'text/plain; charset=utf-8'
    };
    
    const uploadResult = await s3.putObject(uploadParams).promise();
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
