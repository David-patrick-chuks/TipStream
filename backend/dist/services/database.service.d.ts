import mongoose from 'mongoose';
declare class DatabaseService {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseService;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionStatus(): boolean;
    getConnection(): typeof mongoose.connection;
}
export declare const databaseService: DatabaseService;
export {};
//# sourceMappingURL=database.service.d.ts.map