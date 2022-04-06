"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require("@solana/web3.js"), Connection = _a.Connection, sendAndConfirmTransaction = _a.sendAndConfirmTransaction, Keypair = _a.Keypair, Transaction = _a.Transaction, SystemProgram = _a.SystemProgram, PublicKey = _a.PublicKey, TransactionInstruction = _a.TransactionInstruction, pubkey = _a.pubkey, SYSVAR_RENT_PUBKEY = _a.SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL = _a.LAMPORTS_PER_SOL, AccountData = _a.AccountData, AccountMeta = _a.AccountMeta;
var borsh_1 = require("borsh");
var buffer_1 = require("buffer");
var BN = require('BN.js');
var RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
var commitment = 'confirmed';
var connection = new Connection(RPC_ENDPOINT_URL, commitment);
var program_id = new PublicKey("6wNDDbfhqyY8Nm8H2dzAPywjt2D7VKfBzKuSjE3pcgVr");
// MY WALLET SETTING
var id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
//const id_json_path = require('os').homedir() + "/.config/solana/my-keypair.json";
//const id_json_path = require('os').homedir() + "/.config/solana/id.json";
var secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
var wallet = Keypair.fromSecretKey(secret);
var feePayer = Keypair.generate();
var userInputIx = function (i, user, userInfo) {
    return new TransactionInstruction({
        keys: [
            {
                pubkey: user,
                isSigner: true,
                isWritable: false,
            },
            {
                pubkey: userInfo,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: SYSVAR_RENT_PUBKEY,
                isSigner: false,
                isWritable: false,
            }
        ],
        data: buffer_1.Buffer.concat([buffer_1.Buffer.from(new Uint8Array([0])), i]),
        programId: program_id,
    });
};
// Flexible class that takes properties and imbues them
// to the object instance
var Assignable = /** @class */ (function () {
    function Assignable(properties) {
        var _this = this;
        Object.keys(properties).map(function (key) {
            return (_this[key] = properties[key]);
        });
    }
    return Assignable;
}());
// Our instruction payload vocabulary
var Payload = /** @class */ (function (_super) {
    __extends(Payload, _super);
    function Payload() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Payload;
}(Assignable));
var DeserializedAccount = /** @class */ (function (_super) {
    __extends(DeserializedAccount, _super);
    function DeserializedAccount() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DeserializedAccount;
}(Assignable));
// Borsh needs a schema describing the payload
var payloadSchema = new Map([
    [
        Payload,
        {
            kind: "struct",
            fields: [
                ["name", "string"],
            ]
        }
    ]
]);
var accountSchema = new Map([
    [
        DeserializedAccount,
        {
            kind: "struct",
            fields: [
                ["initialized", "u8"],
                ["name", "string"],
            ]
        }
    ]
]);
function main(userName) {
    return __awaiter(this, void 0, void 0, function () {
        var tx, userInfo, payload, userSerBuf, PayloadCopy, ix, signers, txid, userAccount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Program id: " + program_id.toBase58());
                    console.log("Fee payer: " + feePayer.publicKey);
                    tx = new Transaction();
                    return [4 /*yield*/, PublicKey.findProgramAddress([feePayer.publicKey.toBuffer()], program_id)];
                case 1:
                    userInfo = (_a.sent())[0];
                    console.log("PDA: " + userInfo);
                    payload = new Payload({
                        name: userName
                    });
                    userSerBuf = buffer_1.Buffer.from((0, borsh_1.serialize)(payloadSchema, payload));
                    console.log("Serialized data: " + userSerBuf);
                    PayloadCopy = (0, borsh_1.deserialize)(payloadSchema, Payload, userSerBuf);
                    console.log(PayloadCopy);
                    console.log("creating init instruction");
                    ix = userInputIx(userSerBuf, feePayer.publicKey, userInfo);
                    tx.add(ix);
                    return [4 /*yield*/, connection.getBalance(feePayer.publicKey)];
                case 2:
                    if (!((_a.sent()) < 1.0)) return [3 /*break*/, 4];
                    console.log("Requesting Airdrop of 1 SOL...");
                    return [4 /*yield*/, connection.requestAirdrop(feePayer.publicKey, 2e9)];
                case 3:
                    _a.sent();
                    console.log("Airdrop received");
                    _a.label = 4;
                case 4:
                    signers = [feePayer];
                    console.log("sending tx");
                    return [4 /*yield*/, sendAndConfirmTransaction(connection, tx, signers, {
                            skipPreflight: true,
                            preflightCommitment: "confirmed",
                            confirmation: "confirmed",
                        })];
                case 5:
                    txid = _a.sent();
                    console.log("tx signature " + txid);
                    console.log("https://explorer.solana.com/tx/".concat(txid, "?cluster=devnet"));
                    // sleep to allow time to update
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 6:
                    // sleep to allow time to update
                    _a.sent();
                    return [4 /*yield*/, connection.getAccountInfo(userInfo)];
                case 7:
                    userAccount = _a.sent();
                    if (userAccount === null || userAccount.data.length === 0) {
                        console.log("User state account has not been initialized properly");
                        process.exit(1);
                    }
                    else {
                        console.log(userAccount.data);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var msg = "hello my name is Ivan. Im currently learning solana development and loving every minute of it! Sol is going to the moon!! I'm not sure what else to write, this needs to be 180 char";
var msg1 = "hey this is another test";
main(msg1)
    .then(function () {
    console.log("Success");
})
    .catch(function (e) {
    console.error(e);
});
