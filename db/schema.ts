import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const admins=sqliteTable('cms_admin',{id:text('id').primaryKey(),email:text('email').notNull(),password:text('password').notNull(),salt:text('salt').notNull(),platformId:text('platform_id').notNull()});
export const sessions=sqliteTable('cms_sessions',{token:text('token').primaryKey(),expires:integer('expires').notNull()});
export const posts=sqliteTable('cms_posts',{id:text('id').primaryKey(),type:text('type').notNull(),status:text('status').notNull(),title:text('title').notNull(),payload:text('payload').notNull(),published:text('published'),created:integer('created').notNull(),updated:integer('updated').notNull()});
export const attempts=sqliteTable('cms_attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),until:integer('until').notNull()});
export const media=sqliteTable('cms_media',{id:text('id').primaryKey(),mime:text('mime').notNull(),size:integer('size').notNull(),created:integer('created').notNull()});
