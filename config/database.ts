/**
 * @file database.ts
 * @description MySQL 8.0+ Connection Manager with graceful Demo Mode fallback.
 * Built for KIT CSE DBMS AAT Project by Jeslin J (711525BCS052).
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export const dbConfig: DBConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_performance_db',
};

let pool: mysql.Pool | null = null;
let isLiveMySQL = false;
let connectionError: string | null = null;

// Initialize MySQL pool
export async function initDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      decimalNumbers: true,
    });

    // Test the connection with a quick query
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 + 1 AS result');
    connection.release();

    isLiveMySQL = true;
    connectionError = null;
    console.log(`[Database] Successfully connected to live MySQL 8.0 database at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return {
      success: true,
      message: `Connected to live MySQL 8.0 at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    };
  } catch (err: any) {
    isLiveMySQL = false;
    connectionError = err.message || 'Unable to connect to MySQL';
    console.warn(`[Database] Live MySQL connection failed (${connectionError}). Engaging Demo Mode with seed data.`);
    return {
      success: false,
      message: connectionError || 'Unable to connect to MySQL',
    };
  }
}

export function isConnectedToLiveMySQL(): boolean {
  return isLiveMySQL;
}

export function getConnectionError(): string | null {
  return connectionError;
}

export function getMySQLPool(): mysql.Pool | null {
  return pool;
}
