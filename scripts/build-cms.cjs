const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
require('./build-preview.cjs');
(async()=>{
 const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),client=path.join(dist,'client'),server=path.join(dist,'server');
 fs.mkdirSync(client,{recursive:true});fs.mkdirSync(server,{recursive:true});
 for(const entry of fs.readdirSync(dist,{withFileTypes:true})){if(['client','server','.openai','_appgen_meta'].includes(entry.name))continue;fs.cpSync(path.join(dist,entry.name),path.join(client,entry.name),{recursive:true});}
 await esbuild.build({entryPoints:[path.join(root,'worker/index.mjs')],outfile:path.join(server,'index.js'),bundle:true,format:'esm',target:'es2022',platform:'browser'});
 const hosting=JSON.parse(fs.readFileSync(path.join(root,'.openai/hosting.json'),'utf8'));fs.mkdirSync(path.join(dist,'.openai'),{recursive:true});fs.writeFileSync(path.join(dist,'.openai/hosting.json'),JSON.stringify(hosting));
 fs.cpSync(path.join(root,'drizzle'),path.join(dist,'.openai/drizzle'),{recursive:true});
 fs.writeFileSync(path.join(server,'wrangler.json'),JSON.stringify({name:'nemo-cms',main:'index.js',compatibility_date:'2026-05-22',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true,html_handling:'none'},d1_databases:[{binding:'DB',database_name:'nemo-cms',database_id:'00000000-0000-4000-8000-000000000000'}],r2_buckets:[{binding:'BUCKET',bucket_name:'nemo-media'}]},null,2));
 console.log('Built CMS Worker and existing website assets.');
})().catch(error=>{console.error(error);process.exitCode=1;});
