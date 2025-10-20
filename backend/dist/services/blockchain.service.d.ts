export declare class BlockchainService {
    private publicClient;
    private walletClient;
    private contractAddress;
    private contractABI;
    constructor();
    createPost(content: string, privateKey: string): Promise<string>;
    sendTip(postId: bigint, amount: string, privateKey: string): Promise<string>;
    enableAutoTip(postId: bigint, threshold: bigint, amount: string, privateKey: string): Promise<string>;
    executeAutoTip(postId: bigint, autoTipIndex: bigint, privateKey: string): Promise<string>;
    getPost(postId: bigint): Promise<any>;
    getEvents(eventName: string, fromBlock?: bigint, toBlock?: bigint): Promise<any[]>;
    formatEther(value: bigint): string;
    parseEther(value: string): bigint;
}
//# sourceMappingURL=blockchain.service.d.ts.map