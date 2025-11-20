/**
 * スリーピン画像生成ガイドスクリプト
 *
 * このスクリプトは画像生成AIのプロンプトを出力します。
 * 各プロンプトをChatGPT、Midjourney、Stable Diffusionなどの
 * 画像生成AIに入力して画像を生成してください。
 */

import { getAllPrompts } from '../src/constants/SleepinPrompts';

console.log('='.repeat(80));
console.log('スリーピン画像生成ガイド');
console.log('='.repeat(80));
console.log();
console.log('以下のプロンプトを使用して、9種類のスリーピン画像を生成してください。');
console.log('生成した画像は assets/sleepin/ フォルダに保存してください。');
console.log();

const prompts = getAllPrompts();

prompts.forEach((p, index) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`画像 ${index + 1}/9`);
  console.log(`${'='.repeat(80)}`);
  console.log(`ファイル名: ${p.fileName}`);
  console.log(`説明: ${p.description}`);
  console.log(`睡眠の質: ${p.sleepQuality} | 成長段階: ${p.growthStage}`);
  console.log(`\nプロンプト:`);
  console.log(`-`.repeat(80));
  console.log(p.prompt);
  console.log(`-`.repeat(80));
  console.log();
});

console.log('\n' + '='.repeat(80));
console.log('画像生成後の手順');
console.log('='.repeat(80));
console.log();
console.log('1. 各プロンプトをコピーして画像生成AIに入力');
console.log('2. 生成された画像をダウンロード');
console.log('3. ファイル名を上記の通りにリネーム');
console.log('4. assets/sleepin/ フォルダに配置');
console.log('5. 画像サイズは正方形（推奨: 512x512 または 1024x1024）');
console.log('6. 背景は透過PNG推奨（または白/淡い色背景）');
console.log();
console.log('画像生成AI推奨サービス:');
console.log('- ChatGPT (DALL-E 3): https://chat.openai.com/');
console.log('- Midjourney: https://www.midjourney.com/');
console.log('- Stable Diffusion: https://stablediffusionweb.com/');
console.log();

// JSONファイルとして出力（バッチ処理用）
console.log('='.repeat(80));
console.log('JSON形式でも出力します（APIバッチ処理用）');
console.log('='.repeat(80));
console.log();
console.log(JSON.stringify(prompts, null, 2));
