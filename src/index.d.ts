/// <reference types="ledgerhq__hw-transport" />
/// <reference types="node" />
import Transport from '@ledgerhq/hw-transport';
export declare class ThorLedger {
    private transport;
    constructor(transport: Transport);
    getAccount(path: string, boolDisplay?: boolean, boolChaincode?: boolean, statusCodes?: Array<StatusCodes>): Promise<Account>;
    signTransaction(path: string, rawTxHex: string): Promise<Buffer>;
    private splitPath;
}
export interface Account {
    publicKey: string;
    address: string;
    chainCode?: string;
}
export declare enum StatusCodes {
    PIN_REMAINING_ATTEMPTS = 25536,
    INCORRECT_LENGTH = 26368,
    COMMAND_INCOMPATIBLE_FILE_STRUCTURE = 27009,
    SECURITY_STATUS_NOT_SATISFIED = 27010,
    CONDITIONS_OF_USE_NOT_SATISFIED = 27013,
    INCORRECT_DATA = 27264,
    NOT_ENOUGH_MEMORY_SPACE = 27268,
    REFERENCED_DATA_NOT_FOUND = 27272,
    FILE_ALREADY_EXISTS = 27273,
    INCORRECT_P1_P2 = 27392,
    INS_NOT_SUPPORTED = 27904,
    CLA_NOT_SUPPORTED = 28160,
    TECHNICAL_PROBLEM = 28416,
    OK = 36864,
    MEMORY_PROBLEM = 37440,
    NO_EF_SELECTED = 37888,
    INVALID_OFFSET = 37890,
    FILE_NOT_FOUND = 37892,
    INCONSISTENT_FILE = 37896,
    ALGORITHM_NOT_SUPPORTED = 38020,
    INVALID_KCV = 38021,
    CODE_NOT_INITIALIZED = 38914,
    ACCESS_CONDITION_NOT_FULFILLED = 38916,
    CONTRADICTION_SECRET_CODE_STATUS = 38920,
    CONTRADICTION_INVALIDATION = 38928,
    CODE_BLOCKED = 38976,
    MAX_VALUE_REACHED = 38992,
    GP_AUTH_FAILED = 25344,
    LICENSING = 28482,
    HALTED = 28586
}
