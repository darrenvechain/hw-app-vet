import Transport from '@ledgerhq/hw-transport';
export class ThorLedger {
    private transport: Transport;
    constructor(transport: Transport) {
        this.transport = transport;
    }

    public async getAppConfiguration(): Promise<Buffer> {
        let response = await this.transport
            .send(
                0xE0,
                0x06,
                0x00,
                0x00,
                Buffer.alloc(0),
                [StatusCodes.OK]
            )
        return response.slice(0, 4)
    }

    public async getAccount(
        path: string,
        boolDisplay?: boolean,
        boolChaincode?: boolean,
        statusCodes: Array<StatusCodes> = [StatusCodes.OK]
    ): Promise<Account> {
        let paths = this.splitPath(path);
        let buffer = Buffer.alloc(1 + paths.length * 4);
        buffer[0] = paths.length;
        paths.forEach((element, index) => {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        let response = await this.transport
            .send(
                0xE0,
                0x02,
                boolDisplay ? 0x01 : 0x00,
                boolChaincode ? 0x01 : 0x00,
                buffer,
                statusCodes
            )

        let publicKeyLength = response[0];
        let addressLength = response[1 + publicKeyLength];
        let acc: Account = {
            publicKey: response.slice(1, 1 + publicKeyLength).toString("hex"),
            address: "0x" + response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString("ascii")
        };
        if (boolChaincode) {
            acc.chainCode = response
                .slice(
                    1 + publicKeyLength + 1 + addressLength,
                    1 + publicKeyLength + 1 + addressLength + 32
                )
                .toString("hex");
        }
        return acc;
    }

    public async signTransaction(path: string, rawTx: Buffer): Promise<Buffer> {
        let paths = this.splitPath(path);
        let offset = 0;
        let toSend = [];
        while (offset !== rawTx.length) {
            let maxChunkSize = offset === 0 ? 255 - 1 - paths.length * 4 : 255;
            let chunkSize =
                offset + maxChunkSize > rawTx.length
                    ? rawTx.length - offset
                    : maxChunkSize;
            let buffer = Buffer.alloc(
                offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize
            );
            if (offset === 0) {
                buffer[0] = paths.length;
                paths.forEach((element, index) => {
                    buffer.writeUInt32BE(element, 1 + 4 * index);
                });
                rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
            } else {
                rawTx.copy(buffer, 0, offset, offset + chunkSize);
            }
            toSend.push(buffer);
            offset += chunkSize;
        }
        let response: Buffer;
        for (let i = 0; i < toSend.length; i++) {
            let data = toSend[i];
            response = await this.transport.send(0xE0, 0x04, i === 0 ? 0x00 : 0x80, 0x00, data, [StatusCodes.OK]);
        }
        if (response.length < 65) {
            throw new Error('invalid signature')
        }
        return response.slice(0, 65);
    }

    public async signMessage(path: string, message: Buffer): Promise<Buffer> {
        let paths = this.splitPath(path);
        let offset = 0;
        let toSend = [];
        while (offset !== message.length) {
            let maxChunkSize = offset === 0 ? 255 - 1 - paths.length * 4 - 4 : 255;
            let chunkSize =
                offset + maxChunkSize > message.length
                    ? message.length - offset
                    : maxChunkSize;
            let buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + 4 + chunkSize : chunkSize);
            if (offset === 0) {
                buffer[0] = paths.length;
                paths.forEach((element, index) => {
                    buffer.writeUInt32BE(element, 1 + 4 * index);
                });
                buffer.writeUInt32BE(message.length, 1 + 4 * paths.length);
                message.copy(buffer, 1 + 4 * paths.length + 4, offset, offset + chunkSize);
            } else {
                message.copy(buffer, 0, offset, offset + chunkSize);
            }
            toSend.push(buffer);
            offset += chunkSize;
        }
        let response: Buffer;
        for (let i = 0; i < toSend.length; i++) {
            let data = toSend[i];
            response = await this.transport.send(0xE0, 0x08, i === 0 ? 0x00 : 0x80, 0x00, data, [StatusCodes.OK]);
        }
        if (response.length < 65) {
            throw new Error('invalid signature')
        }
        return response.slice(0, 65);
    }

    public async signHash(path: string, hash: Buffer): Promise<Buffer> {
        if (hash.length != 32) {
            throw new Error('hash: must be 32 bytes')
        }
        let paths = this.splitPath(path);
        let buffer = Buffer.alloc(1 + paths.length * 4 + 32);
        buffer[0] = paths.length;
        paths.forEach((element, index) => {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        hash.copy(buffer, 1 + 4 * paths.length, 0, 32);
        let response = await this.transport.send(0xE0, 0x09, 0x00, 0x00, buffer, [StatusCodes.OK]);
        if (response.length < 65) {
            throw new Error('invalid signature')
        }
        return response.slice(0, 65);
    }

    private splitPath(path: string): number[] {
        let result: any = [];
        let components = path.split("/");
        components.forEach(element => {
            let number = parseInt(element, 10);
            if (isNaN(number)) {
                return; // FIXME shouldn't it throws instead?
            }
            if (element.length > 1 && element[element.length - 1] === "'") {
                number += 0x80000000;
            }
            result.push(number);
        });
        return result;
    }

}

export interface Account {
    publicKey: string,
    address: string,
    chainCode?: string
}
export enum StatusCodes {
    PIN_REMAINING_ATTEMPTS = 0x63c0,
    INCORRECT_LENGTH = 0x6700,
    COMMAND_INCOMPATIBLE_FILE_STRUCTURE = 0x6981,
    SECURITY_STATUS_NOT_SATISFIED = 0x6982,
    CONDITIONS_OF_USE_NOT_SATISFIED = 0x6985,
    INCORRECT_DATA = 0x6a80,
    NOT_ENOUGH_MEMORY_SPACE = 0x6a84,
    REFERENCED_DATA_NOT_FOUND = 0x6a88,
    FILE_ALREADY_EXISTS = 0x6a89,
    INCORRECT_P1_P2 = 0x6b00,
    INS_NOT_SUPPORTED = 0x6d00,
    CLA_NOT_SUPPORTED = 0x6e00,
    TECHNICAL_PROBLEM = 0x6f00,
    OK = 0x9000,
    MEMORY_PROBLEM = 0x9240,
    NO_EF_SELECTED = 0x9400,
    INVALID_OFFSET = 0x9402,
    FILE_NOT_FOUND = 0x9404,
    INCONSISTENT_FILE = 0x9408,
    ALGORITHM_NOT_SUPPORTED = 0x9484,
    INVALID_KCV = 0x9485,
    CODE_NOT_INITIALIZED = 0x9802,
    ACCESS_CONDITION_NOT_FULFILLED = 0x9804,
    CONTRADICTION_SECRET_CODE_STATUS = 0x9808,
    CONTRADICTION_INVALIDATION = 0x9810,
    CODE_BLOCKED = 0x9840,
    MAX_VALUE_REACHED = 0x9850,
    GP_AUTH_FAILED = 0x6300,
    LICENSING = 0x6f42,
    HALTED = 0x6faa
}


